/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Rect2, Vec2 } from '@app/core';
import { Diagram } from './diagram';
import { Transform } from './transform';

export interface SnapResult {
    snapModeX?: SnapMode;
    snapModeY?: SnapMode;
    snapValueX?: number;
    snapValueY?: number;

    delta: Vec2;
}

export interface SnapMoveResult {
    snapLineX?: SnapLine;
    snapLineY?: SnapLine;
    snapValueX?: number;
    snapValueY?: number;

    delta: Vec2;
}

export enum SnapMode { LeftTop, Center, RightBottom }

const ROTATE_SNAP = 90 / 4;
const MOVE_SNAP_GRID = 10;
const MOVE_SNAP_SHAPE = 5;
const RESIZE_SNAP_SHAPE = 5;
const RESIZE_SNAP_GRID = 10;
const RESIZE_MINIMUM = 1;

export type SnapLine = Readonly<{
    // The actual position of the line.
    value: number;
    
    // The difference to a side.
    diff?: Vec2;
    
    // The positions for space snap lines.
    positions?: Vec2[]; 
    
    // True, if the snap line is for a center.
    isCenter?: boolean;

    // The source.
    sourceTransform?: Transform;

    // The reference.
    referenceTransform?: Transform;

    // The bounds.
    sourceBound?: Rect2;
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

            const orderedAabbs = this.calculateOrderedAABBs(transform, diagram, view);

            const xLeft = aabb.left - delta.x;
            const xRight = aabb.right + delta.x;

            for (const target of orderedAabbs) {
                if (xMode > 0) {
                    for (const other of [target.left, target.right]) {
                        if (Math.abs(xRight - other) < RESIZE_SNAP_SHAPE) {
                            dw = other - aabb.right;

                            result.snapModeX = SnapMode.RightBottom;
                            result.snapValueX = other;
                            break;
                        }
                    }
                } else if (xMode < 0) {
                    for (const other of [target.left, target.right]) {
                        if (Math.abs(xLeft - other) < RESIZE_SNAP_SHAPE) {
                            dw = aabb.left - other;

                            result.snapModeX = SnapMode.LeftTop;
                            result.snapValueX = other;
                            break;
                        }
                    }
                }
            }

            const yTop = aabb.top - delta.y;
            const yBottom = aabb.bottom + delta.y;

            for (const target of orderedAabbs) {
                if (yMode > 0) {
                    for (const other of [target.top, target.bottom]) {
                        if (Math.abs(yBottom - other) < RESIZE_SNAP_SHAPE) {
                            dh = other - aabb.bottom;

                            result.snapModeY = SnapMode.RightBottom;
                            result.snapValueY = other;
                            break;
                        }
                    }
                } else if (yMode < 0) {
                    for (const other of [target.top, target.bottom]) {
                        if (Math.abs(yTop - other) < RESIZE_SNAP_SHAPE) {
                            dh = aabb.top - other;

                            result.snapModeY = SnapMode.LeftTop;
                            result.snapValueY = other;
                            break;
                        }
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
        const result: SnapMoveResult = { delta };

        const aabb = transform.aabb;

        let x = aabb.x + delta.x;
        let y = aabb.y + delta.y;

        if (!snapToGrid) {
            const { xLines, yLines } = this.getSnapLines(diagram, view);

            // Compute the new y-positions once.
            const xl = delta.x + aabb.left;
            const xr = delta.x + aabb.right;
            const xc = delta.x + aabb.cx;

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
                // Do not snap with self
                if (line.sourceTransform === transform || line.referenceTransform === transform) {
                    continue;
                }

                if (line.sourceBound && !isOverlapY(aabb, line.sourceBound)) {
                    continue;
                }

                if (line.isCenter && isXCandidate(xc, line)) {
                    x = line.value - aabb.width * 0.5;

                    result.snapLineX = line;
                    result.snapValueX = line.value;
                    break;
                } else if (isXCandidate(xl, line)) {
                    x = line.value;

                    result.snapLineX = line;
                    result.snapValueX = line.value;
                    break;
                } else if (isXCandidate(xr, line)) {
                    x = line.value - aabb.width;

                    result.snapLineX = line;
                    result.snapValueX = line.value;
                    break;
                }
            }

            // Compute the new y-positions once.
            const yt = delta.y + aabb.top;
            const yb = delta.y + aabb.bottom;
            const cy = delta.y + aabb.cy;

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
                // Do not snap with self
                if (line.sourceTransform === transform || line.referenceTransform === transform) {
                    continue;
                }

                if (line.sourceBound && !isOverlapX(aabb, line.sourceBound)) {
                    continue;
                }

                if (line.isCenter && isYCandidate(cy, line)) {
                    y = line.value - aabb.height * 0.5;

                    result.snapLineY = line;
                    result.snapValueY = line.value;
                    break;
                } else if (isYCandidate(yt, line)) {
                    y = line.value;

                    result.snapLineY = line;
                    result.snapValueY = line.value;
                    break;
                } else if (isYCandidate(yb, line)) {
                    y = line.value - aabb.height;

                    result.snapLineY = line;
                    result.snapValueY = line.value;
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

    public getSnapLines(diagram: Diagram, view: Vec2) {
        if (this.lastDiagram === diagram && this.xLines && this.yLines) {
            return { xLines: this.xLines, yLines: this.yLines };
        }

        this.lastDiagram = diagram;

        // The values need to be computed.
        const items = diagram.items.values;

        // Compute the bounding boxes once.
        const bounds = items.map(x => x.bounds(diagram).aabb);

        const xLines: SnapLine[] = [];
        const yLines: SnapLine[] = [];

        xLines.push({ value: 0 });
        xLines.push({ value: view.x });

        yLines.push({ value: 0 });
        yLines.push({ value: view.y });

        let i = 0;

        for (const bound of bounds) {
            const sourceTransform = items[i].transform;

            xLines.push({ sourceTransform, value: bound.left });
            xLines.push({ sourceTransform, value: bound.right });
            xLines.push({ sourceTransform, value: bound.cx, isCenter: true });

            yLines.push({ sourceTransform, value: bound.top });
            yLines.push({ sourceTransform, value: bound.bottom });
            yLines.push({ sourceTransform, value: bound.cy, isCenter: true });

            // Search for the minimum distance to the left or right.
            let minDistanceToLeft = Number.MAX_VALUE;
            let minDistanceToRight = Number.MAX_VALUE;

            let minDistanceToLeftTransform: Transform | undefined = undefined;
            let minDistanceToRightTransform: Transform | undefined = undefined;

            let minDistanceToTop = Number.MAX_VALUE;
            let minDistanceToBottom = Number.MAX_VALUE;

            let minDistanceToTopTransform: Transform | undefined = undefined;
            let minDistanceToBottomTransform: Transform | undefined = undefined;

            let j = 0;

            for (const other of bounds) {
                if (other === bound) {
                    continue;

                }
                const referenceTransform = items[j].transform;

                if (isOverlapY(other, bound)) {
                    const dl = bound.left - other.right;

                    if (dl > 0 && dl < minDistanceToLeft) {
                        minDistanceToLeft = dl;
                        minDistanceToLeftTransform = referenceTransform;
                    }

                    const dr = other.left - bound.right;

                    if (dr > 0 && dr < minDistanceToRight) {
                        minDistanceToRight = dr;
                        minDistanceToRightTransform = referenceTransform;
                    }
                }

                if (isOverlapX(other, bound)) {
                    const dt = bound.top - other.bottom;

                    if (dt > 0 && dt < minDistanceToTop) {
                        minDistanceToTop = dt;
                        minDistanceToTopTransform = referenceTransform;
                    }

                    const db = other.top - bound.bottom;

                    if (db > 0 && db < minDistanceToBottom) {
                        minDistanceToBottom = db;
                        minDistanceToBottomTransform = referenceTransform;
                    }
                }
            }

            if (minDistanceToLeft != Number.MAX_VALUE) {
                const value = bound.right + minDistanceToLeft;

                xLines.push({ 
                    value, 
                    diff: new Vec2(minDistanceToLeft, 1), 
                    positions: [
                        new Vec2(bound.left - minDistanceToLeft, bound.cy),
                        new Vec2(bound.right, bound.cy),
                    ],
                    sourceTransform,
                    sourceBound: bound,
                    referenceTransform: minDistanceToLeftTransform,
                });
            }

            if (minDistanceToRight != Number.MAX_VALUE) {
                const value = bound.left - minDistanceToRight;

                xLines.push({ 
                    value, 
                    diff: new Vec2(minDistanceToRight, 1), 
                    positions: [
                        new Vec2(bound.right, bound.cy),
                        new Vec2(value, bound.cy),
                    ],
                    sourceTransform,
                    sourceBound: bound,
                    referenceTransform: minDistanceToRightTransform,
                });
            }

            if (minDistanceToTop != Number.MAX_VALUE) {
                const value = bound.bottom + minDistanceToTop;

                yLines.push({ 
                    value, 
                    diff: new Vec2(1, minDistanceToTop), 
                    positions: [
                        new Vec2(bound.cx, bound.top - minDistanceToTop),
                        new Vec2(bound.cx, bound.bottom),
                    ],
                    sourceTransform,
                    sourceBound: bound,
                    referenceTransform: minDistanceToTopTransform,
                });
            }

            if (minDistanceToBottom != Number.MAX_VALUE) {
                const value = bound.top - minDistanceToBottom;

                yLines.push({ 
                    value, 
                    diff: new Vec2(1, minDistanceToBottom), 
                    positions: [
                        new Vec2(bound.cx, bound.bottom),
                        new Vec2(bound.cx, value),
                    ],
                    sourceTransform,
                    sourceBound: bound,
                    referenceTransform: minDistanceToBottomTransform,
                });
            }

            i++;
        }

        this.xLines = xLines;
        this.yLines = yLines;

        return { xLines, yLines };
    }

    private calculateOrderedAABBs(transform: Transform, diagram: Diagram, view: Vec2): Rect2[] {
        const orderedAabbs =
            diagram.items.values
                .map(t => t)
                .map(t => t.bounds(diagram)).filter(t => t !== transform)
                .map(t => t.aabb)
                .map(t => ({ t, d: t.center.sub(transform.position).lengtSquared }))
                .sort((l, r) => l.d - r.d).map(t => t.t);

        orderedAabbs.push(new Rect2(0, 0, view.x, view.y));

        return orderedAabbs;
    }
}

function isOverlapX(lhs: Rect2, rhs: Rect2) {
    const minWidth = Math.min(lhs.width, rhs.width);

    return Math.abs(lhs.cx - rhs.cx) < minWidth * 0.5;
    // return !(rhs.right < lhs.left || rhs.left > lhs.right);
}

function isOverlapY(lhs: Rect2, rhs: Rect2) {
    const minHeight = Math.min(lhs.height, rhs.height);

    return Math.abs(lhs.cy - rhs.cy) < minHeight * 0.5;
    // return !(rhs.bottom < lhs.top || rhs.top > lhs.bottom);
}