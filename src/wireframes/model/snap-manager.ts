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

export enum SnapMode { LeftTop, Center, RightBottom }

const ROTATE_SNAP = 90 / 4;
const MOVE_SNAP_GRID = 10;
const MOVE_SNAP_SHAPE = 5;
const RESIZE_SNAP_SHAPE = 5;
const RESIZE_SNAP_GRID = 10;
const RESIZE_MINIMUM = 1;

export class SnapManager {
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
        const result: SnapResult = { delta };

        const aabb = transform.aabb;

        let x = aabb.x + delta.x;
        let y = aabb.y + delta.y;

        if (!snapToGrid) {
            const orderedAabbs = this.calculateOrderedAABBs(transform, diagram, view);

            const xLeft = aabb.left + delta.x;
            const xRight = aabb.right + delta.x;
            const xCenter = aabb.cx + delta.x;

            for (const target of orderedAabbs) {
                if (Math.abs(target.cx - xCenter) < MOVE_SNAP_SHAPE) {
                    x = target.cx - aabb.width * 0.5;

                    result.snapModeX = SnapMode.Center;
                    result.snapValueX = target.cx;
                    break;
                } else if (Math.abs(target.left - xLeft) < MOVE_SNAP_SHAPE) {
                    x = target.left;

                    result.snapModeX = SnapMode.LeftTop;
                    result.snapValueX = target.left;
                    break;
                } else if (Math.abs(target.right - xLeft) < MOVE_SNAP_SHAPE) {
                    x = target.right;

                    result.snapModeX = SnapMode.LeftTop;
                    result.snapValueX = target.right;
                    break;
                } else if (Math.abs(target.right - xRight) < MOVE_SNAP_SHAPE) {
                    x = target.right - aabb.width;

                    result.snapModeX = SnapMode.RightBottom;
                    result.snapValueX = target.right;
                    break;
                } else if (Math.abs(target.left - xRight) < MOVE_SNAP_SHAPE) {
                    x = target.left - aabb.width;

                    result.snapModeX = SnapMode.RightBottom;
                    result.snapValueX = target.left;
                    break;
                }
            }

            const yTop = aabb.top + delta.y;
            const yBottom = aabb.bottom + delta.y;
            const yCenter = aabb.cy + delta.y;

            for (const target of orderedAabbs) {
                if (Math.abs(target.cy - yCenter) < MOVE_SNAP_SHAPE) {
                    y = target.cy - aabb.height * 0.5;

                    result.snapModeY = SnapMode.Center;
                    result.snapValueY = target.cy;
                    break;
                } else if (Math.abs(target.top - yTop) < MOVE_SNAP_SHAPE) {
                    y = target.top;

                    result.snapModeY = SnapMode.LeftTop;
                    result.snapValueY = target.top;
                    break;
                } else if (Math.abs(target.bottom - yTop) < MOVE_SNAP_SHAPE) {
                    y = target.bottom;

                    result.snapModeY = SnapMode.LeftTop;
                    result.snapValueY = target.bottom;
                    break;
                } else if (Math.abs(target.bottom - yBottom) < MOVE_SNAP_SHAPE) {
                    y = target.bottom - aabb.height;

                    result.snapModeY = SnapMode.RightBottom;
                    result.snapValueY = target.bottom;
                    break;
                } else if (Math.abs(target.top - yBottom) < MOVE_SNAP_SHAPE) {
                    y = target.top - aabb.height;

                    result.snapModeY = SnapMode.RightBottom;
                    result.snapValueY = target.top;
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
