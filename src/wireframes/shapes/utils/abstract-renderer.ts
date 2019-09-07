import {
    Color,
    MatrixTransform,
    Rect2
} from '@app/core';

import { DiagramItem, Transform } from '@app/wireframes/model';

export interface TextConfig { text: string; fontSize?: number; alignment?: string; }

export type RendererColor = string | number | Color | DiagramItem;
export type RendererElement = any;
export type RendererOpacity = number | DiagramItem;
export type RendererText = TextConfig | DiagramItem;
export type RendererWidth = number | DiagramItem;
export type RendererTransform = Transform | MatrixTransform | DiagramItem;

export interface AbstractRenderer {
    createRoundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2): RendererElement;

    createRoundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2): RendererElement;

    createPath(strokeWidth: RendererWidth, path: string, bounds?: Rect2): RendererElement;

    createRaster(source: string, bounds?: Rect2): RendererElement;

    createRectangle(strokeWidth: RendererWidth, radius?: number, bounds?: Rect2): RendererElement;

    createEllipse(strokeWidth: RendererWidth, bounds?: Rect2): RendererElement;

    createSinglelineText(config?: RendererText, bounds?: Rect2): RendererElement;

    createMultilineText(config?: RendererText, bounds?: Rect2): RendererElement;

    createGroup(items: RendererElement[], clipItem?: RendererElement): RendererElement;

    setForegroundColor(element: RendererElement, color: RendererColor): AbstractRenderer;

    setBackgroundColor(element: RendererElement, color: RendererColor): AbstractRenderer;

    setStrokeColor(element: RendererElement, color: RendererColor): AbstractRenderer;

    setStrokeStyle(element: RendererElement, cap: string, join: string): AbstractRenderer;

    setFontFamily(element: RendererElement, fontFamily: string): AbstractRenderer;

    setOpacity(element: RendererElement, opacity: RendererOpacity): AbstractRenderer;

    setVisibility(element: RendererElement, visible: boolean): AbstractRenderer;

    setText(element: RendererElement, text: string): AbstractRenderer;

    setTransform(element: RendererElement, to: RendererTransform): AbstractRenderer;

    getBounds(element: RendererElement, untransformed?: boolean): Rect2;

    getTextWidth(text: string, fontSize: number, fontFamily: string): number | undefined;
}