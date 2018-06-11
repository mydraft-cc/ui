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

    public createRectangle(bounds?: Rect2, strokeWidth?: RendererWidth, radius?: number): RendererElement {
        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds);

        const shape = this.container.rect().fill('transparent');

        if (w > 0) {
            shape.stroke({ width: w });
        }

        if (radius && radius > 0) {
            shape.radius(radius, radius);
        }

        SVGHelper.transform(shape, { rect: b });

        return shape;
    }

    public createEllipse(bounds?: Rect2, strokeWidth?: RendererWidth): RendererElement {
        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds, w);

        const shape = this.container.ellipse().fill('transparent');

        if (w > 0) {
            shape.stroke({ width: w });
        }

        SVGHelper.transform(shape, { rect: b });

        return shape;
    }

    public createRoundedRectangleLeft(bounds: Rect2, strokeWidth: RendererWidth, radius: number): RendererElement {
        if (radius <= 0) {
            return this.createRectangle(bounds, strokeWidth, 0);
        }

        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds, w);

        const shape = SVGHelper.createRoundedRectangleLeft(this.container, b, radius).fill('transparent');

        if (w > 0) {
            shape.stroke({ width: w });
        }

        return shape;
    }

    public createRoundedRectangleRight(bounds: Rect2, strokeWidth: RendererWidth, radius: number): RendererElement {
        if (radius <= 0) {
            return this.createRectangle(bounds, strokeWidth, 0);
        }

        const w = this.getStrokeWidth(strokeWidth);
        const b = this.getBoundsWithStroke(bounds, w);

        const shape = SVGHelper.createRoundedRectangleRight(this.container, b, radius).fill('transparent');

        if (w > 0) {
            shape.stroke({ width: w });
        }

        return shape;
    }

    public createPath(path: string, strokeWidth?: RendererWidth): RendererElement {
        const w = this.getStrokeWidth(strokeWidth);

        const shape = this.container.path(path).fill('transparent');

        if (w > 0) {
            shape.stroke({ width: w });
        }

        return shape;
    }

    public createBoundedPath(bounds: Rect2, path: string, strokeWidth?: RendererWidth): RendererElement {
        const w = this.getStrokeWidth(strokeWidth);

        const shape = this.container.path(path).fill('transparent');

        if (w > 0) {
            shape.stroke({ width: w });
        }

        return shape;
    }

    public createSinglelineText(bounds?: Rect2, config?: RendererText): RendererElement {
        bounds = bounds || Rect2.ZERO;

        if (config instanceof DiagramShape) {
            return SVGHelper.createSinglelineText(this.container, bounds || Rect2.ZERO,
                config.appearance.get(DiagramShape.APPEARANCE_TEXT),
                config.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE),
                config.appearance.get(DiagramShape.APPEARANCE_TEXT_ALIGNMENT));
        } else if (config) {
            return SVGHelper.createSinglelineText(this.container, bounds, config.text, config.fontSize, config.alignment);
        } else {
            return SVGHelper.createMultilineText(this.container, bounds, '');
        }
    }

    public createMultilineText(bounds?: Rect2, config?: RendererText): RendererElement {
        bounds = bounds || Rect2.ZERO;

        if (config instanceof DiagramShape) {
            return SVGHelper.createMultilineText(this.container, bounds,
                config.appearance.get(DiagramShape.APPEARANCE_TEXT),
                config.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE),
                config.appearance.get(DiagramShape.APPEARANCE_TEXT_ALIGNMENT));
        } else if (config) {
            return SVGHelper.createMultilineText(this.container, bounds, config.text, config.fontSize, config.alignment);
        } else {
            return SVGHelper.createMultilineText(this.container, bounds, '');
        }
    }

    public createRaster(bounds: Rect2, source: string): RendererElement {
        const shape = SVGHelper.transform(new svg.Image(), bounds);

        shape.load(source);

        return shape;
    }

    public createClipGroup(clipItem: RendererElement, ...items: RendererElement[]): RendererElement {
        const group = this.container.group();

        for (let item of items) {
            group.add(item.groupElement ? item.groupElement : item);
        }

        return group;
    }

    public createGroup(...items: RendererElement[]): RendererElement {
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

    public transform(element: any, to: RendererTransform): void {
        const e = this.getElement(element);

        if (to instanceof DiagramShape) {
            this.transform(element, to.transform);
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

    public getTextWidth(text: string, fontSize: number, fontFamily: string): number | undefined {
        return undefined;
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

    private getStrokeWidth(strokeWidth?: RendererWidth): number {
        if (strokeWidth instanceof DiagramShape) {
            return strokeWidth.appearance.get(DiagramShape.APPEARANCE_STROKE_THICKNESS) || 0;
        } else {
            return strokeWidth || 0;
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

        return new Rect2(new Vec2(l, t), new Vec2(r - l, b - t));
    }
}