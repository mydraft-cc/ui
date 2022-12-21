/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable no-multi-assign */

import { MathHelper } from './math-helper';

export class Rotation {
    public static readonly ZERO = Rotation.fromRadian(0);

    private readonly computed: { cos: number | null; sin: number | null } = { cos: null, sin: null };

    public get cos() {
        let cos = this.computed.cos;

        if (cos === null) {
            this.computed.cos = cos = Math.cos(this.radian);
        }

        return cos;
    }

    public get sin() {
        let sin = this.computed.sin;

        if (sin === null) {
            this.computed.sin = sin = Math.sin(this.radian);
        }

        return sin;
    }

    constructor(
        public readonly radian: number,
        public readonly degree: number,
    ) {
        Object.freeze(this);
    }

    public static fromRadian(radian: number): Rotation {
        return new Rotation(radian, MathHelper.toDegree(radian));
    }

    public static fromDegree(degree: number): Rotation {
        return new Rotation(MathHelper.toRad(degree), degree);
    }
    
    public equals(r: Rotation): boolean {
        return Rotation.equals(this, r);
    }

    public static equals(lhs: Rotation, rhs: Rotation): boolean {
        return lhs.radian === rhs.radian;
    }

    public toString(): string {
        return `${this.degree}°`;
    }

    public add(r: Rotation): Rotation {
        return Rotation.fromDegree(MathHelper.toPositiveDegree(this.degree + r.degree));
    }

    public sub(r: Rotation): Rotation {
        return Rotation.fromDegree(MathHelper.toPositiveDegree(this.degree - r.degree));
    }

    public negate(): Rotation {
        return Rotation.fromDegree(-this.degree);
    }
}
