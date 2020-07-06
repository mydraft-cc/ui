/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, Rect2, Vec2 } from '@app/core';

export { Color, Rect2, Vec2 } from '@app/core';

export interface TextConfig { text: string; fontSize?: number; alignment?: string; }

export type RendererColor = string | number | Color | Shape;
export type RendererElement =  any;
export type RendererOpacity =  number | Shape;
export type RendererText =  TextConfig | Shape;
export type RendererWidth =  number | Shape;
export type Configurable = any;

export class RenderContext {
    public readonly items: any[] = [];

    constructor(
        public readonly renderer: ShapeRenderer,
        public readonly shape: Shape,
        public readonly rect: Rect2,
    ) {
    }

    public add(item: any) {
        this.items.push(item);
    }
}

export interface ShapePlugin {
    identifier(): string;

    defaultAppearance(): { [key: string]: any };

    defaultSize(): { x: number, y: number };

    configurables?(factory: ConfigurableFactory): Configurable[];

    constraint?(factory: ConstraintFactory): Constraint;

    previewOffset?(): { x: number, y: number };

    showInGallery?(): boolean;

    render(ctx: RenderContext): any;
}

export interface ShapeRenderer {
    createRoundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2): RendererElement;

    createRoundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2): RendererElement;

    createRoundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2): RendererElement;

    createRoundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2): RendererElement;

    createPath(strokeWidth: RendererWidth, path: string, bounds?: Rect2): RendererElement;

    createRaster(source: string, bounds?: Rect2): RendererElement;

    createRectangle(strokeWidth: RendererWidth, radius?: number, bounds?: Rect2): RendererElement;

    createEllipse(strokeWidth: RendererWidth, bounds?: Rect2): RendererElement;

    createSinglelineText(config?: RendererText, bounds?: Rect2): RendererElement;

    createMultilineText(config?: RendererText, bounds?: Rect2): RendererElement;

    createGroup(items: RendererElement[], clipItem?: RendererElement): RendererElement;

    setForegroundColor(element: RendererElement, color: RendererColor): ShapeRenderer;

    setBackgroundColor(element: RendererElement, color: RendererColor): ShapeRenderer;

    setStrokeColor(element: RendererElement, color: RendererColor): ShapeRenderer;

    setStrokeStyle(element: RendererElement, cap: string, join: string): ShapeRenderer;

    setFontFamily(element: RendererElement, fontFamily: string): ShapeRenderer;

    setOpacity(element: RendererElement, opacity: RendererOpacity): ShapeRenderer;

    setVisibility(element: RendererElement, visible: boolean): ShapeRenderer;

    setText(element: RendererElement, text: string): ShapeRenderer;

    getBounds(element: RendererElement, untransformed?: boolean): Rect2;

    getTextWidth(text: string, fontSize: number, fontFamily: string): number | undefined;
}

export interface Shape {
    readonly fontSize: number;

    readonly fontFamily: string;

    readonly backgroundColor: string;

    readonly foregroundColor: string;

    readonly opacity: number;

    readonly strokeColor: string;

    readonly strokeThickness: number;

    readonly text: string;

    readonly textAlignment: string;

    readonly textDisabled: boolean;

    getAppearance(key: string): any;
}

export const DefaultAppearance = {
    BACKGROUND_COLOR: 'FOREGROUND_COLOR',
    FONT_FAMILY: 'FONT_FAMILY',
    FONT_SIZE: 'FONT_SIZE',
    FOREGROUND_COLOR: 'BACKGROUND_COLOR',
    ICON_FONT_FAMILY: 'ICON_FONT_FAMILY',
    OPACITY: 'OPACITY',
    STROKE_COLOR: 'STROKE_COLOR',
    STROKE_THICKNESS: 'STROKE_THICKNESS',
    TEXT_ALIGNMENT: 'TEXT_ALIGNMENT',
    TEXT_DISABLED: 'TEXT_DISABLED',
    TEXT: 'TEXT',
};

export interface Constraint {
    updateSize(shape: Shape, size: Vec2, prev?: Shape): Vec2;

    calculateSizeX(): boolean;

    calculateSizeY(): boolean;
}

export interface ConstraintFactory {
    size(width?: number, height?: number): Constraint;

    minSize(): Constraint;

    textHeight(padding: number): Constraint;

    textSize(padding?: number, lineHeight?: number, resizeWidth?: false, minWidth?: number): Constraint;
}

export interface ConfigurableFactory {
    selection(name: string, label: string, options: string[]): Configurable;

    slider(name: string, label: string, min: number, max: number): Configurable;

    number(name: string, label: string, min: number, max: number): Configurable;

    color(name: string, label: string): Configurable;
}
