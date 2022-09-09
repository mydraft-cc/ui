/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Rect2, Vec2 } from '@app/core';
import { Diagram } from './diagram';
import { Transform } from './transform';

const ROTATE_SNAP = 90 / 4;
const MOVE_SNAP_GRID = 10;
const MOVE_SNAP_SHAPE = 5;
const RESIZE_SNAP_SHAPE = 5;
const RESIZE_SNAP_GRID = 10;
const RESIZE_MINIMUM = 1;

export type SnapResult = { 
    snapX?: SnapLine;
    snapY?: SnapLine;
    delta: Vec2; 
};

export type SnapLine = {
    // The actual position  ofthe line.
    value: number;
    
    // The difference to a side.
    diff?: { x: number; y: number };
    
    // The positions for space snap lines.
    positions?: { x: number; y: number }[]; 
    
    // True, if the snap line is for a center.
    isCenter?: boolean;

    // The distances it refers to.
    gridItem?: GridItem;

    // The side.
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
    bound: Rect2;
};

export class SnapManager {
    private referenceTransform?: Transform;
    private lastDiagram?: Diagram;
    private xLines?: SnapLine[];
    private yLines?: SnapLine[];
    private grid?: GridItem[];

    public snapRotating(transform: Transform, delta: number, disabled = false): number {
        const oldRotation = transform.rotation.degree;

        const total = oldRotation + delta;

        if (!disabled) {
            return MathHelper.roundToMultipleOf(total, ROTATE_SNAP) - oldRotation;
        } else {
            return MathHelper.roundToMultipleOf(total, 1) - oldRotation;
        }
    }

    public snapResizing(diagram: Diagram, view: Vec2, transform: Transform, delta: Vec2, snapToGrid: boolean, xMode = 1, yMode = 1): SnapResult {
        const result: SnapResult = { delta };

        let dw = delta.x;
        let dh = delta.y;

        if (!snapToGrid && transform.rotation.degree === 0) {
            const aabb = transform.aabb;

            const { xLines, yLines } = this.getSnapLines(diagram, view, transform);

            // Compute the new x and y-positions once.
            const l = -delta.x + aabb.left;
            const r = +delta.x + aabb.right;

            const t = -delta.y + aabb.top;
            const b =  delta.y + aabb.bottom;

            let snapX = Number.MAX_VALUE;

            const isXCandidate = (value: number, line: SnapLine) => {
                const delta = Math.abs(value - line.value);
                
                if (delta > 0 && delta < RESIZE_SNAP_SHAPE && delta < snapX) {
                    snapX = delta;
                    return true;
                }

                return false;
            };

            for (const line of xLines) {
                // Do not snap with center lines or distribution lines on resize.
                if (line.isCenter || line.positions) {
                    continue;
                }
                
                if (xMode > 0) {
                    if (isXCandidate(r, line)) {
                        dw = line.value - aabb.right;

                        result.snapX = line;
                    }
                } else if (xMode < 0) {
                    if (isXCandidate(l, line)) {
                        dw = line.value - aabb.right;

                        result.snapX = line;
                    }
                }
            }

            let snapY = Number.MAX_VALUE;

            const isYCandidate = (value: number, line: SnapLine) => {
                const delta = Math.abs(value - line.value);
                
                if (delta > 0 && delta < RESIZE_SNAP_SHAPE && delta < snapY) {
                    snapY = delta;
                    return true;
                }

                return false;
            };

            for (const line of yLines) {
                // Do not snap with center lines or distribution lines on resize.
                if (line.isCenter || line.positions) {
                    continue;
                }
                
                if (yMode > 0) {
                    if (isYCandidate(b, line)) {
                        dh = line.value - aabb.bottom;

                        result.snapY = line;
                    }
                } else if (yMode < 0) {
                    if (isYCandidate(t, line)) {
                        dh = aabb.top - line.value;

                        result.snapY = line;
                    }
                }
            }
        } else if (snapToGrid) {
            dw = MathHelper.roundToMultipleOf(transform.size.x + dw, RESIZE_SNAP_GRID) - transform.size.x;
            dh = MathHelper.roundToMultipleOf(transform.size.y + dh, RESIZE_SNAP_GRID) - transform.size.y;
        }

        if (transform.size.x + dw < RESIZE_MINIMUM) {
            dw = RESIZE_MINIMUM - transform.size.x;
        }

        if (transform.size.y + dh < RESIZE_MINIMUM) {
            dh = RESIZE_MINIMUM - transform.size.y;
        }

        result.delta = new Vec2(dw, dh);

        return result;
    }

    public snapMoving(diagram: Diagram, view: Vec2, transform: Transform, delta: Vec2, snapToGrid: boolean): SnapResult {
        const result: SnapResult = { delta };

        const aabb = transform.aabb;

        let x = aabb.x + delta.x;
        let y = aabb.y + delta.y;

        if (!snapToGrid) {
            const { xLines, yLines, grid } = this.getSnapLines(diagram, view, transform);

            // Compute the new x and y-positions once.
            const l = x;
            const r = delta.x + aabb.right;

            const t = y;
            const b = delta.y + aabb.bottom;
            
            const cx = delta.x + aabb.cx;
            const cy = delta.y + aabb.cy;

            let snapX = Number.MAX_VALUE;

            const isXCandidate = (value: number, line: SnapLine) => {
                const delta = Math.abs(value - line.value);
                
                if (delta < MOVE_SNAP_SHAPE && delta < snapX) {
                    snapX = delta;
                    return true;
                }

                return false;
            };

            for (const line of xLines) {
                // Distance lines have a bounds that must be close.
                if (line.gridItem?.bound && !isOverlapY(cy, aabb.height, line.gridItem?.bound)) {
                    continue;
                }

                if (line.isCenter && isXCandidate(cx, line)) {
                    x = line.value - aabb.width * 0.5;

                    result.snapX = line;
                    break;
                } else if (isXCandidate(l, line)) {
                    x = line.value;

                    result.snapX = line;
                    break;
                } else if (isXCandidate(r, line)) {
                    x = line.value - aabb.width;

                    result.snapX = line;
                    break;
                }
            }

            let snapY = Number.MAX_VALUE;

            const isYCandidate = (value: number, line: SnapLine) => {
                const delta = Math.abs(value - line.value);
                
                if (delta < MOVE_SNAP_SHAPE && delta < snapY) {
                    snapY = delta;
                    return true;
                }

                return false;
            };

            for (const line of yLines) {
                // Distance lines have a bounds that must be close.
                if (line.gridItem?.bound && !isOverlapX(cx, aabb.width, line.gridItem?.bound)) {
                    continue;
                }

                if (line.isCenter && isYCandidate(cy, line)) {
                    y = line.value - aabb.height * 0.5;

                    result.snapY = line;
                    break;
                } else if (isYCandidate(t, line)) {
                    y = line.value;

                    result.snapY = line;
                    break;
                } else if (isYCandidate(b, line)) {
                    y = line.value - aabb.height;

                    result.snapY = line;
                    break;
                }
            }

            result.snapX = enrichLine(result.snapX, grid);
            result.snapY = enrichLine(result.snapY, grid);
        } else {
            x = MathHelper.roundToMultipleOf(x, MOVE_SNAP_GRID);
            y = MathHelper.roundToMultipleOf(y, MOVE_SNAP_GRID);
        }

        result.delta = new Vec2(x - aabb.x, y - aabb.y);

        return result;
    }

    public getSnapLines(diagram: Diagram, view: Vec2, referenceTransform: Transform) {
        if (this.lastDiagram === diagram && this.xLines && this.yLines && this.grid && this.referenceTransform === referenceTransform) {
            return { xLines: this.xLines, yLines: this.yLines, grid: this.grid };
        }

        this.lastDiagram = diagram;

        // The currently moved transform is not part of the snap lines, therefore we have to recalculate if it changes.
        this.referenceTransform = referenceTransform;

        // Compute the bounding boxes once.
        const bounds = diagram.items.values.filter(x => x.transform !== referenceTransform).map(x => x.bounds(diagram).aabb);

        const grid = this.grid = computeGrid(bounds);

        const xLines: SnapLine[] = this.xLines = [];
        const yLines: SnapLine[] = this.yLines = [];

        xLines.push({ value: 0 });
        xLines.push({ value: view.x });

        yLines.push({ value: 0 });
        yLines.push({ value: view.y });

        for (const bound of bounds) {
            xLines.push({ value: bound.left });
            xLines.push({ value: bound.right });
            xLines.push({ value: bound.cx, isCenter: true });

            yLines.push({ value: bound.top });
            yLines.push({ value: bound.bottom });
            yLines.push({ value: bound.cy, isCenter: true });
        }

        for (const gridItem of grid) {
            const bound = gridItem.bound;
    
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

    public getDebugLines(diagram: Diagram, view: Vec2, transform: Transform) {
        const { xLines, yLines } = this.getSnapLines(diagram, view, transform);

        if (this.grid) {
            for (const line of xLines) {
                enrichLine(line, this.grid);
            }
            for (const line of yLines) {
                enrichLine(line, this.grid);
            }
        }

        return { xLines, yLines };
    }
}

function enrichLine(line: SnapLine | undefined, grid: GridItem[]) {
    if (!line || !line.gridSide || !line.gridItem || line.positions) {
        return line;
    }

    const positions: { x: number; y: number }[] = [];

    // The initial bound to check.
    let current = line.gridItem;

    // Compute the vertical offsets once to save some compute time.
    const x = current.bound.cx;
    const y = current.bound.cy;

    switch (line.gridSide) {
        case 'Left': {
            const distance = current.rightDistance;

            // Compute the vertical offset only once to save some compute time.
            line.diff = { x: distance, y: 1 };

            // Travel to the left while the right are the same.
            while (current) {
                positions.push({ x: current.bound.left - distance, y });

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
                positions.push({ x: current.bound.right, y });

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
                positions.push({ y: current.bound.top - distance, x });

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
                positions.push({ y: current.bound.bottom, x });

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

function computeGrid(bounds: Rect2[]) {
    const grid: GridItem[] = [];

    for (const bound of bounds) {
        // Search for the minimum distance to the left or right.
        const gridItem: GridItem = {
            bound,
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

            if (other === bound) {
                continue;
            }

            if (isOverlapY(other.cy, other.height, bound)) {
                const dl = bound.left - other.right;

                // If the distance to the left is positive, the other element is on the left side.
                if (dl > 0 && dl < gridItem.leftDistance) {
                    gridItem.leftDistance = dl;
                    gridItem.leftIndex = j;
                }

                const dr = other.left - bound.right;

                // If the distance to the right is positive, the other element is on the right side.
                if (dr > 0 && dr < gridItem.rightDistance) {
                    gridItem.rightDistance = dr;
                    gridItem.rightIndex = j;
                }
            }

            if (isOverlapX(other.cx, other.width, bound)) {
                const dt = bound.top - other.bottom;

                // If the distance to the right is top, the other element is on the top side.
                if (dt > 0 && dt < gridItem.topDistance) {
                    gridItem.topDistance = dt;
                    gridItem.topIndex = j;
                }

                const db = other.top - bound.bottom;

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