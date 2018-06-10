import * as svg from 'svg.js';
export * from './abstract-renderer';

import {
    Rect2,
    Rotation,
    SVGHelper,
    Vec2
} from '@app/core';

import { DiagramShape } from '@app/wireframes/model';

import {
    AbstractRenderer,
    RendererColor,
    RendererElement,
    RendererOpacity,
    RendererPosition,
    RendererRotation,
    RendererText,
    RendererThickness
} from './abstract-renderer';

export class SVGRenderer implements AbstractRenderer {
    private doc: svg.Doc;

    public captureContext(doc: svg.Doc) {
        this.doc = doc;
    }

    public createRoundedRectangle(bounds: Rect2, strokeThickness: RendererThickness, radius: number): RendererElement {
        const w = this.getStrokeThickness(strokeThickness);

        const shape = SVGHelper.size(this.doc.rect(), bounds);

        shape.stroke({ width: w });
        shape.radius(radius, radius);
        shape.fill('transparent');

        return shape;
    }

    public createRoundedRectangleLeft(bounds: Rect2, strokeThickness: RendererThickness, radius: number): RendererElement {
        const w = this.getStrokeThickness(strokeThickness);

        const shape = SVGHelper.createRoundedRectangleLeft(this.doc, bounds, radius);

        shape.stroke({ width: w });
        shape.fill('transparent');

        return shape;
    }

    public createRoundedRectangleRight(bounds: Rect2, strokeThickness: RendererThickness, radius: number): RendererElement {
        const w = this.getStrokeThickness(strokeThickness);

        const shape = SVGHelper.createRoundedRectangleRight(this.doc, bounds, radius);

        shape.stroke({ width: w });
        shape.fill('transparent');

        return shape;
    }

    public createPath(path: string, strokeThickness: RendererThickness): RendererElement {
        const w = this.getStrokeThickness(strokeThickness);

        const shape = this.doc.path(path);

        shape.stroke({ width: w });
        shape.fill('transparent');

        return shape;
    }

    public createBoundedPath(bounds: Rect2, path: string, strokeThickness: RendererThickness): RendererElement {
        const w = this.getStrokeThickness(strokeThickness);

        const shape = this.doc.path(path);

        shape.stroke({ width: w });
        shape.fill('transparent');

        return shape;
    }

    public createEllipse(bounds: Rect2, strokeThickness: RendererThickness): RendererElement {
        let w = this.getStrokeThickness(strokeThickness);

        const shape = SVGHelper.size(this.doc.ellipse(), bounds);

        shape.stroke({ width: w });
        shape.fill('transparent');

        return shape;
    }

    public createStar(center: Vec2, count: number, radius1: number, radius2: number, strokeThickness: RendererThickness): RendererElement {
        return null;
    }

    public createCircle(center: Vec2, strokeThickness: RendererThickness, radius: number): RendererElement {
        let w = this.getStrokeThickness(strokeThickness);

        const shape = SVGHelper.size(this.doc.ellipse(), new Rect2(center, new Vec2(radius, radius)));

        shape.stroke({ width: w });
        shape.fill('transparent');

        return shape;
    }

    public createSinglelineText(bounds: Rect2, config: RendererText): RendererElement {
        if (config instanceof DiagramShape) {
            return SVGHelper.createSinglelineText(this.doc, bounds,
                config.appearance.get(DiagramShape.APPEARANCE_TEXT),
                config.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE),
                config.appearance.get(DiagramShape.APPEARANCE_TEXT_ALIGNMENT));
        } else {
            return SVGHelper.createSinglelineText(this.doc, bounds, config.text, config.fontSize, config.alignment);
        }
    }

    public createMultilineText(bounds: Rect2, config: RendererText): RendererElement {
        if (config instanceof DiagramShape) {
            return SVGHelper.createMultilineText(this.doc, bounds,
                config.appearance.get(DiagramShape.APPEARANCE_TEXT),
                config.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE),
                config.appearance.get(DiagramShape.APPEARANCE_TEXT_ALIGNMENT));
        } else {
            return SVGHelper.createMultilineText(this.doc, bounds, config.text, config.fontSize, config.alignment);
        }
    }

    public createRaster(bounds: Rect2, source: string): RendererElement {
        const shape = SVGHelper.size(new svg.Image(), bounds);

        shape.load(source);

        return shape;
    }

    public createClipGroup(clipItem: RendererElement, ...items: RendererElement[]): RendererElement {
        const group = this.doc.group();

        for (let item of items) {
            group.add(item.groupElement ? item.groupElement : item);
        }

        return group;
    }

    public createGroup(...items: RendererElement[]): RendererElement {
        const group = this.doc.group();

        for (let item of items) {
            group.add(item.groupElement ? item.groupElement : item);
        }

        return group;
    }

    public setStrokeStyle(element: RendererElement, cap: string, join: string): void {
        return;
    }

    public setForegroundColor(element: RendererElement, color: RendererColor): void {
        const c = this.getColor(color, DiagramShape.APPEARANCE_FOREGROUND_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.attr('fill', c.toHex());
        }
    }

    public setBackgroundColor(element: RendererElement, color: RendererColor): void {
        const c = this.getColor(color, DiagramShape.APPEARANCE_BACKGROUND_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.attr('fill', c.toHex());
        }
    }

    public setStrokeColor(element: RendererElement, color: RendererColor): void {
        const c = this.getColor(color, DiagramShape.APPEARANCE_STROKE_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.attr('stroke', c.toHex());
        }
    }

    public setSize(element: RendererElement, size: Vec2 | DiagramShape) {
        const s = this.getSize(size);
        const e = this.getElement(element);

        if (s) {
            e.size(s.x, s.y);
        }
    }

    public setPosition(element: RendererElement, position: Vec2 | DiagramShape) {
        const p = this.getPosition(position);
        const e = this.getElement(element);

        if (p) {
            e.move(p.x - 0.5 * e.width(), p.y - 0.5 * e.height());
        }
    }

    public setRotation(element: RendererElement, rotation: Rotation | DiagramShape) {
        const r = this.getRotation(rotation);
        const e = this.getElement(element);

        if (Number.isFinite(r)) {
            e.rotate(r);
        }
    }

    public setOpacity(element: RendererElement, opacity: RendererOpacity) {
        const o = this.getOpacity(opacity);
        const e = this.getElement(element);

        if (Number.isFinite(o)) {
            e.opacity(o);
        }
    }

    public setFontFamily(element: RendererElement, fontFamily: string): void {
        const e = this.getElement(element);

        if (fontFamily) {
            e.attr('font-family', fontFamily);
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

    private getColor(color: RendererColor, key: string): svg.Color {
        if (color instanceof DiagramShape) {
            return SVGHelper.toColor(color.appearance.get(key));
        } else {
            return SVGHelper.toColor(color);
        }
    }

    private getSize(size: RendererPosition): svg.Point {
        if (size instanceof DiagramShape) {
            return SVGHelper.vec2Point(size.transform.size);
        } else {
            return SVGHelper.vec2Point(size);
        }
    }

    private getPosition(position: RendererPosition): svg.Point {
        if (position instanceof DiagramShape) {
            return SVGHelper.vec2Point(position.transform.position);
        } else {
            return SVGHelper.vec2Point(position);
        }
    }

    private getRotation(rotation: RendererRotation): number {
        if (rotation instanceof DiagramShape) {
            return rotation.transform.rotation.degree;
        } else {
            return rotation.degree;
        }
    }

    private getOpacity(opacity: RendererThickness): number {
        if (opacity instanceof DiagramShape) {
            return opacity.appearance.get(DiagramShape.APPEARANCE_OPACITY);
        } else {
            return opacity;
        }
    }

    private getStrokeThickness(strokeThickness: RendererThickness): number {
        if (strokeThickness instanceof DiagramShape) {
            return strokeThickness.appearance.get(DiagramShape.APPEARANCE_STROKE_THICKNESS) || 0;
        } else {
            return strokeThickness;
        }
    }
}