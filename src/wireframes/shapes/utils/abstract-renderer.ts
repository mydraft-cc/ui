import {
    Color,
    Rect2,
    Rotation,
    Vec2
} from '@app/core';

import { DiagramShape } from '@app/wireframes/model';

export interface TextConfig { text: string; fontSize?: number; alignment?: string; }

export type RendererColor = string | number | Color | DiagramShape;
export type RendererElement = any;
export type RendererOpacity = number | DiagramShape;
export type RendererPosition = Vec2 | DiagramShape;
export type RendererRotation = Rotation | DiagramShape;
export type RendererText = TextConfig | DiagramShape;
export type RendererThickness = number | DiagramShape;

export interface AbstractRenderer {
    createRoundedRectangle(bounds: Rect2, strokeThickness: RendererThickness, cornerRadius: number): RendererElement;

    createRoundedRectangleLeft(bounds: Rect2, strokeThickness: RendererThickness, cornerRadius: number): RendererElement;

    createRoundedRectangleRight(bounds: Rect2, strokeThickness: RendererThickness, cornerRadius: number): RendererElement;

    createEllipse(bounds: Rect2, strokeThickness: RendererThickness): RendererElement;

    createCircle(center: Vec2, strokeThickness: RendererThickness, radius: number): RendererElement;

    createStar(center: Vec2, count: number, radius1: number, radius2: number, strokeThickness: RendererThickness): RendererElement;

    createPath(path: string, strokeThickness: RendererThickness): RendererElement;

    createBoundedPath(bounds: Rect2, path: string, strokeThickness: RendererThickness): RendererElement;

    createSinglelineText(bounds: Rect2, config: RendererText): RendererElement;

    createMultilineText(bounds: Rect2, config: RendererText): RendererElement;

    createRaster(bounds: Rect2, source: string): RendererElement;

    createClipGroup(clipItem: RendererElement, ...items: RendererElement[]): RendererElement;

    createGroup(...items: RendererElement[]): RendererElement;

    setForegroundColor(element: RendererElement, color: RendererColor): void;

    setBackgroundColor(element: RendererElement, color: RendererColor): void;

    setStrokeColor(element: RendererElement, color: RendererColor): void;

    setStrokeStyle(element: RendererElement, cap: string, join: string): void;

    setFontFamily(element: RendererElement, fontFamily: string): void;

    setOpacity(element: RendererElement, opacity: RendererOpacity): void;

    setPosition(element: RendererElement, position: RendererPosition): void;

    setRotation(element: RendererElement, rotation: RendererRotation): void;

    getBounds(element: RendererElement): Rect2;

    getTextWidth(text: string, fontSize: number, fontFamily: string): number | undefined;
}