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
    createRoundedRectangleLeft(bounds: Rect2, strokeWidth: RendererWidth, radius: number): RendererElement;

    createRoundedRectangleRight(bounds: Rect2, strokeWidth: RendererWidth, radius: number): RendererElement;

    createPath(path: string, strokeWidth: RendererWidth): RendererElement;

    createBoundedPath(bounds: Rect2, path: string, strokeWidth: RendererWidth): RendererElement;

    createRaster(bounds: Rect2, source: string): RendererElement;

    createRectangle(bounds?: Rect2, strokeWidth?: RendererWidth, radius?: number): RendererElement;

    createEllipse(bounds?: Rect2, strokeWidth?: RendererWidth): RendererElement;

    createSinglelineText(bounds: Rect2, config?: RendererText): RendererElement;

    createMultilineText(bounds: Rect2, config?: RendererText): RendererElement;

    createClipGroup(clipItem: RendererElement, ...items: RendererElement[]): RendererElement;

    createGroup(...items: RendererElement[]): RendererElement;

    setForegroundColor(element: RendererElement, color: RendererColor): void;

    setBackgroundColor(element: RendererElement, color: RendererColor): void;

    setStrokeColor(element: RendererElement, color: RendererColor): void;

    setStrokeStyle(element: RendererElement, cap: string, join: string): void;

    setFontFamily(element: RendererElement, fontFamily: string): void;

    setOpacity(element: RendererElement, opacity: RendererOpacity): void;

    setVisibility(element: RendererElement, visible: boolean): any;

    setText(element: RendererElement, text: string): void;

    transform(element: RendererElement, to: RendererTransform): void;

    getBounds(element: RendererElement): Rect2;

    getTextWidth(text: string, fontSize: number, fontFamily: string): number | undefined;
}