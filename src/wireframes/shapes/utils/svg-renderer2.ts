/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MatrixTransform, Rect2, sizeInPx, SVGHelper } from '@app/core';
import { DefaultAppearance, RendererColor, RendererElement, RendererOpacity, RendererText, RendererWidth, Shape, ShapeFactory, ShapeFactoryFunc, ShapeProperties, ShapePropertiesFunc } from '@app/wireframes/interface';
import { DiagramItem, Transform } from '@app/wireframes/model';
import * as svg from 'svg.js';
import { AbstractRenderer2 } from './abstract-renderer';

export * from './abstract-renderer';

class Factory implements ShapeFactory {
    private container: svg.Container;
    private clipping: boolean;

    public setContainer(container: svg.Container) {
        this.container = container;
    }

    public rectangle(strokeWidth: RendererWidth, radius?: number, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        const w = this.getStrokeWidth(strokeWidth);

        const element = this.container.rect().fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        if (radius && radius > 0) {
            element.radius(radius, radius);
        }

        SVGHelper.transform(element, { rect: bounds });

        this.finish(element, properties);
    }

    public ellipse(strokeWidth: RendererWidth, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        const w = this.getStrokeWidth(strokeWidth);

        const element = this.container.ellipse().fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        SVGHelper.transform(element, { rect: bounds });

        this.finish(element, properties);
    }

    public roundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        if (radius <= 0) {
            this.rectangle(strokeWidth, 0, bounds);
            return;
        }

        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds, w);

        const element = SVGHelper.createRoundedRectangleLeft(this.container, b, radius).fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        this.finish(element, properties);
    }

    public roundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        if (radius <= 0) {
            this.rectangle(strokeWidth, 0, bounds);
            return;
        }

        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds, w);

        const element = SVGHelper.createRoundedRectangleRight(this.container, b, radius).fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        this.finish(element, properties);
    }

    public roundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        if (radius <= 0) {
            this.rectangle(strokeWidth, 0, bounds);
            return;
        }

        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds, w);

        const element = SVGHelper.createRoundedRectangleTop(this.container, b, radius).fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        this.finish(element, properties);
    }

    public roundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        if (radius <= 0) {
            this.rectangle(strokeWidth, 0, bounds);
            return;
        }

        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds, w);

        const element = SVGHelper.createRoundedRectangleBottom(this.container, b, radius).fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        this.finish(element, properties);
    }

    public path(strokeWidth: RendererWidth, path: string, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        const w = this.getStrokeWidth(strokeWidth);

        const pathArray = new svg.PathArray(path);
        const pathSegments: svg.PathArrayPoint[] = <any>pathArray.valueOf();

        for (const segment of pathSegments) {
            if (segment.length >= 3) {
                let x = <number>segment[segment.length - 2];
                let y = <number>segment[segment.length - 1];

                if (w === 0) {
                    x = Math.round(x);
                    y = Math.round(y);
                } else if (w % 2 === 1 && bounds) {
                    if (x === bounds.left) {
                        x += 0.5;
                    } else if (x === bounds.right) {
                        x -= 0.5;
                    }
                    if (y === bounds.top) {
                        y += 0.5;
                    } else if (y === bounds.bottom) {
                        y -= 0.5;
                    }
                }

                segment[segment.length - 2] = x;
                segment[segment.length - 1] = y;
            }
        }

        const element = this.container.path(pathArray).fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        this.finish(element, properties);
    }

    public text(config?: RendererText, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        let element: svg.Element;

        if (isShape(config)) {
            element = SVGHelper.createSinglelineText(this.container, config.text, config.fontSize, config.textAlignment);
        } else if (config) {
            element = SVGHelper.createSinglelineText(this.container, config.text, config.fontSize, config.alignment);
        } else {
            element = SVGHelper.createMultilineText(this.container, '');
        }

        SVGHelper.transform(element, { rect: bounds });

        this.finish(element, properties);

        return element;
    }

    public textMultiline(config?: RendererText, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        let element: svg.Element;

        if (isShape(config)) {
            element = SVGHelper.createMultilineText(this.container, config.text, config.fontSize, config.textAlignment);
        } else if (config) {
            element = SVGHelper.createMultilineText(this.container, config.text, config.fontSize, config.alignment);
        } else {
            element = SVGHelper.createMultilineText(this.container, '');
        }

        SVGHelper.transform(element, { rect: bounds });

        this.finish(element, properties);
    }

    public raster(source: string, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        const element = this.container.image().load(source);

        SVGHelper.transform(element, { rect: bounds });

        this.finish(element, properties);
    }

    public group(items: ShapeFactoryFunc, clip?: ShapeFactoryFunc, properties?: ShapePropertiesFunc) {
        const container = this.container;

        const group = this.container.group();

        this.container = group;

        if (items) {
            items(this);
        }

        if (clip) {
            this.clipping = true;

            clip(this);
        }

        this.container = container;
        this.clipping = false;

        this.finish(group, properties);
    }

    private finish(element: RendererElement, properties: ShapePropertiesFunc | undefined) {
        if (properties) {
            Properties.INSTANCE.setElement(element);

            properties(Properties.INSTANCE);
        }

        if (this.clipping) {
            this.container.clipWith(element);
        } else {
            this.container.add(element);
        }
    }

    private getStrokeWidth(value: RendererWidth): number {
        if (isShape(value)) {
            return value.strokeThickness;
        } else {
            return value;
        }
    }

    private getBoundsWithStroke(bounds?: Rect2, strokeWidth = 0): Rect2 {
        if (!bounds) {
            return Rect2.ZERO;
        } else if (strokeWidth === 0) {
            return bounds;
        }

        let l = Math.round(bounds.left);
        let t = Math.round(bounds.top);
        let r = Math.round(bounds.right);
        let b = Math.round(bounds.bottom);

        if (strokeWidth && strokeWidth % 2 === 1) {
            l += 0.5;
            t += 0.5;
            r -= 0.5;
            b -= 0.5;
        }

        return new Rect2(l, t, r - l, b - t);
    }
}

export class SVGRenderer2 extends Factory implements AbstractRenderer2 {
    private measureDiv: HTMLDivElement;

    public static readonly INSTANCE = new SVGRenderer2();

    public constructor() {
        super();

        this.measureDiv = document.createElement('div');
        this.measureDiv.style.height = 'auto';
        this.measureDiv.style.position = 'absolute';
        this.measureDiv.style.visibility = 'hidden';
        this.measureDiv.style.width = 'auto';
        this.measureDiv.style.whiteSpace = 'nowrap';

        document.body.appendChild(this.measureDiv);
    }

    public setTransform(element: any, to: Transform | DiagramItem | MatrixTransform): AbstractRenderer2 {
        const e = this.getElement(element);

        if (to instanceof DiagramItem) {
            this.setTransform(element, to.transform);
        } else if (to instanceof Transform) {
            SVGHelper.transform(e, {
                x: to.position.x - 0.5 * to.size.x,
                y: to.position.y - 0.5 * to.size.y,
                w: to.size.x,
                h: to.size.y,
                rx: to.position.x,
                ry: to.position.y,
                rotation: to.rotation.degree,
            });
        } else {
            SVGHelper.transform(element, to);
        }

        return this;
    }

    public getBounds(element: RendererElement, untransformed?: boolean): Rect2 {
        const e = this.getElement(element);

        if (!e.visible()) {
            return Rect2.EMPTY;
        }

        let box: svg.Box = e.bbox();

        if (!untransformed) {
            const m = e.matrixify();

            if (m) {
                box = box.transform(m);
            }
        }

        return SVGHelper.box2Rect(box);
    }

    private getElement(element: RendererElement): svg.Element {
        if (element.textElement) {
            return element.textElement;
        } else {
            return element;
        }
    }

    public getTextWidth(text: string, fontSize: number, fontFamily: string): number | undefined {
        this.measureDiv.textContent = text;
        this.measureDiv.style.fontSize = sizeInPx(fontSize);
        this.measureDiv.style.fontFamily = fontFamily;

        return this.measureDiv.clientWidth + 1;
    }
}

class Properties implements ShapeProperties {
    private element: svg.Element;

    public get shape() {
        return this.element;
    }

    public static readonly INSTANCE = new Properties();

    private constructor() {
        // NOOP
    }

    public setElement(element: RendererElement) {
        if (element.textElement) {
            this.element = element.textElement;
        } else {
            this.element = element;
        }
    }

    public setVisibility(visible: boolean): ShapeProperties {
        if (this.element) {
            visible ? this.element.show() : this.element.hide();
        }

        return this;
    }

    public setForegroundColor(color: RendererColor): ShapeProperties {
        const c = this.getColor(color, DefaultAppearance.FOREGROUND_COLOR);

        if (this.element && c) {
            this.element.attr('color', c);
        }

        return this;
    }

    public setBackgroundColor(color: RendererColor): ShapeProperties {
        const c = this.getColor(color, DefaultAppearance.BACKGROUND_COLOR);

        if (this.element && c) {
            this.element.attr('fill', c);
        }

        return this;
    }

    public setStrokeColor(color: RendererColor): ShapeProperties {
        const c = this.getColor(color, DefaultAppearance.STROKE_COLOR);

        if (this.element && c) {
            this.element.attr('stroke', c);
        }

        return this;
    }

    public setOpacity(opacity: RendererOpacity): ShapeProperties {
        const o = this.getOpacity(opacity);

        if (this.element && Number.isFinite(o)) {
            this.element.opacity(o);
        }

        return this;
    }

    public setText(text: string): ShapeProperties {
        if (this.element && text) {
            this.element.node.children[0].textContent = text;
        }

        return this;
    }

    public setFontFamily(fontFamily: string): ShapeProperties {
        if (this.element && fontFamily) {
            this.element.attr('font-family', fontFamily);
        }

        return this;
    }

    public setStrokeStyle(cap: string, join: string): ShapeProperties {
        if (this.element) {
            this.element.attr('stroke-cap', cap).attr('stroke-linejoin', join);
        }

        return this;
    }

    private getColor(value: RendererColor, key: string): string {
        if (isShape(value)) {
            return SVGHelper.toColor(value.getAppearance(key));
        } else {
            return SVGHelper.toColor(value);
        }
    }

    private getOpacity(value: RendererWidth): number {
        if (isShape(value)) {
            return value.opacity;
        } else {
            return value;
        }
    }
}

function isShape(element: any): element is Shape {
    return element instanceof DiagramItem;
}
