/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, SVGHelper, Types, Vec2 } from '@app/core';
import { ConfigurableFactory, Constraint, ConstraintFactory, RenderContext, Shape, ShapePlugin } from '@app/wireframes/interface';
import { ColorConfigurable, DiagramItem, MinSizeConstraint, NumberConfigurable, Renderer, SelectionConfigurable, SizeConstraint, SliderConfigurable, TextHeightConstraint } from '@app/wireframes/model';
import * as svg from '@svgdotjs/svg.js';
import { SVGRenderer2 } from './svg-renderer2';
import { TextSizeConstraint } from './text-size-contraint';

class DefaultConstraintFactory implements ConstraintFactory {
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

    public textSize(padding?: number, lineHeight?: number, resizeWidth?: false, minWidth?: number): Constraint {
        return new TextSizeConstraint(padding, lineHeight, resizeWidth, SVGRenderer2.INSTANCE, minWidth);
    }
}

class DefaultConfigurableFactory implements ConfigurableFactory {
    public static readonly INSTANCE = new DefaultConfigurableFactory();

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

class Context implements RenderContext {
    public static readonly INSTANCE = new Context();

    public readonly renderer2 = SVGRenderer2.INSTANCE;

    public shape: Shape;

    public rect: Rect2;
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
        SVGRenderer2.INSTANCE.setContainer(context);

        return this;
    }

    public createDefaultShape(id: string) {
        const size = this.plugin.defaultSize();

        return DiagramItem.createShape(id, this.identifier(), size.x, size.y, this.defaultAppearance(), this.configurables(), this.constraint());
    }

    public render(shape: DiagramItem, existing: svg.G | undefined, options?: { debug?: boolean; noOpacity?: boolean; noTransform?: boolean }): any {
        const context = Context.INSTANCE;

        context.shape = shape;
        context.rect = new Rect2(0, 0, shape.transform.size.x, shape.transform.size.y);

        const container = SVGRenderer2.INSTANCE.getContainer();

        if (!existing) {
            existing = container.group();
            existing.rect().fill('#fff').opacity(0.001);

            if (options?.debug) {
                existing.rect().fill('#fff').stroke({ color: '#ff0000' });
            }
        }

        let index = 1;

        if (options?.debug) {
            index = 2;
        }

        for (let i = 0; i < index; i++) {
            SVGHelper.transform(existing.get(i), { rect: context.rect });
        }

        SVGRenderer2.INSTANCE.setContainer(existing, index);

        this.plugin.render(context);

        if (!options?.noTransform) {
            const to = shape.transform;

            SVGHelper.transform(existing, {
                x: to.position.x - 0.5 * to.size.x,
                y: to.position.y - 0.5 * to.size.y,
                w: to.size.x,
                h: to.size.y,
                rx: to.position.x,
                ry: to.position.y,
                rotation: to.rotation.degree,
            });
        }

        if (!options?.noOpacity) {
            existing.opacity(shape.opacity);
        }

        SVGRenderer2.INSTANCE.cleanupAll();
        SVGRenderer2.INSTANCE.setContainer(container);

        return existing;
    }
}
