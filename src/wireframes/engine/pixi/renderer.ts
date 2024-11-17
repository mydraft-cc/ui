/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable quote-props */

import { marked } from 'marked';
import { Assets, Container, ContainerChild, Graphics, GraphicsPath, HTMLText, Sprite, StrokeStyle, TextStyle, Texture, ViewContainer } from 'pixi.js';
import { Rect2, TextMeasurer, Types } from '@app/core/utils';
import { RendererColor, RendererOpacity, RendererText, RendererWidth, Shape, ShapeProperties, ShapePropertiesFunc, ShapeRenderer, ShapeRendererFunc, TextConfig, TextDecoration } from '@app/wireframes/interface';
import { getBackgroundColor, getFontFamily, getFontSize, getForegroundColor, getOpacity, getStrokeColor, getStrokeWidth, getText, getTextAlignment } from './../shared';
import { PixiHelper } from './utils';

type Properties = {
    fill?: string | null;
    bounds: Rect2;
    opacity: number;
    path: string | null;
    radius: number;
    raster: { source: string; keepRatio?: boolean } | null;
    stroke: StrokeStyle;
    textContent: { text?: string; markdown?: boolean; underline?: boolean };
    textStyle: Partial<TextStyle>;
    textMode?: 'Single' | 'Multi';
};

type Test = (existing: ContainerChild) => boolean;

const IS_GRAPHICS: Test = (existing?: ContainerChild) => {
    return Types.is(existing, Graphics);
};

const IS_GROUP: Test = (existing?: ContainerChild) => {
    return Types.is(existing, Container);
};

const IS_SPRITE: Test = (existing?: ContainerChild) => {
    return Types.is(existing, Sprite);
};

const IS_TEXT: Test = (existing?: ContainerChild) => {
    return Types.is(existing, HTMLText);
};

type Factory<T> = (p: Properties, existing?: T) => T;

const FACTORY_RECTANGLE: Factory<Graphics> = (p: Properties, existing?: Graphics) => {
    existing?.clear();
    existing ??= new Graphics();

    const { bounds, radius } = p;
    if (radius > 0) {
        existing.roundRect(bounds.x, bounds.y, bounds.w, bounds.h, radius);
    } else {
        existing.rect(bounds.x, bounds.y, bounds.w, bounds.h);
    }
    return existing;
};

const FACTORY_ELLIPSE = (p: Properties, existing?: Graphics) => {
    existing?.clear();
    existing ??= new Graphics();

    const { bounds } = p;
    const rx = bounds.w * 0.5;
    const ry = bounds.h * 0.5;
    const cx = bounds.x + rx;
    const cy = bounds.y + ry;
    existing.ellipse(cx, cy, rx, ry);
    return existing;
};

const FACTORY_ROUNDED_RECTANGLE_LEFT = (p: Properties, existing?: Graphics) => {
    if (!existing) {
        existing = new Graphics();
    } else {
        existing.clear();
    }

    PixiHelper.roundedRectangleLeft(existing, p.bounds, p.radius);
    return existing;
};

const FACTORY_ROUNDED_RECTANGLE_RIGHT = (p: Properties, existing?: Graphics) => {
    if (!existing) {
        existing = new Graphics();
    } else {
        existing.clear();
    }

    PixiHelper.roundedRectangleRight(existing, p.bounds, p.radius);
    return existing;
};

const FACTORY_ROUNDED_RECTANGLE_TOP = (p: Properties, existing?: Graphics) => {
    if (!existing) {
        existing = new Graphics();
    } else {
        existing.clear();
    }

    PixiHelper.roundedRectangleTop(existing, p.bounds, p.radius);
    return existing;
};

const FACTORY_ROUNDED_RECTANGLE_BOTTOM = (p: Properties, existing?: Graphics) => {
    if (!existing) {
        existing = new Graphics();
    } else {
        existing.clear();
    }

    PixiHelper.roundedRectangleBottom(existing, p.bounds, p.radius);
    return existing;
};

const FACTORY_PATH = (p: Properties, existing?: Graphics) => {
    if (!existing) {
        existing = new Graphics();
    } else {
        existing.clear();
    }

    existing.path(new GraphicsPath(p.path!));
    return existing;
};

const FACTORY_GROUP = (_: Properties, existing?: Container) => {
    if (!existing) {
        existing = new Graphics();
    } else {
        existing.removeChildren();
    }

    return existing;
};

const FACTORY_SPRITE = (p: Properties, existing?: Sprite) => {
    if (!existing) {
        existing = new Sprite();
    } else {
        existing.removeChildren();
    }

    const { bounds } = p;
    existing.width = bounds.w;
    existing.height = bounds.h;
    return existing;
};

const FACTORY_TEXT = (_: Properties, existing?: HTMLText) => {
    if (!existing) {
        existing = new HTMLText();

        const mask = new Graphics();
        existing.mask = mask;
        existing.resolution = 2;
        existing.addChild(mask);
    }

    return existing;
};

export class PixiRenderer implements ShapeRenderer {
    private currentContainer: Container = null!;
    private currentIndex = 0;
    private clipping = false;
    private wasClipped = false;

    public getContainer() {
        return this.currentContainer;
    }

    public getTextWidth(text: string, fontSize: number, fontFamily: string) {
        return TextMeasurer.DEFAULT.getTextWidth(text, fontSize, fontFamily);
    }

    public setContainer(container: Container, index = 0, clipping = false) {
        this.clipping = clipping;
        this.currentContainer = container;
        this.currentIndex = index;
        this.wasClipped = false;
    }

    public getOuterBounds(_: number, bounds: Rect2) {
        return bounds;
    }

    public rectangle(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {    
        return this.new(IS_GRAPHICS, FACTORY_RECTANGLE, {
            bounds,
            radius,
            stroke: { width: getStrokeWidth(strokeWidth) },
        }, properties);
    }

    public ellipse(strokeWidth: RendererWidth, bounds: Rect2, properties?: ShapePropertiesFunc) {    
        return this.new(IS_GRAPHICS, FACTORY_ELLIPSE, {
            bounds,
            stroke: { width: getStrokeWidth(strokeWidth) },
        }, properties);
    }

    public roundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {    
        return this.new(IS_GRAPHICS, FACTORY_ROUNDED_RECTANGLE_LEFT, {
            bounds,
            radius,
            stroke: { width: getStrokeWidth(strokeWidth) },
        }, properties);
    }

    public roundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new(IS_GRAPHICS, FACTORY_ROUNDED_RECTANGLE_RIGHT, {
            bounds,
            radius,
            stroke: { width: getStrokeWidth(strokeWidth) },
        }, properties);
    }

    public roundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new(IS_GRAPHICS, FACTORY_ROUNDED_RECTANGLE_TOP, {
            bounds,
            radius,
            stroke: { width: getStrokeWidth(strokeWidth) },
        }, properties);
    }

    public roundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {    
        return this.new(IS_GRAPHICS, FACTORY_ROUNDED_RECTANGLE_BOTTOM, {
            bounds,
            radius,
            stroke: { width: getStrokeWidth(strokeWidth) },
        }, properties);
    }

    public path(strokeWidth: RendererWidth, path: string, properties?: ShapePropertiesFunc) {
        return this.new(IS_GRAPHICS, FACTORY_PATH, {
            path,
            stroke: { width: getStrokeWidth(strokeWidth) },
        }, properties);
    }

    public text(config: RendererText, bounds: Rect2, properties?: ShapePropertiesFunc, allowMarkdown?: boolean) {
        const fontSize = getFontSize(config);

        return this.new(IS_TEXT, FACTORY_TEXT, { 
            bounds,
            textStyle: {
                align: getTextAlignment(config) as any,
                fontSize,
                fontFamily: getFontFamily(config),
                lineHeight: fontSize * 1.5,
            },
            textMode: 'Single',
            textContent: { text: getText(config), markdown: allowMarkdown },
        }, properties); 
    }

    public textMultiline(config: RendererText, bounds: Rect2, properties?: ShapePropertiesFunc, allowMarkdown?: boolean) {
        const fontSize = getFontSize(config);

        return this.new(IS_TEXT, FACTORY_TEXT, { 
            bounds,
            textStyle: {
                align: getTextAlignment(config) as any,
                fontSize,
                fontFamily: getFontFamily(config),
                lineHeight: fontSize * 1.5,
                wordWrap: true,
            },
            textMode: 'Multi',
            textContent: { text: getText(config), markdown: allowMarkdown },
        }, properties); 
    }

    public raster(source: string, bounds: Rect2, preserveAspectRatio?: boolean, properties?: ShapePropertiesFunc) {
        return this.new(IS_SPRITE, FACTORY_SPRITE, { bounds, raster: { source, keepRatio: preserveAspectRatio } }, properties);
    }

    public group(items: ShapeRendererFunc, clip?: ShapeRendererFunc, properties?: ShapePropertiesFunc) {
        return this.new( IS_GROUP, FACTORY_GROUP, {}, properties, group => {
            const prevClipping = this.clipping;
            const prevContainer = this.currentContainer;
            const prevIndex = this.currentIndex;
            const prevWasClipped = this.wasClipped;

            this.currentContainer = group;
            this.currentIndex = 0;

            if (items) {
                items(this);
            }

            if (clip) {
                this.clipping = true;
                clip(this);
            }

            this.cleanupAll();
            this.clipping = prevClipping;
            this.currentContainer = prevContainer;
            this.currentIndex = prevIndex;
            this.wasClipped = prevWasClipped;
        });
    }

    private new<T extends ContainerChild>(test: Test, factory: Factory<T>, initialProperties: Partial<Properties>,
        customProperties?: ShapePropertiesFunc,
        customInitializer?: (element: T) => void) {
        if (this.wasClipped) {
            throw new Error('Only one clipping element is supported.');
        }

        const setter = PropertiesSetter.INSTANCE;

        // Create new properties to ensure to unset properties that are not set anymore.
        const properties: Properties = {
            bounds: Rect2.ZERO,
            fill: 'transparent',
            opacity: 1,
            path: null,
            radius: 0,
            raster: null,
            stroke: {},
            textContent: {},
            textStyle: {},
        };

        Object.assign(properties, initialProperties);
        setter.setProperties(properties);

        if (customProperties) {
            customProperties(setter);
        }

        let existing: ContainerChild | undefined = undefined;
        if (this.clipping) {
            existing = this.currentContainer.mask as ViewContainer;
        } else if (this.currentIndex < this.currentContainer.children.length) {
            existing = this.currentContainer.children[this.currentIndex] as ViewContainer;
        }

        if (existing && !test(existing)) {
            existing?.removeFromParent();
            existing = undefined;
        }

        const element = factory(properties, existing as T);

        if (this.clipping) {
            this.currentContainer.mask = element;
            
            this.wasClipped = true;
        } else if (element !== existing) {
            this.currentContainer.addChildAt(element, this.currentIndex);
            this.currentIndex++;
        }

        setter.apply(element);
        customInitializer?.(element);
    }

    public cleanupAll() {
        const childNodes = this.currentContainer.children;
        const childrenSize = childNodes.length;

        for (let i = childrenSize - 1; i >= this.currentIndex; i--) {
            const last = childNodes[i];

            last.removeFromParent();
        }

        if (!this.wasClipped) {
            this.currentContainer.mask = null;
        }
    }
}

type Setters<T> = {
    [P in keyof T]?: (value: T[P], element: ContainerChild, all: T) => void;
};

class PropertiesSetter implements ShapeProperties {
    private static readonly SETTERS: Setters<Properties> = {
        opacity: (value, element) => {
            element.alpha = value;
        },
        fill: (value, element) => {
            if (Types.is(element, Graphics)) {
                element.fill(value as any);
            }
        },
        stroke: (value, element) => {
            if (Types.is(element, Graphics)) {
                element.stroke({ alignment: 1, ...value });
            }
        },
        raster: (value, element, p) => {
            if (Types.is(element, Sprite)) {
                (element as any)['source'] = value;
                if (!value) {
                    element.texture = null!;
                    return;
                }

                const loaded = Assets.load({
                    src: value.source,
                    loadParser: 'loadTextures',
                });

                loaded.then((texture: Texture) => {
                    let lastRequest = (element as any)['source'] as Properties['raster'] | undefined;

                    if (lastRequest?.source !== value.source) {
                        return;
                    }

                    if (value?.keepRatio && texture) {
                        const size = element.getSize();

                        const ratioElement = size.width / size.height;
                        const ratioImage = texture.width / texture.height;
                        let w = 0;
                        let h = 0;

                        if (ratioImage > ratioElement) {
                            w = size.width;
                            h = size.width / ratioImage;
                            element.y = p.bounds.y + (size.height - h) * 0.5;
                        } else {
                            w = size.height * ratioImage;
                            h = size.height;
                            element.x = p.bounds.x + (size.width - w) * 0.5;
                        }

                        element.width = w;
                        element.height = h;
                    }

                    element.texture = texture;
                });
            }
        },
        textContent: (value, element) => {
            if (Types.is(element, HTMLText)) {
                let textOrHtml = value.text;
                if (value.markdown && textOrHtml) {
                    textOrHtml = marked.parseInline(textOrHtml) as string;
                }

                if (value.underline && textOrHtml) {
                    textOrHtml = `<span style="text-decoration: underline">${textOrHtml}</span>`;
                }

                element.text = textOrHtml || '';
            }
        },
        textStyle: (value, element) => {
            if (Types.is(element, HTMLText)) {
                element.style = { padding: 10, ...value };
            }
        },
        textMode: (value, element, p) => {
            if (Types.is(element, HTMLText)) {
                const { bounds } = p;

                const mask = element.mask as Graphics;
                mask?.clear();
                mask?.rect(0, 0, bounds.w, bounds.h).fill(0xffffff);

                const size = element.getSize();
                let x = bounds.x;
                let y = bounds.y;
                if (value === 'Single') {
                    y += Math.max((bounds.h - size.height) * 0.5, 0);
                }

                if (element.style.align === 'center') {
                    x += Math.max((bounds.w - size.width) * 0.5, 0);
                } else if (element.style.align === 'right') {
                    x += bounds.w - size.width;
                }

                element.position = { x, y };
            }
        },
    };

    private static SETTERS_ENTRIES = Object.entries(this.SETTERS);

    private properties: Properties = null!;
    public static readonly INSTANCE = new PropertiesSetter();

    public apply(element: ContainerChild) {
        const oldProperties = (element as any)['properties'] || {} as any;

        for (const [property, setter] of PropertiesSetter.SETTERS_ENTRIES) {
            const value = (this.properties as any)[property];

            if (!Types.equals(value, oldProperties[property])) {
                setter(value as never, element, this.properties);
            }
        }

        (element as any)['properties'] = this.properties;
    }

    public setProperties(properties: Properties) {
        this.properties = properties;
    }

    public setTextDecoration(decoration: TextDecoration): ShapeProperties {
        this.properties.textContent.underline = decoration === 'underline';
        return this;
    }

    public setBackgroundColor(color: RendererColor | null | undefined): ShapeProperties {
        this.properties.fill = PixiHelper.toColor(getBackgroundColor(color));
        return this;
    }

    public setForegroundColor(color: RendererColor | null | undefined): ShapeProperties {
        this.properties.textStyle.fill = PixiHelper.toColor(getForegroundColor(color));
        return this;
    }

    public setStrokeColor(color: RendererColor | null | undefined): ShapeProperties {
        this.properties.stroke.color = PixiHelper.toColor(getStrokeColor(color));
        return this;
    }

    public setStrokeWidth(width: number): ShapeProperties {
        this.properties.stroke.width = width;
        return this;
    }

    public setFontSize(fontSize: TextConfig | Shape | number | null | undefined): ShapeProperties {
        this.properties.textStyle.fontSize = getFontSize(fontSize);
        return this;
    }

    public setFontFamily(fontFamily: TextConfig | string | null | undefined): ShapeProperties {
        this.properties.textStyle.fontFamily = getFontFamily(fontFamily);
        return this;
    }

    public setOpacity(opacity: RendererOpacity | null | undefined): ShapeProperties {
        this.properties.opacity = getOpacity(opacity);
        return this;
    }

    public setText(text: RendererText | string | null | undefined, markdown?: boolean): ShapeProperties {
        this.properties.textContent = { text: getText(text), markdown };
        return this;
    }

    public setStrokeStyle(cap: string, join: string): ShapeProperties {
        this.properties.stroke.cap = cap as any;
        this.properties.stroke.join = join as any;
        return this;
    }
}