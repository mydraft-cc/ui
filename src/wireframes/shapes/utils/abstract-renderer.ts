import {
    Color,
    MatrixTransform,
    Rect2
} from '@app/core';

import { DiagramShape, Transform } from '@app/wireframes/model';

export interface TextConfig { text: string; fontSize?: number; alignment?: string; }

export type RendererColor = string | number | Color | DiagramShape;
export type RendererElement = any;
export type RendererOpacity = number | DiagramShape;
export type RendererText = TextConfig | DiagramShape;
export type RendererWidth = number | DiagramShape;
export type RendererTransform = Transform | MatrixTransform | DiagramShape;

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

    setForegroundColor(element: RendererElement, color: RendererColor): void;

    setBackgroundColor(element: RendererElement, color: RendererColor): void;

    setStrokeColor(element: RendererElement, color: RendererColor): void;

    setStrokeStyle(element: RendererElement, cap: string, join: string): void;

    setFontFamily(element: RendererElement, fontFamily: string): void;

    setOpacity(element: RendererElement, opacity: RendererOpacity): void;

    setVisibility(element: RendererElement, visible: boolean): any;

    setText(element: RendererElement, text: string): void;

    setTransform(element: RendererElement, to: RendererTransform): void;

    getBounds(element: RendererElement): Rect2;

    getTextWidth(text: string, fontSize: number, fontFamily: string): number | undefined;
}