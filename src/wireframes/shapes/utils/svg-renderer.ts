/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MatrixTransform, Rect2, sizeInPx, SVGHelper } from '@app/core';
import { DefaultAppearance, RendererColor, RendererElement, RendererOpacity, RendererText, RendererWidth, Shape } from '@app/wireframes/interface';
import { DiagramItem, Transform } from '@app/wireframes/model';
import * as svg from 'svg.js';
import { AbstractRenderer } from './abstract-renderer';

export * from './abstract-renderer';

export class SVGRenderer implements AbstractRenderer {
    private measureDiv: HTMLDivElement;
    private container: svg.Container;

    public static readonly INSTANCE = new SVGRenderer();

    public constructor() {
        this.measureDiv = document.createElement('div');
        this.measureDiv.style.height = 'auto';
        this.measureDiv.style.position = 'absolute';
        this.measureDiv.style.visibility = 'hidden';
        this.measureDiv.style.width = 'auto';
        this.measureDiv.style.whiteSpace = 'nowrap';

        document.body.appendChild(this.measureDiv);
    }

    public captureContext(container: svg.Container) {
        this.container = container;
    }

    public createRectangle(strokeWidth: RendererWidth, radius?: number, bounds?: Rect2): RendererElement {
        const w = this.getStrokeWidth(strokeWidth);

        const element = this.container.rect().fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        if (radius && radius > 0) {
            element.radius(radius, radius);
        }

        SVGHelper.transform(element, { rect: bounds });

        return element;
    }

    public createEllipse(strokeWidth: RendererWidth, bounds?: Rect2): RendererElement {
        const w = this.getStrokeWidth(strokeWidth);

        const element = this.container.ellipse().fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        SVGHelper.transform(element, { rect: bounds });

        return element;
    }

    public createRoundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2): RendererElement {
        if (radius <= 0) {
            return this.createRectangle(strokeWidth, 0, bounds);
        }

        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds, w);

        const element = SVGHelper.createRoundedRectangleLeft(this.container, b, radius).fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        return element;
    }

    public createRoundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2): RendererElement {
        if (radius <= 0) {
            return this.createRectangle(strokeWidth, 0, bounds);
        }

        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds, w);

        const element = SVGHelper.createRoundedRectangleRight(this.container, b, radius).fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        return element;
    }

    public createRoundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2): RendererElement {
        if (radius <= 0) {
            return this.createRectangle(strokeWidth, 0, bounds);
        }

        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds, w);

        const element = SVGHelper.createRoundedRectangleTop(this.container, b, radius).fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        return element;
    }

    public createRoundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2): RendererElement {
        if (radius <= 0) {
            return this.createRectangle(strokeWidth, 0, bounds);
        }

        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds, w);

        const element = SVGHelper.createRoundedRectangleBottom(this.container, b, radius).fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        return element;
    }

    public createPath(strokeWidth: RendererWidth, path: string, bounds?: Rect2): RendererElement {
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

        return element;
    }

    public createSinglelineText(config?: RendererText, bounds?: Rect2): RendererElement {
        let element: svg.Element;

        if (isShape(config)) {
            element = SVGHelper.createSinglelineText(this.container, config.text, config.fontSize, config.textAlignment);
        } else if (config) {
            element = SVGHelper.createSinglelineText(this.container, config.text, config.fontSize, config.alignment);
        } else {
            element = SVGHelper.createMultilineText(this.container, '');
        }

        SVGHelper.transform(element, { rect: bounds });

        return element;
    }

    public createMultilineText(config?: RendererText, bounds?: Rect2): RendererElement {
        let element: svg.Element;

        if (isShape(config)) {
            element = SVGHelper.createMultilineText(this.container, config.text, config.fontSize, config.textAlignment);
        } else if (config) {
            element = SVGHelper.createMultilineText(this.container, config.text, config.fontSize, config.alignment);
        } else {
            element = SVGHelper.createMultilineText(this.container, '');
        }

        SVGHelper.transform(element, { rect: bounds });

        return element;
    }

    public createRaster(source: string, bounds?: Rect2): RendererElement {
        const element = this.container.image().load(source);

        SVGHelper.transform(element, { rect: bounds });

        return element;
    }

    public createGroup(items: RendererElement[], clipItem?: any): RendererElement {
        const group = this.container.group();

        for (const item of items) {
            group.add(item.groupElement ? item.groupElement : item);
        }

        if (clipItem) {
            group.clipWith(clipItem);
        }

        return group;
    }

    public setVisibility(element: RendererElement, visible: boolean): AbstractRenderer {
        const e = this.getElement(element);

        visible ? e.show() : e.hide();

        return this;
    }

    public setForegroundColor(element: RendererElement, color: RendererColor): AbstractRenderer {
        const c = this.getColor(color, DefaultAppearance.FOREGROUND_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.attr('color', c);
        }

        return this;
    }

    public setBackgroundColor(element: RendererElement, color: RendererColor): AbstractRenderer {
        const c = this.getColor(color, DefaultAppearance.BACKGROUND_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.attr('fill', c);
        }

        return this;
    }

    public setStrokeColor(element: RendererElement, color: RendererColor): AbstractRenderer {
        const c = this.getColor(color, DefaultAppearance.STROKE_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.attr('stroke', c);
        }

        return this;
    }

    public setOpacity(element: RendererElement, opacity: RendererOpacity): AbstractRenderer {
        const o = this.getOpacity(opacity);
        const e = this.getElement(element);

        if (Number.isFinite(o)) {
            e.opacity(o);
        }

        return this;
    }

    public setText(element: RendererElement, text: string): AbstractRenderer {
        const e = this.getElement(element);

        if (text) {
            e.node.children[0].textContent = text;
        }

        return this;
    }

    public setFontFamily(element: RendererElement, fontFamily: string): AbstractRenderer {
        const e = this.getElement(element);

        if (fontFamily) {
            e.attr('font-family', fontFamily);
        }

        return this;
    }

    public setStrokeStyle(element: RendererElement, cap: string, join: string): AbstractRenderer {
        const e = this.getElement(element);

        if (e) {
            e.attr('stroke-cap', cap).attr('stroke-linejoin', join);
        }

        return this;
    }

    public setTransform(element: any, to: Transform | DiagramItem | MatrixTransform): AbstractRenderer {
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

    private getStrokeWidth(value: RendererWidth): number {
        if (isShape(value)) {
            return value.strokeThickness;
        } else {
            return value;
        }
    }

    public getTextWidth(text: string, fontSize: number, fontFamily: string): number | undefined {
        this.measureDiv.textContent = text;
        this.measureDiv.style.fontSize = sizeInPx(fontSize);
        this.measureDiv.style.fontFamily = fontFamily;

        return this.measureDiv.clientWidth + 1;
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

function isShape(element: any): element is Shape {
    return element instanceof DiagramItem;
}
