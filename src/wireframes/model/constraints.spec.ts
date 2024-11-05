/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { TextMeasurer, Vec2 } from '@app/core/utils';
import { DefaultAppearance } from '@app/wireframes/interface';
import { DiagramItem, MinSizeConstraint, SizeConstraint, TextHeightConstraint, TextSizeConstraint } from '@app/wireframes/model';

const shape = DiagramItem.createShape({ 
    id: '1',
    renderer: 'Button',
    appearance: {
        [DefaultAppearance.FONT_SIZE]: 12,
    },
});

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


describe('TextSizeConstraint', () => {
    let measured = 0;

    const measurer: TextMeasurer = {
        getTextWidth(text, fontSize) {
            measured++;
            return text.length * fontSize * 1.5;
        },
    };

    beforeEach(() => {
        measured = 0;
    });

    it('should only calculate width when width cannot be resized', () => {
        const constraint1 = new TextSizeConstraint(measurer, 5, 5, 1.2, true, 10);
        const constraint2 = new TextSizeConstraint(measurer, 5, 5, 1.2, false, 10);

        expect(constraint1.calculateSizeX()).toBeFalsy();
        expect(constraint1.calculateSizeY()).toBeTruthy();

        expect(constraint2.calculateSizeX()).toBeTruthy();
        expect(constraint2.calculateSizeY()).toBeTruthy();
    });

    it('should calculate size from measurer without padding', () => {
        const constraint2 = new TextSizeConstraint(measurer, 0, 0, 1.5, true, 10);

        const newShape: DiagramItem = {
            fontSize: 16,
            fontFamily: 'monospace',
            text: 'Hello',
        } as any;

        const size = constraint2.updateSize(newShape, Vec2.ZERO, null!);

        expect(size.x).toBe(120);
        expect(size.y).toBe(24);
    });

    it('should calculate size from measurer with padding', () => {
        const constraint2 = new TextSizeConstraint(measurer, 3, 4, 1.5, true, 10);

        const newShape: DiagramItem = {
            fontSize: 16,
            fontFamily: 'monospace',
            text: 'Hello',
        } as any;

        const size = constraint2.updateSize(newShape, Vec2.ZERO);

        expect(size.x).toBe(126);
        expect(size.y).toBe(32);
    });

    it('should calculate size from measurer min width', () => {
        const constraint2 = new TextSizeConstraint(measurer, 3, 4, 1.5, true, 200);

        const newShape: DiagramItem = {
            fontSize: 16,
            fontFamily: 'monospace',
            text: 'Hello',
        } as any;

        const size = constraint2.updateSize(newShape, Vec2.ZERO);

        expect(size.x).toBe(200);
        expect(size.y).toBe(32);
    });

    it('should cache font size', () => {
        const constraint2 = new TextSizeConstraint(measurer, 3, 4, 1.5, true, 200);

        const shape1: DiagramItem = {
            fontSize: 16,
            fontFamily: 'monospace',
            text: 'Hello',
        } as any;

        const shape2: DiagramItem = {
            fontSize: 16,
            fontFamily: 'monospace',
            text: 'Hello',
        } as any;

        constraint2.updateSize(shape1, Vec2.ZERO);
        constraint2.updateSize(shape2, Vec2.ZERO, shape1);

        expect(measured).toBe(1);
    });

    it('should recompute font width if text changed', () => {
        const constraint2 = new TextSizeConstraint(measurer, 3, 4, 1.5, true, 200);

        const shape1: DiagramItem = {
            fontSize: 16,
            fontFamily: 'monospace',
            text: 'Hello',
        } as any;

        const shape2: DiagramItem = {
            fontSize: 16,
            fontFamily: 'monospace',
            text: 'World',
        } as any;

        constraint2.updateSize(shape1, Vec2.ZERO);
        constraint2.updateSize(shape2, Vec2.ZERO, shape1);

        expect(measured).toBe(2);
    });

    it('should recompute font width if font family changed', () => {
        const constraint2 = new TextSizeConstraint(measurer, 3, 4, 1.5, true, 200);

        const shape1: DiagramItem = {
            fontSize: 16,
            fontFamily: 'monospace',
            text: 'Hello',
        } as any;

        const shape2: DiagramItem = {
            fontSize: 16,
            fontFamily: 'Aria',
            text: 'Hello',
        } as any;

        constraint2.updateSize(shape1, Vec2.ZERO);
        constraint2.updateSize(shape2, Vec2.ZERO, shape1);

        expect(measured).toBe(2);
    });

    it('should recompute font width if font size changed', () => {
        const constraint2 = new TextSizeConstraint(measurer, 3, 4, 1.5, true, 200);

        const shape1: DiagramItem = {
            fontSize: 16,
            fontFamily: 'monospace',
            text: 'Hello',
        } as any;

        const shape2: DiagramItem = {
            fontSize: 18,
            fontFamily: 'Aria',
            text: 'Hello',
        } as any;

        constraint2.updateSize(shape1, Vec2.ZERO);
        constraint2.updateSize(shape2, Vec2.ZERO, shape1);

        expect(measured).toBe(2);
    });
});
