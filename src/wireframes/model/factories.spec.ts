/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ColorConfigurable, NumberConfigurable, SelectionConfigurable, SliderConfigurable, TextConfigurable, ToggleConfigurable } from './configurables';
import { MinSizeConstraint, SizeConstraint, TextHeightConstraint, TextSizeConstraint } from './constraints';
import { DefaultConfigurableFactory, DefaultConstraintFactory } from './factories';

describe('DefaultConstraintFactory', () => {
    const factory = DefaultConstraintFactory.INSTANCE;

    it('should create size constraint', () => {
        const constraint = factory.size();

        expect(constraint).toBeInstanceOf(SizeConstraint);
    });

    it('should create min size constraint', () => {
        const constraint = factory.minSize();

        expect(constraint).toBeInstanceOf(MinSizeConstraint);
    });

    it('should create text height constraint', () => {
        const constraint = factory.textHeight(50);

        expect(constraint).toBeInstanceOf(TextHeightConstraint);
    });

    it('should create text size constraint', () => {
        const constraint = factory.textSize(50);

        expect(constraint).toBeInstanceOf(TextSizeConstraint);
    });
});

describe('DefaultConfigurableFactory', () => {
    const factory = DefaultConfigurableFactory.INSTANCE;

    it('should create selection configurable', () => {
        const constraint = factory.selection('my-name', 'my-label', ['A', 'B', 'C']);

        expect(constraint).toBeInstanceOf(SelectionConfigurable);
        expect(constraint).toEqual({ name: 'my-name', label: 'my-label', options: ['A', 'B', 'C'] });
    });

    it('should create slider configurable', () => {
        const constraint = factory.slider('my-name', 'my-label', 50, 100);

        expect(constraint).toBeInstanceOf(SliderConfigurable);
        expect(constraint).toEqual({ name: 'my-name', label: 'my-label', min: 50, max: 100 });
    });

    it('should create number configurable', () => {
        const constraint = factory.number('my-name', 'my-label', 50, 100);

        expect(constraint).toBeInstanceOf(NumberConfigurable);
        expect(constraint).toEqual({ name: 'my-name', label: 'my-label', min: 50, max: 100 });
    });

    it('should create color configurable', () => {
        const constraint = factory.color('my-name', 'my-label');

        expect(constraint).toBeInstanceOf(ColorConfigurable);
        expect(constraint).toEqual({ name: 'my-name', label: 'my-label' });
    });

    it('should create text configurable', () => {
        const constraint = factory.text('my-name', 'my-label');

        expect(constraint).toBeInstanceOf(TextConfigurable);
        expect(constraint).toEqual({ name: 'my-name', label: 'my-label' });
    });

    it('should create toggle configurable', () => {
        const constraint = factory.toggle('my-name', 'my-label');

        expect(constraint).toBeInstanceOf(ToggleConfigurable);
        expect(constraint).toEqual({ name: 'my-name', label: 'my-label' });
    });
});