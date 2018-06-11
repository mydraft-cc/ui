/*
import * as paper from 'paper';

export * from './abstract-renderer';

import {
    PaperHelper,
    Rect2,
    Vec2
} from '@app/core';

import { DiagramShape, Transform } from '@app/wireframes/model';

import {
    AbstractRenderer,
    RendererColor,
    RendererElement,
    RendererOpacity,
    RendererText,
    RendererThickness,
    RendererTransform
} from './abstract-renderer';

export class PaperRenderer implements AbstractRenderer {
    private view: paper.View;

    public captureContext(layer: paper.Layer) {
        this.view = layer.view;
    }

    public createRectangle(bounds: Rect2, strokeThickness: RendererThickness, radius: number): RendererElement {
        let w = this.getStrokeThickness(strokeThickness);
        let r = this.getBoundsWithStroke(bounds, w);

        const shape = paper.Shape.Rectangle(r, radius);

        shape.strokeWidth = w;

        return shape;
    }

    public createRoundedRectangleLeft(bounds: Rect2, strokeThickness: RendererThickness, radius: number): RendererElement {
        let w = this.getStrokeThickness(strokeThickness);
        let r = this.getBoundsWithStroke(bounds, w);

        const shape = PaperHelper.createRoundedRectangleLeft(r, radius);

        shape.strokeWidth = w;

        return shape;
    }

    public createRoundedRectangleRight(bounds: Rect2, strokeThickness: RendererThickness, radius: number): RendererElement {
        let w = this.getStrokeThickness(strokeThickness);
        let r = this.getBoundsWithStroke(bounds, w);

        const shape = PaperHelper.createRoundedRectangleRight(r, radius);

        shape.strokeWidth = w;

        return shape;
    }

    public createPath(path: string, strokeThickness: RendererThickness): RendererElement {
        let w = this.getStrokeThickness(strokeThickness);

        const shape = new paper.CompoundPath(path);

        if (w === 0) {
            for (let curve of shape.curves) {
                for (let segment of [curve.segment1, curve.segment2]) {
                    segment.point = segment.point.round();
                }
            }
        }

        shape.strokeWidth = w;

        return shape;
    }

    public createBoundedPath(bounds: Rect2, path: string, strokeThickness: RendererThickness): RendererElement {
        let w = this.getStrokeThickness(strokeThickness);

        const shape = new paper.CompoundPath(path);

        if (w % 2 === 1) {
            for (let curve of shape.curves) {
                for (let segment of [curve.segment1, curve.segment2]) {
                    let x = segment.point.x;
                    let y = segment.point.y;

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

                    segment.point = new paper.Point(x, y);
                }
            }
        }

        shape.strokeWidth = w;

        return shape;
    }

    public createEllipse(bounds: Rect2, strokeThickness: RendererThickness): RendererElement {
        let w = this.getStrokeThickness(strokeThickness);

        const shape = new paper.Path.Ellipse(PaperHelper.rect2Rectangle(bounds));

        shape.strokeWidth = w;

        return shape;
    }

    public createStar(center: Vec2, count: number, radius1: number, radius2: number, strokeThickness: RendererThickness): RendererElement {
        let w = this.getStrokeThickness(strokeThickness);

        const shape = new paper.Path.Star(PaperHelper.vec2Point(center), count, radius1, radius2);

        shape.strokeWidth = w;

        return shape;
    }

    public createCircle(center: Vec2, strokeThickness: RendererThickness, radius: number): RendererElement {
        let w = this.getStrokeThickness(strokeThickness);

        const shape = paper.Shape.Circle(PaperHelper.vec2Point(center), radius);

        shape.strokeWidth = w;

        return shape;
    }

    public createSinglelineText(bounds: Rect2, config: RendererText): RendererElement {
        const r = PaperHelper.rect2Rectangle(bounds);

        if (config instanceof DiagramShape) {
            return PaperHelper.createSinglelineText(r,
                config.appearance.get(DiagramShape.APPEARANCE_TEXT),
                config.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE),
                config.appearance.get(DiagramShape.APPEARANCE_TEXT_ALIGNMENT));
        } else {
            return PaperHelper.createSinglelineText(r, config.text, config.fontSize, config.alignment);
        }
    }

    public createMultilineText(bounds: Rect2, config: RendererText): RendererElement {
        const r = PaperHelper.rect2Rectangle(bounds);

        if (config instanceof DiagramShape) {
            return PaperHelper.createMultilineText(r,
                config.appearance.get(DiagramShape.APPEARANCE_TEXT),
                config.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE),
                config.appearance.get(DiagramShape.APPEARANCE_TEXT_ALIGNMENT));
        } else {
            return PaperHelper.createMultilineText(r, config.text, config.fontSize, config.alignment);
        }
    }

    public createRaster(bounds: Rect2, source: string): RendererElement {
        const rasterItem = new paper.Raster(source || '', PaperHelper.vec2Point(bounds.center));

        rasterItem.width = bounds.width;
        rasterItem.height = bounds.height;

        return rasterItem;
    }

    public createClipGroup(clipItem: RendererElement, ...items: RendererElement[]): RendererElement {
        const group = new paper.Group([clipItem, ...items].map(t => t.groupItem ? t.groupItem : t));

        group.clipped = true;

        return group;
    }

    public createGroup(...items: RendererElement[]): RendererElement {
        const group = new paper.Group([...items].map(t => t.groupItem ? t.groupItem : t));

        group.clipped = false;

        return group;
    }

    public setVisibility(element: RendererElement, visible: boolean) {
        const e = this.getElement(element);

        e.visible = visible;
    }

    public setStrokeStyle(element: RendererElement, cap: string, join: string) {
        const e = this.getElement(element);

        e.strokeCap = cap;
        e.strokeJoin = join;
    }

    public setForegroundColor(element: RendererElement, color: RendererColor) {
        const c = this.getColor(color, DiagramShape.APPEARANCE_FOREGROUND_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.fillColor = c;
        }
    }

    public setBackgroundColor(element: RendererElement, color: RendererColor) {
        const c = this.getColor(color, DiagramShape.APPEARANCE_BACKGROUND_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.fillColor = c;
        }
    }

    public setStrokeColor(element: RendererElement, color: RendererColor) {
        const c = this.getColor(color, DiagramShape.APPEARANCE_STROKE_COLOR);
        const e = this.getElement(element);

        if (c) {
            e.strokeColor = c;
        }
    }

    public setOpacity(element: RendererElement, opacity: RendererOpacity) {
        const o = this.getOpacity(opacity);
        const e = this.getElement(element);

        if (Number.isFinite(o)) {
            e.opacity = 0;
        }
    }

    public setText(element: RendererElement, text: string) {
        const e = this.getElement(element);

        if (text) {
            (<paper.TextItem>e).content = text;
        }
    }

    public setFontFamily(element: RendererElement, fontFamily: string) {
        const e = this.getElement(element);

        if (fontFamily) {
            (<paper.TextItem>e).fontFamily = fontFamily;
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
        const style = `${fontSize}px ${fontFamily}`;

        return this.view ? this.view['getTextWidth'](style, [text]) : undefined;
    }

    public getBounds(element: RendererElement): Rect2 {
        const e = this.getElement(element);

        return PaperHelper.rectangle2Rect(e.bounds);
    }

    private getElement(element: RendererElement): paper.Item {
        if (element.textItem) {
            return element.textItem;
        } else {
            return element;
        }
    }

    private getColor(color: RendererColor, key: string): paper.Color {
        if (color instanceof DiagramShape) {
            return PaperHelper.toColor(color.appearance.get(key));
        } else {
            return PaperHelper.toColor(color);
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

    private getBoundsWithStroke(bounds: Rect2, strokeThickness: number): paper.Rectangle {
        let l = Math.round(bounds.left);
        let t = Math.round(bounds.top);
        let r = Math.round(bounds.right);
        let b = Math.round(bounds.bottom);

        if (strokeThickness % 2 === 1) {
            l += 0.5;
            t += 0.5;
            r -= 0.5;
            b -= 0.5;
        }

        return new paper.Rectangle(l, t, r - l, b - t);
    }
}
*/