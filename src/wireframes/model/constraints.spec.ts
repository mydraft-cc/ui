import { Vec2 } from '@app/core';

import {
    DiagramItem,
    MinSizeConstraint,
    SizeConstraint,
    TextHeightConstraint
} from '@app/wireframes/model';

const shape =
    DiagramItem.createShape('1', 'button', 100, 100)
        .setAppearance(DiagramItem.APPEARANCE_FONT_SIZE, 12);

describe('TextHeightConstraint', () => {
    it('should set y size from font size', () => {
        const constraint = new TextHeightConstraint(10);

        const size = constraint.updateSize(shape, new Vec2(130, 20));

        expect(size).toEqual(new Vec2(130, 34));
        expect(constraint.calculateSizeX()).toBeFalsy();
        expect(constraint.calculateSizeY()).toBeTruthy();
    });
});

describe('MinSizeConstraint', () => {
    it('should use x value as size if x is smaller than y', () => {
        const constraint = new MinSizeConstraint();

        const size = constraint.updateSize(shape, new Vec2(30, 40));

        expect(size).toEqual(new Vec2(30, 30));
        expect(constraint.calculateSizeX()).toBeFalsy();
        expect(constraint.calculateSizeY()).toBeFalsy();
    });

    it('should use y value as size if y is smaller than x', () => {
        const constraint = new MinSizeConstraint();

        const size = constraint.updateSize(shape, new Vec2(50, 20));

        expect(size).toEqual(new Vec2(20, 20));
        expect(constraint.calculateSizeX()).toBeFalsy();
        expect(constraint.calculateSizeY()).toBeFalsy();
    });
});

describe('SizeConstraint', () => {
    it('should not calculate size when not configured', () => {
        const constraint = new SizeConstraint(undefined, undefined);

        const size = constraint.updateSize(shape, new Vec2(50, 60));

        expect(size).toEqual(new Vec2(50, 60));
        expect(constraint.calculateSizeX()).toBeFalsy();
        expect(constraint.calculateSizeY()).toBeFalsy();
    });

    it('should calculate size when configured', () => {
        const constraint = new SizeConstraint(55, 33);

        const size = constraint.updateSize(shape, new Vec2(50, 60));

        expect(size).toEqual(new Vec2(55, 33));
        expect(constraint.calculateSizeX()).toBeTruthy();
        expect(constraint.calculateSizeY()).toBeTruthy();
    });
});