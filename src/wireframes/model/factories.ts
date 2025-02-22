/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { TextMeasurer } from '@app/core';
import { ConfigurableFactory, ConstraintFactory, SelectionConfiguration, Shape } from '@app/wireframes/interface';
import { ColorConfigurable, NumberConfigurable, SelectionConfigurable, SliderConfigurable, TextConfigurable, ToggleConfigurable } from './configurables';
import { Constraint, MinSizeConstraint, SizeConstraint, TextHeightConstraint, TextSizeConstraint } from './constraints';

export class DefaultConstraintFactory implements ConstraintFactory {
    public static readonly INSTANCE = new DefaultConstraintFactory();

    public size(width?: number, height?: number): any {
        return new SizeConstraint(width, height);
    }

    public minSize(): any {
        return new MinSizeConstraint();
    }
    
    public textHeight(padding: number): any {
        return new TextHeightConstraint(padding);
    }

    public textSize(paddingX?: number, paddingY?: number, lineHeight?: number, resizeWidth?: false, minWidth?: number): Constraint {
        return new TextSizeConstraint(TextMeasurer.DEFAULT, paddingX, paddingY, lineHeight, resizeWidth, minWidth);
    }
}

export class DefaultConfigurableFactory implements ConfigurableFactory {
    public static readonly INSTANCE = new DefaultConfigurableFactory();

    public selection(name: string, label: string, options: string[] | ((shape: Shape)=>string[]), config?: SelectionConfiguration) {
        return new SelectionConfigurable(name, label, options, config);
    }

    public slider(name: string, label: string, min: number, max: number) {
        return new SliderConfigurable(name, label, min, max);
    }

    public number(name: string, label: string, min: number, max: number) {
        return new NumberConfigurable(name, label, min, max);
    }

    public color(name: string, label: string) {
        return new ColorConfigurable(name, label);
    }

    public text(name: string, label: string) {
        return new TextConfigurable(name, label);
    }
    
    public toggle(name: string, label: string) {
        return new ToggleConfigurable(name, label);
    }
}