import {
    Rect2,
    Rotation,
    Vec2
} from '@app/core'

import { DiagramShape } from '@app/wireframes/model';

export interface TextConfig { text: string; fontSize?: number; alignment?: string; }

export interface AbstractRenderer {
    createRoundedRectangle(bounds: Rect2, strokeThickness: number | DiagramShape, cornerRadius: number): any;

    createRoundedRectangleLeft(bounds: Rect2, strokeThickness: number | DiagramShape, cornerRadius: number): any;

    createRoundedRectangleRight(bounds: Rect2, strokeThickness: number | DiagramShape, cornerRadius: number): any;

    createEllipse(bounds: Rect2, strokeThickness: number | DiagramShape): any;

    createCircle(center: Vec2, strokeThickness: number | DiagramShape, radius: number): any;

    createStar(center: Vec2, count: number, radius1: number, radius2: number, strokeThickness: number | DiagramShape): any;

    createPath(path: string, strokeThickness: number | DiagramShape): any;

    createBoundedPath(bounds: Rect2, path: string, strokeThickness: number | DiagramShape): any;

    createSinglelineText(bounds: Rect2, config: TextConfig | DiagramShape): any;

    createMultilineText(bounds: Rect2, config: TextConfig | DiagramShape): any;

    createRaster(bounds: Rect2, source: string): any;

    createClipGroup(clipItem: any, ...items: any[]): any;

    createGroup(...items: any[]): any;

    setForegroundColor(element: any, color: any): void;

    setBackgroundColor(element: any, color: any): void;

    setStrokeColor(element: any, color: any): void;

    setStrokeStyle(element: any, cap: string, join: string): void;

    setFontFamily(element: any, fontFamily: string): void;

    setOpacity(element: any, opacity: number | DiagramShape): void;

    setPosition(element: any, position: Vec2 | DiagramShape): void;

    setRotation(element: any, rotation: Rotation | DiagramShape): void;

    getBounds(element: any): Rect2;

    getTextWidth(text: string, fontSize: number, fontFamily: string): number | undefined;
}