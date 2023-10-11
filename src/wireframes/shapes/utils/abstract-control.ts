/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { Rect2, SVGHelper } from '@app/core';
import { ConfigurableFactory, Constraint, ConstraintFactory, RenderContext, ShapePlugin, Size } from '@app/wireframes/interface';
import { ColorConfigurable, DiagramItem, MinSizeConstraint, NumberConfigurable, Renderer, SelectionConfigurable, SizeConstraint, SliderConfigurable, TextConfigurable, TextHeightConstraint, ToggleConfigurable } from '@app/wireframes/model';
import { SVGRenderer2 } from './svg-renderer2';
import { TextSizeConstraint } from './text-size-contraint';

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
        return new TextSizeConstraint(SVGRenderer2.INSTANCE, paddingX, paddingY, lineHeight, resizeWidth, minWidth);
    }
}

export class DefaultConfigurableFactory implements ConfigurableFactory {
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

    public text(name: string, label: string) {
        return new TextConfigurable(name, label);
    }
    
    public toggle(name: string, label: string) {
        return new ToggleConfigurable(name, label);
    }
}

const GLOBAL_CONTEXT: Writeable<RenderContext> = { renderer2: SVGRenderer2.INSTANCE } as any;

export class AbstractControl implements Renderer {
    constructor(
        private readonly shapePlugin: ShapePlugin,
    ) {
    }

    public identifier() {
        return this.shapePlugin.identifier();
    }

    public plugin() {
        return this.shapePlugin;
    }

    public defaultAppearance() {
        return this.shapePlugin.defaultAppearance?.();
    }

    public setContext(context: any): Renderer {
        SVGRenderer2.INSTANCE.setContainer(context);
        return this;
    }

    public createDefaultShape() {
        const appearance = this.shapePlugin.defaultAppearance();
        const constraint = this.shapePlugin.constraint?.(DefaultConstraintFactory.INSTANCE);
        const configurables = this.shapePlugin.configurables?.(DefaultConfigurableFactory.INSTANCE);
        const renderer = this.identifier();
        const size = this.shapePlugin.defaultSize();

        return { renderer, size, appearance, configurables, constraint };
    }

    public render(shape: DiagramItem, existing: svg.G | undefined, options?: { debug?: boolean; noOpacity?: boolean; noTransform?: boolean }): any {
        GLOBAL_CONTEXT.shape = shape;
        GLOBAL_CONTEXT.rect = new Rect2(0, 0, shape.transform.size.x, shape.transform.size.y);

        const container = SVGRenderer2.INSTANCE.getContainer();
        const index = (options?.debug) ? 2 : 1;

        // Use full color codes here to avoid the conversion in svg.js
        if (!existing) {
            existing = new svg.G();
            existing.add(new svg.Rect().fill('#ffffff').opacity(0.001));

            if (options?.debug) {
                existing.rect().fill('#ffffff').stroke({ color: '#ff0000' });
            }
        }

        for (let i = 0; i < index; i++) {
            SVGHelper.transformByRect(existing.get(i), GLOBAL_CONTEXT.rect);
        }

        SVGRenderer2.INSTANCE.setContainer(existing, index);

        this.shapePlugin.render(GLOBAL_CONTEXT);

        if (!options?.noTransform) {
            const to = shape.transform;

            SVGHelper.transformBy(existing, {
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

export class AbstractControlCells implements Renderer {
    constructor(
        private readonly shapePlugin: ShapePlugin[],
    ) {
    }

    public identifier() {
        return this.shapePlugin[0].identifier();
    }

    public plugin() {
        return this.shapePlugin[0];
    }

    public defaultAppearance() {
        return this.shapePlugin[0].defaultAppearance?.();
    }

    public setContext(context: any): Renderer {
        SVGRenderer2.INSTANCE.setContainer(context);
        return this;
    }

    public createDefaultShape() {
        const appearance = this.shapePlugin[0].defaultAppearance();
        const constraint = this.shapePlugin[0].constraint?.(DefaultConstraintFactory.INSTANCE);
        const configurables = this.shapePlugin[0].configurables?.(DefaultConfigurableFactory.INSTANCE);
        const renderer = this.identifier();
        const size: Size = {
            x: this.shapePlugin[0].defaultSize().x * 2,
            y: this.shapePlugin[0].defaultSize().y,
        };

        return { renderer, size, appearance, configurables, constraint };
    }

    public render(shape: DiagramItem, existing: svg.G | undefined, options?: { debug?: boolean; noOpacity?: boolean; noTransform?: boolean }): any {
        const numShapePlugin = this.shapePlugin.length;
        const index = (options?.debug) ? 2 : 1;
        const container = SVGRenderer2.INSTANCE.getContainer();
        GLOBAL_CONTEXT.shape = shape;
        
        // Use full color codes here to avoid the conversion in svg.js
        if (!existing) {
            existing = new svg.G();
            existing.add(new svg.Rect().fill('#ffffff').opacity(0.001));

            if (options?.debug) {
                existing.rect().fill('#ffffff').stroke({ color: '#ff0000' });
            }

            for (let i = 0; i < this.shapePlugin.length; i++) {
                var subExisting = new svg.G();
                subExisting.add(new svg.Rect().fill('#ffffff').opacity(0.001));

                if (options?.debug) {
                    subExisting.rect().fill('#ffffff').stroke({ color: '#ff0000' });
                }
                
                SVGRenderer2.INSTANCE.setContainer(subExisting, index);

                const shapePlugin = this.shapePlugin[i];
                const width = shape.transform.size.x / numShapePlugin;

                GLOBAL_CONTEXT.rect = new Rect2(i * width, 0, width, shape.transform.size.y);
                shapePlugin.render(GLOBAL_CONTEXT);

                for (let i = 0; i < index; i++) {
                    SVGHelper.transformByRect(subExisting.get(i), GLOBAL_CONTEXT.rect);
                }

                if (!options?.noTransform) {
                    SVGHelper.transformBy(subExisting, {
                        x: i * width,
                        w: width,
                    });
                }
                
                existing.add(subExisting);
            }
        }

        GLOBAL_CONTEXT.rect = new Rect2(0, 0, shape.transform.size.x, shape.transform.size.y);
        for (let i = 0; i < index; i++) {
            SVGHelper.transformByRect(existing.get(i), GLOBAL_CONTEXT.rect);
        }

        if (!options?.noTransform) {
            const to = shape.transform;

            SVGHelper.transformBy(existing, {
                x: to.position.x - 0.5 * to.size.x,
                y: to.position.y - 0.5 * to.size.y,
                w: to.size.x,
                h: to.size.y,
                rx: to.position.x,
                ry: to.position.y,
                rotation: to.rotation.degree,
            });
        }

        SVGRenderer2.INSTANCE.cleanupAll();
        SVGRenderer2.INSTANCE.setContainer(container);

        return existing;
    }
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
