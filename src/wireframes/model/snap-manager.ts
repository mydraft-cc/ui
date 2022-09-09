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

export type SnapLine = Readonly<{
    // The actual position of the line.
    value: number;
    
    // The difference to a side.
    diff?: { x: number; y: number };
    
    // The positions for space snap lines.
    positions?: { x: number; y: number }[]; 
    
    // True, if the snap line is for a center.
    isCenter?: boolean;

    // The bounds.
    bound?: Rect2;

    // The index of the bound.
    boundIndex?: number;

    // The side.
    distanceSide?: 'Left' | 'Right' | 'Top' | 'Bottom';
}>;

type Distances = {
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
    private lastDiagram?: Diagram;
    private xLines?: SnapLine[];
    private yLines?: SnapLine[];
    private distances: Distances[] = [];

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
            const { xLines, yLines } = this.getSnapLines(diagram, view, transform);

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
                
                if (delta > 0 && delta < MOVE_SNAP_SHAPE && delta < snapX) {
                    snapX = delta;
                    return true;
                }

                return false;
            };

            for (const line of xLines) {
                // Distribution lines have a bounds that must be close.
                if (line.bound && !isOverlapY(cy, aabb.height, line.bound)) {
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
                
                if (delta > 0 && delta < MOVE_SNAP_SHAPE && delta < snapY) {
                    snapY = delta;
                    return true;
                }

                return false;
            };

            for (const line of yLines) {
                // Distribution lines have a bounds that must be close.
                if (line.bound && !isOverlapX(cx, aabb.width, line.bound)) {
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
        } else {
            x = MathHelper.roundToMultipleOf(x, MOVE_SNAP_GRID);
            y = MathHelper.roundToMultipleOf(y, MOVE_SNAP_GRID);
        }

        result.delta = new Vec2(x - aabb.x, y - aabb.y);

        return result;
    }

    public getSnapLines(diagram: Diagram, view: Vec2, sourceTransform: Transform) {
        if (this.lastDiagram === diagram && this.xLines && this.yLines) {
            return { xLines: this.xLines, yLines: this.yLines };
        }

        this.lastDiagram = diagram;

        // Compute the bounding boxes once.
        const bounds = diagram.items.values.filter(x => x.transform !== sourceTransform).map(x => x.bounds(diagram).aabb);

        const distances = computeDistances(bounds);

        const xLines: SnapLine[] = [];
        const yLines: SnapLine[] = [];

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

        for (const distance of distances) {
            const bound = distance.bound;

            let x = 0;
            let y = 0;

            if (distance.leftDistance != Number.MAX_VALUE) {
                const value = bound.right + distance.leftDistance;
                
                y ||= bound.cy;

                xLines.push({ 
                    value, 
                    diff: { x: distance.leftDistance, y: 1 },
                    positions: [
                        { y, x: bound.left - distance.leftDistance },
                        { y, x: bound.right },
                    ],
                    bound,
                });
            }

            if (distance.rightDistance != Number.MAX_VALUE) {
                const value = bound.left - distance.rightDistance;
                
                y ||= bound.cy;

                xLines.push({ 
                    value, 
                    diff: { x: distance.rightDistance, y: 1 },
                    positions: [
                        { y, x: bound.right },
                        { y, x: value },
                    ],
                    bound,
                });
            }

            if (distance.topDistance != Number.MAX_VALUE) {
                const value = bound.bottom + distance.topDistance;
                
                x ||= bound.cx;

                yLines.push({ 
                    value, 
                    diff: { x: 1, y: distance.topDistance },
                    positions: [
                        { x, y: bound.top - distance.topDistance },
                        { x, y: bound.bottom },
                    ],
                    bound,
                });
            }

            if (distance.bottomDistance != Number.MAX_VALUE) {
                const value = bound.top - distance.bottomDistance;
                
                x ||= bound.cx;

                yLines.push({ 
                    value, 
                    diff: { x: 1, y: distance.bottomDistance }, 
                    positions: [
                        { x, y: bound.bottom },
                        { x, y: value },
                    ],
                    bound,
                });
            }
        }

        this.xLines = xLines;
        this.yLines = yLines;

        return { xLines, yLines };
    }
}

function computeDistances(bounds: Rect2[]) {
    const distances: Distances[] = [];

    for (const bound of bounds) {
        // Search for the minimum distance to the left or right.
        const distances: Distances = {
            bound,
            topDistance: Number.MAX_VALUE,
            topIndex: -1,
            bottomDistance: Number.MAX_VALUE,
            bottomIndex: -1,
            rightDistance: Number.MAX_VALUE,
            rightIndex: -1,
            leftDistance: Number.MAX_VALUE,
            leftIndex: -1,
        };

        let j = 0;

        for (const other of bounds) {
            if (other === bound) {
                continue;

            }

            if (isOverlapY(other.cy, other.height, bound)) {
                const dl = bound.left - other.right;

                // If the distance to the left is positive, the other element is on the left side.
                if (dl > 0 && dl < distances.leftDistance) {
                    distances.leftDistance = dl;
                    distances.leftIndex = j;
                }

                const dr = other.left - bound.right;

                // If the distance to the right is positive, the other element is on the right side.
                if (dr > 0 && dr < distances.rightDistance) {
                    distances.rightDistance = dl;
                    distances.rightIndex = j;
                }
            }

            if (isOverlapX(other.cx, other.width, bound)) {
                const dt = bound.top - other.bottom;

                // If the distance to the right is top, the other element is on the top side.
                if (dt > 0 && dt < distances.topDistance) {
                    distances.topDistance = dt;
                    distances.topIndex = j;
                }

                const db = other.top - bound.bottom;

                // If the distance to the right is bottom, the other element is on the bottom side.
                if (db > 0 && db < distances.bottomDistance) {
                    distances.bottomDistance = dt;
                    distances.bottomIndex = j;
                }
            }
        }
    }

    return distances;
}

function isOverlapX(cx: number, width: number, rhs: Rect2) {
    const minWidth = Math.min(width, rhs.width);

    return Math.abs(cx - rhs.cx) < minWidth * 0.5;
}

function isOverlapY(cy: number, height: number, rhs: Rect2) {
    const minHeight = Math.min(height, rhs.height);

    return Math.abs(cy - rhs.cy) < minHeight * 0.5;
}