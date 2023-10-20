/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Vec2 } from '@app/core/utils';
import { Shape } from '@app/wireframes/interface';

export interface Constraint {
    updateSize(shape: Shape, size: Vec2, prev?: Shape): Vec2;

    calculateSizeX(): boolean;

    calculateSizeY(): boolean;
}

export class SizeConstraint implements Constraint {
    constructor(
        private readonly width: number | undefined,
        private readonly height: number | undefined,
    ) {
        Object.freeze(this);
    }

    public updateSize(_: Shape, size: Vec2): Vec2 {
        let w = size.x;
        let h = size.y;

        if (this.width) {
            w = this.width;
        }

        if (this.height) {
            h = this.height;
        }

        return new Vec2(w, h);
    }

    public calculateSizeX(): boolean {
        return !!this.width;
    }

    public calculateSizeY(): boolean {
        return !!this.height;
    }
}

export class MinSizeConstraint implements Constraint {
    constructor() {
        Object.freeze(this);
    }

    public updateSize(_: Shape, size: Vec2): Vec2 {
        const minSize = Math.min(size.x, size.y);

        return new Vec2(minSize, minSize);
    }

    public calculateSizeX(): boolean {
        return false;
    }

    public calculateSizeY(): boolean {
        return false;
    }
}

export class TextHeightConstraint implements Constraint {
    constructor(
        private readonly padding: number,
    ) {
        Object.freeze(this);
    }

    public updateSize(shape: Shape, size: Vec2): Vec2 {
        const fontSize = shape.fontSize;

        return new Vec2(size.x, MathHelper.roundToMultipleOfTwo(fontSize * 1.2 + this.padding * 2));
    }

    public calculateSizeX(): boolean {
        return false;
    }

    public calculateSizeY(): boolean {
        return true;
    }
}
