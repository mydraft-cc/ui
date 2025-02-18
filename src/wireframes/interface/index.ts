/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, LoadedImage, Rect2, Vec2 } from '@app/core/utils';

export { Color, Rect2, Vec2 } from '@app/core/utils';
export type Size = { x: number; y: number };
export type Appearance = { [key: string]: any };
export type Configurable = any;
export type CreatedShape = { renderer: string; size?: { x: number; y: number }; appearance?: Appearance };
export type RenderContext = { shape: Shape; renderer2: ShapeRenderer; rect: Rect2 };
export type RendererColor = string | number | Color | Shape;
export type RendererElement = any;
export type RendererOpacity = number | Shape;
export type RendererText = TextConfig | Shape;
export type RendererWidth = number | Shape;
export type ShapeSource = ShapeSourceIcon | ShapeSourceImage | ShapeSourceText | ShapeSourceUrl;
export type ShapeSourceIcon = { type: 'Icon';  text: string; fontFamily: string };
export type ShapeSourceImage = { type: 'Image';  image: LoadedImage };
export type ShapeSourceText = { type: 'Text';  text: string };
export type ShapeSourceUrl = { type: 'Url'; url: string };
export type TextConfig = { text: string; fontSize?: number; fontFamily?: string; alignment?: string };
export type TextDecoration = 'underline' | 'none';

export interface ShapePlugin {
    identifier(): string;

    defaultAppearance(): Appearance;

    defaultSize(): Size;

    configurables?(factory: ConfigurableFactory): Configurable[];

    constraint?(factory: ConstraintFactory): Constraint;

    previewOffset?(): { left: number; top: number; right: number; bottom: number };

    previewSize?(desiredWidth: number, desiredHeight: number): Size;

    create?(source: ShapeSource): CreatedShape | null | undefined;

    showInGallery?(): boolean;

    render(ctx: RenderContext): any;
}

export interface ShapeProperties {
    setForegroundColor(color: RendererColor): ShapeProperties;

    setBackgroundColor(color: RendererColor): ShapeProperties;

    setStrokeColor(color: RendererColor): ShapeProperties;

    setStrokeStyle(cap: string, join: string): ShapeProperties;

    setFontSize(fontSize: RendererText | number): ShapeProperties;

    setFontFamily(fontFamily: RendererText | string): ShapeProperties;

    setOpacity(opacity: RendererOpacity): ShapeProperties;

    setText(text: RendererText | string, markdown?: boolean): ShapeProperties;
    
    setTextDecoration(decoration: TextDecoration): ShapeProperties;
}

export type ShapePropertiesFunc = (properties: ShapeProperties) => void;
export type ShapeRendererFunc = (factory: ShapeRenderer) => void;

export interface ShapeRenderer {
    ellipse(strokeWidth: RendererWidth, bounds: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    rectangle(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    roundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    roundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    roundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    roundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc): RendererElement;

    path(strokeWidth: RendererWidth, path: string, properties?: ShapePropertiesFunc): RendererElement;

    raster(source: string, bounds: Rect2, preserveAspectRatio?: boolean, properties?: ShapePropertiesFunc): RendererElement;

    text(config: RendererText, bounds: Rect2, properties?: ShapePropertiesFunc, allowMarkdown?: boolean): RendererElement;

    textMultiline(config: RendererText, bounds: Rect2, properties?: ShapePropertiesFunc, allowMarkdown?: boolean): RendererElement;

    getOuterBounds(strokeWidth: RendererWidth, bounds: Rect2): Rect2;

    getTextWidth(text: string, fontSize: number, fontFamily: string): number;

    group(items: ShapeRendererFunc, clip?: ShapeRendererFunc, properties?: ShapePropertiesFunc): RendererElement;
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

    readonly renderCache: Record<string, any>;

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

export function getPageLink(id: string) {
    return `page://${id}`;
}

export function getPageLinkId(link: string) {
    return link.substring(7);
}

export function isPageLink(link: string | null | undefined) {
    return link?.indexOf('page://') === 0;
}

export interface Constraint {
    updateSize(shape: Shape, size: Vec2, prev?: Shape): Vec2;

    calculateSizeX(): boolean;

    calculateSizeY(): boolean;
}

export interface ConstraintFactory {
    size(width?: number, height?: number): Constraint;

    minSize(): Constraint;

    textHeight(padding: number): Constraint;

    textSize(paddingX?: number, paddingY?: number, lineHeight?: number, resizeWidth?: false, minWidth?: number): Constraint;
}

export interface ConfigurableFactory {
    selection(name: string, label: string, options: string[]): Configurable;

    slider(name: string, label: string, min: number, max: number): Configurable;

    number(name: string, label: string, min: number, max: number): Configurable;

    text(name: string, label: string): Configurable;

    toggle(name: string, label: string): Configurable;

    color(name: string, label: string): Configurable;
}
