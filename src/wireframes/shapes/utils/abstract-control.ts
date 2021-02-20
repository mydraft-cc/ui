/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, Rect2, Types, Vec2 } from '@app/core';
import { ConfigurableFactory, Constraint, ConstraintFactory, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { ColorConfigurable, DiagramItem, MinSizeConstraint, NumberConfigurable, Renderer, SelectionConfigurable, SizeConstraint, SliderConfigurable, TextHeightConstraint } from '@app/wireframes/model';
import { SVGRenderer } from './svg-renderer';
import { TextSizeConstraint } from './text-size-contraint';

const RENDER_BACKGROUND = 1;

class DefaultConstraintFactory implements ConstraintFactory {
    public static readonly INSTANCE = new DefaultConstraintFactory();

    private constructor() {
    }

    public size(width?: number, height?: number): any {
        return new SizeConstraint(width, height);
    }

    public minSize(): any {
        return new MinSizeConstraint();
    }
    public textHeight(padding: number): any {
        return new TextHeightConstraint(padding);
    }

    public textSize(padding?: number, lineHeight?: number, resizeWidth?: false, minWidth?: number): Constraint {
        return new TextSizeConstraint(padding, lineHeight, resizeWidth, SVGRenderer.INSTANCE, minWidth);
    }
}

class DefaultConfigurableFactory implements ConfigurableFactory {
    public static readonly INSTANCE = new DefaultConfigurableFactory();

    private constructor() {
    }

    public selection(name: string, label: string, options: string[]) {
        return new SelectionConfigurable(name, label, options);
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
}

export class AbstractControl implements Renderer {
    constructor(
        private readonly plugin: ShapePlugin,
    ) {
    }

    public identifier() {
        return this.plugin.identifier();
    }

    public defaultAppearance() {
        if (Types.isFunction(this.plugin.defaultAppearance)) {
            return this.plugin.defaultAppearance();
        } else {
            return {};
        }
    }

    public showInGallery() {
        if (Types.isFunction(this.plugin.showInGallery)) {
            return this.plugin.showInGallery();
        } else {
            return true;
        }
    }

    public configurables() {
        if (Types.isFunction(this.plugin.configurables)) {
            return this.plugin.configurables(DefaultConfigurableFactory.INSTANCE);
        } else {
            return [];
        }
    }

    public constraint() {
        if (Types.isFunction(this.plugin.constraint)) {
            return this.plugin.constraint(DefaultConstraintFactory.INSTANCE);
        } else {
            return undefined;
        }
    }

    public previewOffset() {
        if (Types.isFunction(this.plugin.previewOffset)) {
            const offset = this.plugin.previewOffset();

            return new Vec2(offset.x, offset.y);
        } else {
            return Vec2.ZERO;
        }
    }

    public setContext(context: any): Renderer {
        SVGRenderer.INSTANCE.captureContext(context);

        return this;
    }

    public createDefaultShape(id: string) {
        const size = this.plugin.defaultSize();

        return DiagramItem.createShape(id, this.identifier(), size.x, size.y, this.configurables(), this.defaultAppearance(), this.constraint());
    }

    public render(shape: DiagramItem, options?: { debug?: boolean, noOpacity?: boolean, noTransform?: boolean }): any {
        const ctx = new RenderContext(SVGRenderer.INSTANCE, shape, new Rect2(0, 0, shape.transform.size.x, shape.transform.size.y));

        options = options || {};

        if (RENDER_BACKGROUND) {
            const backgroundItem = SVGRenderer.INSTANCE.createRectangle(0);

            SVGRenderer.INSTANCE.setBackgroundColor(backgroundItem, Color.WHITE);
            SVGRenderer.INSTANCE.setOpacity(backgroundItem, 0.001);
            SVGRenderer.INSTANCE.setTransform(backgroundItem, { rect: ctx.rect });

            ctx.add(backgroundItem);
        }

        this.plugin.render(ctx);

        if (options.debug) {
            const boxItem = SVGRenderer.INSTANCE.createRectangle(1);

            SVGRenderer.INSTANCE.setStrokeColor(boxItem, 0xff0000);
            SVGRenderer.INSTANCE.setTransform(boxItem, { rect: ctx.rect.inflate(1) });

            ctx.add(boxItem);
        }

        const rootItem = SVGRenderer.INSTANCE.createGroup(ctx.items);

        if (!options.noTransform) {
            SVGRenderer.INSTANCE.setTransform(rootItem, shape);
        }

        if (!options.noOpacity) {
            SVGRenderer.INSTANCE.setOpacity(rootItem, shape);
        }

        return rootItem;
    }
}
