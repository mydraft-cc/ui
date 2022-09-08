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
}>;

export class SnapManager {
    private lastDiagram?: Diagram;
    private xLines?: SnapLine[];
    private yLines?: SnapLine[];

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
                if (line.bound && !isOverlapY2(cy, aabb, line.bound)) {
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
                if (line.bound && !isOverlapX2(cx, aabb, line.bound)) {
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

            // Search for the minimum distance to the left or right.
            let minDistanceToLeft = Number.MAX_VALUE;
            let minDistanceToRight = Number.MAX_VALUE;

            let minDistanceToTop = Number.MAX_VALUE;
            let minDistanceToBottom = Number.MAX_VALUE;

            for (const other of bounds) {
                if (other === bound) {
                    continue;

                }

                if (isOverlapY(other, bound)) {
                    const dl = bound.left - other.right;

                    if (dl > 0 && dl < minDistanceToLeft) {
                        minDistanceToLeft = dl;
                    }

                    const dr = other.left - bound.right;

                    if (dr > 0 && dr < minDistanceToRight) {
                        minDistanceToRight = dr;
                    }
                }

                if (isOverlapX(other, bound)) {
                    const dt = bound.top - other.bottom;

                    if (dt > 0 && dt < minDistanceToTop) {
                        minDistanceToTop = dt;
                    }

                    const db = other.top - bound.bottom;

                    if (db > 0 && db < minDistanceToBottom) {
                        minDistanceToBottom = db;
                    }
                }
            }

            let x = 0;
            let y = 0;

            if (minDistanceToLeft != Number.MAX_VALUE) {
                const value = bound.right + minDistanceToLeft;
                
                y ||= bound.cy;

                xLines.push({ 
                    value, 
                    diff: { x: minDistanceToLeft, y: 1 },
                    positions: [
                        { y, x: bound.left - minDistanceToLeft },
                        { y, x: bound.right },
                    ],
                    bound,
                });
            }

            if (minDistanceToRight != Number.MAX_VALUE) {
                const value = bound.left - minDistanceToRight;
                
                y ||= bound.cy;

                xLines.push({ 
                    value, 
                    diff: { x: minDistanceToRight, y: 1 },
                    positions: [
                        { y, x: bound.right },
                        { y, x: value },
                    ],
                    bound,
                });
            }

            if (minDistanceToTop != Number.MAX_VALUE) {
                const value = bound.bottom + minDistanceToTop;
                
                x ||= bound.cx;

                yLines.push({ 
                    value, 
                    diff: { x: 1, y: minDistanceToTop },
                    positions: [
                        { x, y: bound.top - minDistanceToTop },
                        { x, y: bound.bottom },
                    ],
                    bound,
                });
            }

            if (minDistanceToBottom != Number.MAX_VALUE) {
                const value = bound.top - minDistanceToBottom;
                
                x ||= bound.cx;

                yLines.push({ 
                    value, 
                    diff: { x: 1, y: minDistanceToBottom }, 
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

function isOverlapX2(cx: number, lhs: Rect2, rhs: Rect2) {
    const minWidth = Math.min(lhs.width, rhs.width);

    return Math.abs(cx - rhs.cx) < minWidth * 0.5;
}

function isOverlapY2(cy: number, lhs: Rect2, rhs: Rect2) {
    const minHeight = Math.min(lhs.height, rhs.height);

    return Math.abs(cy - rhs.cy) < minHeight * 0.5;
}

function isOverlapX(lhs: Rect2, rhs: Rect2) {
    const minWidth = Math.min(lhs.width, rhs.width);

    return Math.abs(lhs.cx - rhs.cx) < minWidth * 0.5;
}

function isOverlapY(lhs: Rect2, rhs: Rect2) {
    const minHeight = Math.min(lhs.height, rhs.height);

    return Math.abs(lhs.cy - rhs.cy) < minHeight * 0.5;
}