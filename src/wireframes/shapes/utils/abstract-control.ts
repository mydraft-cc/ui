/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, Rect2, Types, Vec2 } from '@app/core';
import { ConfigurableFactory, Constraint, ConstraintFactory, RenderContext, Shape, ShapePlugin } from '@app/wireframes/interface';
import { ColorConfigurable, DiagramItem, MinSizeConstraint, NumberConfigurable, Renderer, SelectionConfigurable, SizeConstraint, SliderConfigurable, TextHeightConstraint } from '@app/wireframes/model';
import { SVGRenderer } from './svg-renderer';

const RENDER_BACKGROUND = 1;

class DefaultConstraintFactory implements ConstraintFactory {
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
        throw new TextSizeConstraint(padding, lineHeight, resizeWidth, minWidth);
    }
}

class DefaultConfigurableFactory implements ConfigurableFactory {
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

const RENDERER = new SVGRenderer();
const CONFIGURABLE_FACTORY = new DefaultConfigurableFactory();
const CONSTRAINT_FACTORY = new DefaultConstraintFactory();

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
            return this.plugin.configurables(CONFIGURABLE_FACTORY);
        } else {
            return [];
        }
    }

    public constraint() {
        if (Types.isFunction(this.plugin.constraint)) {
            return this.plugin.constraint(CONSTRAINT_FACTORY);
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
        RENDERER.captureContext(context);

        return this;
    }

    public createDefaultShape(id: string) {
        const size = this.plugin.defaultSize();

        return DiagramItem.createShape(id, this.identifier(), size.x, size.y, this.configurables(), this.defaultAppearance(), this.constraint());
    }

    public render(shape: DiagramItem, options?: { debug?: boolean, noOpacity?: boolean, noTransform?: boolean }): any {
        const ctx = new RenderContext(RENDERER, shape, new Rect2(0, 0, shape.transform.size.x, shape.transform.size.y));

        options = options || {};

        if (RENDER_BACKGROUND) {
            const backgroundItem = RENDERER.createRectangle(0);

            RENDERER.setBackgroundColor(backgroundItem, Color.WHITE);
            RENDERER.setOpacity(backgroundItem, 0.001);
            RENDERER.setTransform(backgroundItem, { rect: ctx.rect });

            ctx.add(backgroundItem);
        }

        this.plugin.render(ctx);

        if (options.debug) {
            const boxItem = RENDERER.createRectangle(1);

            RENDERER.setStrokeColor(boxItem, 0xff0000);
            RENDERER.setTransform(boxItem, { rect: ctx.rect.inflate(1) });

            ctx.add(boxItem);
        }

        const rootItem = RENDERER.createGroup(ctx.items);

        if (!options.noTransform) {
            RENDERER.setTransform(rootItem, shape);
        }

        if (!options.noOpacity) {
            RENDERER.setOpacity(rootItem, shape);
        }

        return rootItem;
    }
}

class TextSizeConstraint implements Constraint {
    constructor(
        private readonly padding = 0,
        private readonly lineHeight = 1.2,
        private readonly resizeWidth = false,
        private readonly minWidth = 0,
    ) { }

    public updateSize(shape: Shape, size: Vec2, prev: DiagramItem): Vec2 {
        const fontSize = shape.fontSize;
        const fontFamily = shape.fontFamily;

        let finalWidth = size.x;

        const text = shape.text;

        let prevText = '';
        let prevFontSize = 0;
        let prevFontFamily = '';

        if (prev) {
            prevText = prev.text;

            prevFontSize = prev.fontSize;
            prevFontFamily = prev.fontFamily;
        }

        if (prevText !== text || prevFontSize !== fontSize || prevFontFamily !== fontFamily) {
            let textWidth = RENDERER.getTextWidth(text, fontSize, fontFamily);

            if (textWidth) {
                textWidth += 2 * this.padding;

                if (finalWidth < textWidth || !this.resizeWidth) {
                    finalWidth = textWidth;
                }

                finalWidth = Math.max(this.minWidth, finalWidth);
            }
        }

        return new Vec2(finalWidth, fontSize * this.lineHeight + this.padding * 2).roundToMultipleOfTwo();
    }

    public calculateSizeX(): boolean {
        return !this.resizeWidth;
    }

    public calculateSizeY(): boolean {
        return true;
    }
}
