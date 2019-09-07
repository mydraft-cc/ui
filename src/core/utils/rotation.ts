import { MathHelper } from './math-helper';

export class Rotation {
    public static readonly ZERO = Rotation.fromRadian(0);

    public readonly cos: number;
    public readonly sin: number;

    constructor(
        public readonly radian: number,
        public readonly degree: number
    ) {
        this.cos = Math.cos(radian);
        this.sin = Math.sin(radian);

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