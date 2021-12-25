/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, Rect2, Vec2 } from '@app/core';

export { Color, Rect2, Vec2 } from '@app/core';

export interface TextConfig { text: string; fontSize?: number; alignment?: string }

export type RendererColor = string | number | Color | Shape;
export type RendererElement = any;
export type RendererOpacity = number | Shape;
export type RendererText = TextConfig | Shape;
export type RendererWidth = number | Shape;
export type Configurable = any;

export interface RenderContext {
    readonly shape: Shape;
    readonly renderer2: ShapeRenderer2;
    readonly rect: Rect2;
}

export interface ShapePlugin {
    identifier(): string;

    defaultAppearance(): { [key: string]: any };

    defaultSize(): { x: number; y: number };

    configurables?(factory: ConfigurableFactory): Configurable[];

    constraint?(factory: ConstraintFactory): Constraint;

    previewOffset?(): { x: number; y: number };

    showInGallery?(): boolean;

    render(ctx: RenderContext): any;
}

export interface ShapeProperties {
    readonly shape: any;

    setForegroundColor(color: RendererColor): ShapeProperties;

    setBackgroundColor(color: RendererColor): ShapeProperties;

    setStrokeColor(color: RendererColor): ShapeProperties;

    setStrokeStyle(cap: string, join: string): ShapeProperties;

    setFontFamily(fontFamily: string): ShapeProperties;

    setOpacity(opacity: RendererOpacity): ShapeProperties;

    setText(text: string): ShapeProperties;
}

export type ShapePropertiesFunc = (properties: ShapeProperties) => void;
export type ShapeFactoryFunc = (factory: ShapeFactory) => void;

export interface ShapeFactory {
    ellipse(strokeWidth: RendererWidth, bounds?: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    rectangle(strokeWidth: RendererWidth, radius?: number, bounds?: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    roundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    roundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    roundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    roundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    path(strokeWidth: RendererWidth, path: string, bounds?: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    raster(source: string, bounds?: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    text(config?: RendererText, bounds?: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    textMultiline(config?: RendererText, bounds?: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    group(items: ShapeFactoryFunc, clip?: ShapeFactoryFunc, properties?: ShapePropertiesFunc): RendererElement;
}

export interface ShapeRenderer2 extends ShapeFactory {
    getBounds(element: RendererElement): Rect2;

    getLocalBounds(element: RendererElement): Rect2;

    getTextWidth(text: string, fontSize: number, fontFamily: string): number;
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

    readonly renderCache: object;

    getAppearance(key: string): any;
}

export const DefaultAppearance = {
    BACKGROUND_COLOR: 'FOREGROUND_COLOR',
    FONT_FAMILY: 'FONT_FAMILY',
    FONT_SIZE: 'FONT_SIZE',
    FOREGROUND_COLOR: 'BACKGROUND_COLOR',
    ICON_FONT_FAMILY: 'ICON_FONT_FAMILY',
    LINK: 'LINK',
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
