/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Rect2, Vec2 } from '@app/core/utils';
import { Diagram } from './diagram';
import { Transform } from './transform';

const ROTATE_SNAP = 90 / 4;
const MOVE_SNAP_GRID = 10;
const MOVE_SNAP_SHAPE = 5;
const RESIZE_SNAP_SHAPE = 5;
const RESIZE_SNAP_GRID = 10;
const RESIZE_MINIMUM = 1;

export type SnapMode = 'None' | 'Grid' | 'Shapes';
export type SnapSide = 'Left' | 'Right' | 'Top' | 'Bottom';

const EMPTY_SET: ReadonlySet<string> = new Set<string>();

export type SnapResult = {
    snapX?: SnapLine;
    snapY?: SnapLine;
    delta: Vec2;
};

export type SnapLine = {
    // The actual position of the line.
    value: number;

    // The side.
    side?: SnapSide;

    // The difference to a side.
    diff?: { x: number; y: number };

    // The positions for space snap lines.
    positions?: { x: number; y: number }[];

    // True, if the snap line is for a center.
    isCenter?: boolean;

    // The distances it refers to.
    gridItem?: GridItem;

    // The side of the grid to the next shape.
    gridSide?: 'Left' | 'Right' | 'Top' | 'Bottom';
};

type GridItem = {
    // The distance to the next element at the left side and the index.
    leftDistance: number;
    leftIndex: number;

    // The distance to the next element at the right side and the index.
    rightDistance: number;
    rightIndex: number;

    // The distance to the next element at the top side and the index.
    topDistance: number;
    topIndex: number;

    // The distance to the next element at the bottom side and the index.
    bottomDistance: number;
    bottomIndex: number;

    // The bounds.
    aabb: Rect2;
};

export class SnapManager {
    private currentDiagram?: Diagram;
    private currentView?: Vec2;
    private currentZoom = 1;
    private grid?: GridItem[];
    private xLines?: SnapLine[];
    private yLines?: SnapLine[];
    private ignored?: ReadonlySet<string>;

    public prepare(diagram: Diagram, view: Vec2) {
        this.currentDiagram = diagram;
        this.currentView = view;

        this.xLines = undefined;
        this.yLines = undefined;
        this.grid = undefined;
        this.ignored = undefined;
    }

    public setZoom(zoom: number) {
        // The snap lines do not depend on the zoom, therefore we do not invalidate them.
        this.currentZoom = zoom > 0 ? zoom : 1;
    }

    public snapRotating(transform: Transform, delta: number, snapMode: SnapMode): number {
        const oldRotation = transform.rotation.degree;

        const total = oldRotation + delta;

        if (snapMode !== 'None') {
            return MathHelper.roundToMultipleOf(total, ROTATE_SNAP) - oldRotation;
        } else {
            return MathHelper.roundToMultipleOf(total, 1) - oldRotation;
        }
    }

    public snapResizing(transform: Transform, delta: Vec2, snapMode: SnapMode, xMode = 1, yMode = 1, ignoreList?: Set<string>): SnapResult {
        const result: SnapResult = { delta };

        let dw = delta.x;
        let dh = delta.y;

        const isRotated = transform.rotation.degree !== 0;

        if (snapMode === 'Shapes' && !isRotated) {
            const aabb = transform.aabb;

            const { xLines, yLines } = this.getSnapLines(ignoreList);

            // The threshold is defined in screen pixels.
            const threshold = RESIZE_SNAP_SHAPE / this.currentZoom;

            if (xMode !== 0) {
                // Only the edge that is dragged is moved.
                const edge = xMode > 0 ? aabb.right + dw : aabb.left - dw;

                const line = findResizeLine(xLines, edge, threshold);

                if (line) {
                    dw = xMode > 0 ? line.value - aabb.right : aabb.left - line.value;

                    result.snapX = line;
                }
            }

            if (yMode !== 0) {
                const edge = yMode > 0 ? aabb.bottom + dh : aabb.top - dh;

                const line = findResizeLine(yLines, edge, threshold);

                if (line) {
                    dh = yMode > 0 ? line.value - aabb.bottom : aabb.top - line.value;

                    result.snapY = line;
                }
            }
        } else if (snapMode === 'Grid' && !isRotated) {
            const aabb = transform.aabb;

            // Snap the dragged edge to the grid, not the size, so that the shape stays aligned to the grid.
            if (xMode > 0) {
                dw = MathHelper.roundToMultipleOf(aabb.right + dw, RESIZE_SNAP_GRID) - aabb.right;
            } else if (xMode < 0) {
                dw = aabb.left - MathHelper.roundToMultipleOf(aabb.left - dw, RESIZE_SNAP_GRID);
            }

            if (yMode > 0) {
                dh = MathHelper.roundToMultipleOf(aabb.bottom + dh, RESIZE_SNAP_GRID) - aabb.bottom;
            } else if (yMode < 0) {
                dh = aabb.top - MathHelper.roundToMultipleOf(aabb.top - dh, RESIZE_SNAP_GRID);
            }
        } else if (snapMode !== 'None') {
            // The edges of rotated shapes cannot be aligned, therefore we snap the size instead.
            dw = MathHelper.roundToMultipleOf(transform.size.x + dw, RESIZE_SNAP_GRID) - transform.size.x;
            dh = MathHelper.roundToMultipleOf(transform.size.y + dh, RESIZE_SNAP_GRID) - transform.size.y;
        }

        if (transform.size.x + dw < RESIZE_MINIMUM) {
            dw = RESIZE_MINIMUM - transform.size.x;

            // The snap line is not reached anymore.
            result.snapX = undefined;
        }

        if (transform.size.y + dh < RESIZE_MINIMUM) {
            dh = RESIZE_MINIMUM - transform.size.y;

            // The snap line is not reached anymore.
            result.snapY = undefined;
        }

        result.delta = new Vec2(dw, dh);

        return result;
    }

    public snapMoving(transform: Transform, delta: Vec2, snapMode: SnapMode, ignoreList?: Set<string>): SnapResult {
        const result: SnapResult = { delta };

        const aabb = transform.aabb;

        let x = aabb.x + delta.x;
        let y = aabb.y + delta.y;

        if (snapMode === 'Shapes') {
            const { xLines, yLines, grid } = this.getSnapLines(ignoreList);

            // The threshold is defined in screen pixels.
            const threshold = MOVE_SNAP_SHAPE / this.currentZoom;

            // Compute the new center positions once.
            const cx = x + aabb.width * 0.5;
            const cy = y + aabb.height * 0.5;

            // Distance lines have a bounds that must be close.
            const snapX = findMoveLine(xLines, x, aabb.width, threshold, bounds => isOverlapY(cy, aabb.height, bounds));

            if (snapX) {
                x = snapX.start;

                result.snapX = enrichLine(snapX.line, grid);
            }

            const snapY = findMoveLine(yLines, y, aabb.height, threshold, bounds => isOverlapX(cx, aabb.width, bounds));

            if (snapY) {
                y = snapY.start;

                result.snapY = enrichLine(snapY.line, grid);
            }
        } else if (snapMode === 'Grid') {
            x = MathHelper.roundToMultipleOf(x, MOVE_SNAP_GRID);
            y = MathHelper.roundToMultipleOf(y, MOVE_SNAP_GRID);
        }

        result.delta = new Vec2(x - aabb.x, y - aabb.y);

        return result;
    }

    public getSnapLines(ignoreList?: Set<string>) {
        const ignore = ignoreList || EMPTY_SET;

        // The lines depend on the ignored items, therefore we have to recompute them when the list changes.
        if (this.xLines && this.yLines && this.grid && this.ignored && areSameSets(this.ignored, ignore)) {
            return { xLines: this.xLines, yLines: this.yLines, grid: this.grid };
        }

        const { currentDiagram, currentView } = this;

        const xLines: SnapLine[] = this.xLines = [];
        const yLines: SnapLine[] = this.yLines = [];

        this.ignored = ignore;

        if (!currentDiagram || !currentView) {
            // This should actually never happen, because we call prepare first.
            const grid = this.grid = [];

            return { xLines, yLines, grid: grid };
        }

        // Compute the bounding boxes once.
        const bounds = Array.from(currentDiagram.items.values).filter(x => !ignore.has(x.id)).map(x => x.bounds(currentDiagram).aabb);

        const grid = this.grid = computeGrid(bounds);

        xLines.push({ value: 0 });
        xLines.push({ value: currentView.x });
        xLines.push({ value: currentView.x * 0.5, isCenter: true });

        yLines.push({ value: 0 });
        yLines.push({ value: currentView.y });
        yLines.push({ value: currentView.y * 0.5, isCenter: true });

        for (const aabb of bounds) {
            xLines.push({ value: aabb.left, side: 'Left' });
            xLines.push({ value: aabb.right, side: 'Right' });
            xLines.push({ value: aabb.cx, isCenter: true });

            yLines.push({ value: aabb.top, side: 'Top' });
            yLines.push({ value: aabb.bottom, side: 'Bottom' });
            yLines.push({ value: aabb.cy, isCenter: true });
        }

        for (const gridItem of grid) {
            const bound = gridItem.aabb;

            if (gridItem.leftDistance != Number.MAX_VALUE) {
                xLines.push({
                    value: bound.right + gridItem.leftDistance,
                    gridSide: 'Right',
                    gridItem,
                });
            }

            if (gridItem.rightDistance != Number.MAX_VALUE) {
                xLines.push({
                    value: bound.left - gridItem.rightDistance,
                    gridSide: 'Left',
                    gridItem,
                });
            }

            if (gridItem.topDistance != Number.MAX_VALUE) {
                yLines.push({
                    value: bound.bottom + gridItem.topDistance,
                    gridSide: 'Bottom',
                    gridItem,
                });
            }

            if (gridItem.bottomDistance != Number.MAX_VALUE) {
                yLines.push({
                    value: bound.top - gridItem.bottomDistance,
                    gridSide: 'Top',
                    gridItem,
                });
            }
        }

        return { xLines, yLines, grid };
    }

    public getDebugLines(ignoreList?: Set<string>) {
        const { xLines, yLines, grid } = this.getSnapLines(ignoreList);

        for (const line of xLines) {
            enrichLine(line, grid);
        }
        for (const line of yLines) {
            enrichLine(line, grid);
        }

        return { xLines, yLines };
    }
}

function findResizeLine(lines: ReadonlyArray<SnapLine>, edge: number, threshold: number) {
    let bestLine: SnapLine | undefined;
    let bestDistance = Number.MAX_VALUE;

    for (const line of lines) {
        // Do not snap with center lines or distribution lines on resize.
        if (line.isCenter || line.gridSide) {
            continue;
        }

        const distance = Math.abs(edge - line.value);

        // Use the nearest line, not the first line within the threshold.
        if (distance < threshold && distance < bestDistance) {
            bestDistance = distance;
            bestLine = line;
        }
    }

    return bestLine;
}

function findMoveLine(lines: ReadonlyArray<SnapLine>, start: number, size: number, threshold: number, isClose: (bounds: Rect2) => boolean) {
    let bestLine: SnapLine | undefined;
    let bestDistance = Number.MAX_VALUE;
    let bestStart = 0;

    const check = (line: SnapLine, offset: number) => {
        const distance = Math.abs(start + offset - line.value);

        // Use the nearest line, not the first line within the threshold.
        if (distance < threshold && distance < bestDistance) {
            bestDistance = distance;
            bestLine = line;
            bestStart = line.value - offset;
        }
    };

    for (const line of lines) {
        if (line.gridItem && !isClose(line.gridItem.aabb)) {
            continue;
        }

        if (line.isCenter) {
            // Center lines only align centers.
            check(line, size * 0.5);
        } else if (line.gridSide === 'Right' || line.gridSide === 'Bottom') {
            // The shape is placed after the referenced shape, so only the start edge can keep the distance.
            check(line, 0);
        } else if (line.gridSide === 'Left' || line.gridSide === 'Top') {
            // The shape is placed before the referenced shape, so only the end edge can keep the distance.
            check(line, size);
        } else {
            check(line, 0);
            check(line, size);
        }
    }

    if (!bestLine) {
        return undefined;
    }

    return { line: bestLine, start: bestStart };
}

function enrichLine(line: SnapLine | undefined, grid: GridItem[]) {
    if (!line || !line.gridSide || !line.gridItem || line.positions) {
        return line;
    }

    const positions: { x: number; y: number }[] = [];

    // The initial bound to check.
    let current = line.gridItem;

    // Compute the vertical offsets once to save some compute time.
    const x = current.aabb.cx;
    const y = current.aabb.cy;

    switch (line.gridSide) {
        case 'Left': {
            const distance = current.rightDistance;

            // Compute the vertical offset only once to save some compute time.
            line.diff = { x: distance, y: 1 };

            // Travel to the left while the right are the same.
            while (current) {
                positions.push({ x: current.aabb.left - distance, y });

                if (!areSimilar(current.rightDistance, distance)) {
                    break;
                }

                current = grid[current.rightIndex];
            }

            break;
        }

        case 'Right': {
            const distance = current.leftDistance;

            line.diff = { x: distance, y: 1 };

            // Travel to the left while the distances are the same.
            while (current) {
                positions.push({ x: current.aabb.right, y });

                if (!areSimilar(current.leftDistance, distance)) {
                    break;
                }

                current = grid[current.leftIndex];
            }

            break;
        }

        case 'Top': {
            const distance = current.bottomDistance;

            // Compute the vertical offset only once to save some compute time.
            line.diff = { y: distance, x: 1 };

            // Travel to the bottom while the distances are the same.
            while (current) {
                positions.push({ y: current.aabb.top - distance, x });

                if (!areSimilar(current.bottomDistance, distance)) {
                    break;
                }

                current = grid[current.bottomIndex];
            }

            break;
        }

        case 'Bottom': {
            const distance = current.topDistance;

            line.diff = { y: distance, x: 1 };

            // Travel to the top while the distances are the same.
            while (current) {
                positions.push({ y: current.aabb.bottom, x });

                if (!areSimilar(current.topDistance, distance)) {
                    break;
                }

                current = grid[current.topIndex];
            }

            break;
        }
    }

    line.positions = positions;

    return line;
}

function computeGrid(bounds: ReadonlyArray<Rect2>) {
    const grid: GridItem[] = [];

    for (const aabb of bounds) {
        // Search for the minimum distance to the left or right.
        const gridItem: GridItem = {
            aabb,
            bottomDistance: Number.MAX_VALUE,
            bottomIndex: -1,
            leftDistance: Number.MAX_VALUE,
            leftIndex: -1,
            rightDistance: Number.MAX_VALUE,
            rightIndex: -1,
            topDistance: Number.MAX_VALUE,
            topIndex: -1,
        };

        let j = -1;
        for (const other of bounds) {
            j++;

            if (other === aabb) {
                continue;
            }

            if (isOverlapY(other.cy, other.height, aabb)) {
                const dl = aabb.left - other.right;

                // If the distance to the left is positive, the other element is on the left side.
                if (dl > 0 && dl < gridItem.leftDistance) {
                    gridItem.leftDistance = dl;
                    gridItem.leftIndex = j;
                }

                const dr = other.left - aabb.right;

                // If the distance to the right is positive, the other element is on the right side.
                if (dr > 0 && dr < gridItem.rightDistance) {
                    gridItem.rightDistance = dr;
                    gridItem.rightIndex = j;
                }
            }

            if (isOverlapX(other.cx, other.width, aabb)) {
                const dt = aabb.top - other.bottom;

                // If the distance to the right is top, the other element is on the top side.
                if (dt > 0 && dt < gridItem.topDistance) {
                    gridItem.topDistance = dt;
                    gridItem.topIndex = j;
                }

                const db = other.top - aabb.bottom;

                // If the distance to the right is bottom, the other element is on the bottom side.
                if (db > 0 && db < gridItem.bottomDistance) {
                    gridItem.bottomDistance = db;
                    gridItem.bottomIndex = j;
                }
            }
        }

        grid.push(gridItem);
    }

    return grid;
}

function isOverlapX(cx: number, width: number, rhs: Rect2) {
    const minWidth = Math.min(width, rhs.width);

    return Math.abs(cx - rhs.cx) < minWidth * 0.5;
}

function isOverlapY(cy: number, height: number, rhs: Rect2) {
    const minHeight = Math.min(height, rhs.height);

    return Math.abs(cy - rhs.cy) < minHeight * 0.5;
}

function areSimilar(lhs: number, rhs: number) {
    const d = Math.abs(lhs - rhs);

    return d < 1;
}

function areSameSets(lhs: ReadonlySet<string>, rhs: ReadonlySet<string>) {
    if (lhs === rhs) {
        return true;
    }

    if (lhs.size !== rhs.size) {
        return false;
    }

    for (const value of lhs) {
        if (!rhs.has(value)) {
            return false;
        }
    }

    return true;
}
