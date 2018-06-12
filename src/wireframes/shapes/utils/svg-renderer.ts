import * as svg from 'svg.js';
export * from './abstract-renderer';

import {
    Rect2,
    SVGHelper,
    Vec2
} from '@app/core';

import { DiagramShape, Transform } from '@app/wireframes/model';

import {
    AbstractRenderer,
    RendererColor,
    RendererElement,
    RendererOpacity,
    RendererText,
    RendererTransform,
    RendererWidth
} from './abstract-renderer';

export class SVGRenderer implements AbstractRenderer {
    private container: svg.Container;

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

    public createPath(strokeWidth: RendererWidth, path: string): RendererElement {
        const w = this.getStrokeWidth(strokeWidth);

        const element = this.container.path(path).fill('transparent');

        if (w > 0) {
            element.stroke({ width: w });
        }

        return element;
    }

    public createSinglelineText(config?: RendererText, bounds?: Rect2): RendererElement {
        let element: svg.Element;

        if (config instanceof DiagramShape) {
            element = SVGHelper.createSinglelineText(this.container,
                config.appearance.get(DiagramShape.APPEARANCE_TEXT),
                config.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE),
                config.appearance.get(DiagramShape.APPEARANCE_TEXT_ALIGNMENT));
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

        if (config instanceof DiagramShape) {
            element = SVGHelper.createMultilineText(this.container,
                config.appearance.get(DiagramShape.APPEARANCE_TEXT),
                config.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE),
                config.appearance.get(DiagramShape.APPEARANCE_TEXT_ALIGNMENT));
        } else if (config) {
            element = SVGHelper.createMultilineText(this.container, config.text, config.fontSize, config.alignment);
        } else {
            element = SVGHelper.createMultilineText(this.container, '');
        }

        SVGHelper.transform(element, { rect: bounds });

        return element;
    }

    public createRaster(source: string, bounds?: Rect2): RendererElement {
        const element = new svg.Image().load(source);

        SVGHelper.transform(element, { rect: bounds });

        return element;
    }

    public createGroup(items: RendererElement[]): RendererElement {
        const group = this.container.group();

        for (let item of items) {
            group.add(item.groupElement ? item.groupElement : item);
        }

        return group;
    }

    public setVisibility(element: RendererElement, visible: boolean) {
        const e = this.getElement(element);

        visible ? e.show() : e.hide();
    }

    public setForegroundColor(element: RendererElement, color: RendererColor): void {
        const c = this.getColor(color, DiagramShape.APPEARANCE_FOREGROUND_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.attr('color', c);
        }
    }

    public setBackgroundColor(element: RendererElement, color: RendererColor): void {
        const c = this.getColor(color, DiagramShape.APPEARANCE_BACKGROUND_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.attr('fill', c);
        }
    }

    public setStrokeColor(element: RendererElement, color: RendererColor): void {
        const c = this.getColor(color, DiagramShape.APPEARANCE_STROKE_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.attr('stroke', c);
        }
    }

    public setOpacity(element: RendererElement, opacity: RendererOpacity) {
        const o = this.getOpacity(opacity);
        const e = this.getElement(element);

        if (Number.isFinite(o)) {
            e.opacity(o);
        }
    }

    public setText(element: RendererElement, text: string) {
        const e = this.getElement(element);

        if (text) {
            e.node.children[0].textContent = text;
        }
    }

    public setFontFamily(element: RendererElement, fontFamily: string): void {
        const e = this.getElement(element);

        if (fontFamily) {
            e.attr('font-family', fontFamily);
        }
    }

    public setStrokeStyle(element: RendererElement, cap: string, join: string): void {
        const e = this.getElement(element);

        if (e) {
            e.attr('stroke-cap', cap).attr('stroke-linejoin', join);
        }
    }

    public setTransform(element: any, to: RendererTransform): void {
        const e = this.getElement(element);

        if (to instanceof DiagramShape) {
            this.setTransform(element, to.transform);
        } else if (to instanceof Transform) {
            SVGHelper.transform(e, {
                x: to.position.x - 0.5 * to.size.x,
                y: to.position.y - 0.5 * to.size.y,
                w: to.size.x,
                h: to.size.y,
                rx: to.position.x,
                ry: to.position.y,
                rotation: to.rotation.degree
            });
        } else {
            SVGHelper.transform(element, to);
        }
    }

    public getBounds(element: RendererElement): Rect2 {
        const e = this.getElement(element);

        return SVGHelper.box2Rect(e.bbox());
    }

    private getElement(element: RendererElement): svg.Element {
        if (element.textElement) {
            return element.textElement;
        } else {
            return element;
        }
    }

    private getColor(color: RendererColor, key: string): string {
        if (color instanceof DiagramShape) {
            return SVGHelper.toColor(color.appearance.get(key));
        } else {
            return SVGHelper.toColor(color);
        }
    }

    private getOpacity(opacity: RendererWidth): number {
        if (opacity instanceof DiagramShape) {
            return opacity.appearance.get(DiagramShape.APPEARANCE_OPACITY);
        } else {
            return opacity;
        }
    }

    private getStrokeWidth(strokeWidth: RendererWidth): number {
        if (strokeWidth instanceof DiagramShape) {
            return strokeWidth.appearance.get(DiagramShape.APPEARANCE_STROKE_THICKNESS);
        } else {
            return strokeWidth;
        }
    }

    public getTextWidth(text: string, fontSize: number, fontFamily: string): number | undefined {
        return undefined;
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

        return new Rect2(new Vec2(l, t), new Vec2(r - l, b - t));
    }
}