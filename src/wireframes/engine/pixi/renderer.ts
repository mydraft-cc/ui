/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable quote-props */

import { marked } from 'marked';
import { Assets, Container, ContainerChild, Graphics, GraphicsPath, HTMLText, Sprite, StrokeStyle, TextStyle, ViewContainer } from 'pixi.js';
import { Rect2, TextMeasurer, Types } from '@app/core/utils';
import { RendererColor, RendererOpacity, RendererText, RendererWidth, Shape, ShapeProperties, ShapePropertiesFunc, ShapeRenderer, ShapeRendererFunc, TextConfig, TextDecoration } from '@app/wireframes/interface';
import { getBackgroundColor, getFontFamily, getFontSize, getForegroundColor, getOpacity, getStrokeColor, getStrokeWidth, getText, getTextAlignment, getValue, setValue } from './../shared';
import { PixiHelper } from './utils';

type GraphicsType =
    'Ellipse' | 
    'Path' |
    'Rect' | 
    'RoundedRectangleBottom' |
    'RoundedRectangleLeft' | 
    'RoundedRectangleRight' | 
    'RoundedRectangleTop';

type TextType = 'Single' | 'Multi';

type Properties = {
    graphics?: {
        bounds: Rect2;
        fill: string;
        path?: string;
        radius: number;
        stroke: StrokeStyle;
        type: GraphicsType;
    };
    opacity: number;
    sprite?: {
        bounds: Rect2;
        ratio: boolean;
        source: string;
    };
    textAlign?: {
        align: TextStyle['align'];
        bounds: Rect2;
        type: TextType;
    };
    textContent?: { text?: string; markdown?: boolean; underline?: boolean };
    textStyle?: Partial<TextStyle>;
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
    return Types.is(existing, Container) && Types.is(existing.getChildAt(1), HTMLText);
};

type Factory<T> = (p: Properties, existing?: T) => T;

const FACTORY_GRAPHICS = (_: Properties, existing?: Graphics) => {
    return existing ??= new Graphics();
};

const FACTORY_SPRITE = (_: Properties, existing?: Sprite) => {
    return existing ??= new Sprite();
};

const FACTORY_GROUP = (_: Properties, existing?: Container) => {
    if (!existing) {
        existing = new Graphics();
    } else {
        existing.removeChildren();
    }

    return existing;
};


const FACTORY_TEXT = (_: Properties, existing?: Container) => {
    if (!existing) {
        existing = new Container();

        const mask = new Graphics();
        existing.mask = mask;
        existing.addChild(mask);

        const text = new HTMLText();
        text.resolution = 2;
        existing.addChild(text);
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
        return this.new(IS_GRAPHICS, FACTORY_GRAPHICS, {
            graphics: {
                bounds,
                fill: 'transparent',
                radius,
                stroke: { width: getStrokeWidth(strokeWidth) },
                type: 'Rect',
            },
        }, properties);
    }

    public ellipse(strokeWidth: RendererWidth, bounds: Rect2, properties?: ShapePropertiesFunc) {    
        return this.new(IS_GRAPHICS, FACTORY_GRAPHICS, {
            graphics: {
                bounds,
                fill: 'transparent',
                radius: 0,
                stroke: { width: getStrokeWidth(strokeWidth) },
                type: 'Ellipse',
            },
        }, properties);
    }

    public roundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {    
        return this.new(IS_GRAPHICS, FACTORY_GRAPHICS, {
            graphics: {
                bounds,
                fill: 'transparent',
                radius,
                stroke: { width: getStrokeWidth(strokeWidth) },
                type: 'RoundedRectangleLeft',
            },
        }, properties);
    }

    public roundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new(IS_GRAPHICS, FACTORY_GRAPHICS, {
            graphics: {
                bounds,
                fill: 'transparent',
                radius,
                stroke: { width: getStrokeWidth(strokeWidth) },
                type: 'RoundedRectangleRight',
            },
        }, properties);
    }

    public roundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new(IS_GRAPHICS, FACTORY_GRAPHICS, {
            graphics: {
                bounds,
                fill: 'transparent',
                radius,
                stroke: { width: getStrokeWidth(strokeWidth) },
                type: 'RoundedRectangleTop',
            },
        }, properties);
    }

    public roundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {    
        return this.new(IS_GRAPHICS, FACTORY_GRAPHICS, {
            graphics: {
                bounds,
                fill: 'transparent',
                radius,
                stroke: { width: getStrokeWidth(strokeWidth) },
                type: 'RoundedRectangleBottom',
            },
        }, properties);
    }

    public path(strokeWidth: RendererWidth, path: string, properties?: ShapePropertiesFunc) {
        return this.new(IS_GRAPHICS, FACTORY_GRAPHICS, {
            graphics: {
                bounds: Rect2.EMPTY,
                fill: 'transparent',
                path,
                radius: 0,
                stroke: { width: getStrokeWidth(strokeWidth) },
                type: 'Path',
            },
        }, properties);
    }

    public text(config: RendererText, bounds: Rect2, properties?: ShapePropertiesFunc, allowMarkdown?: boolean) {
        const fontSize = getFontSize(config);
        const align = getTextAlignment(config) as any;

        return this.new(IS_TEXT, FACTORY_TEXT, {
            textAlign: {
                align,
                bounds,
                type: 'Single',
            },
            textContent: { text: getText(config), markdown: allowMarkdown },
            textStyle: {
                align,
                fontFamily: getFontFamily(config),
                fontSize,
                lineHeight: fontSize * 1.5,
                wordWrap: false,
            },
        }, properties); 
    }

    public textMultiline(config: RendererText, bounds: Rect2, properties?: ShapePropertiesFunc, allowMarkdown?: boolean) {
        const fontSize = getFontSize(config);
        const align = getTextAlignment(config) as any;

        return this.new(IS_TEXT, FACTORY_TEXT, {
            textAlign: {
                align,
                bounds,
                type: 'Multi',
            },
            textContent: { text: getText(config), markdown: allowMarkdown },
            textStyle: {
                align,
                fontFamily: getFontFamily(config),
                fontSize,
                lineHeight: fontSize * 1.5,
                wordWrap: true,
                wordWrapWidth: bounds.w,
            },
        }, properties); 
    }

    public raster(source: string, bounds: Rect2, preserveAspectRatio?: boolean, properties?: ShapePropertiesFunc) {
        return this.new(IS_SPRITE, FACTORY_SPRITE, {
            sprite: {
                bounds,
                ratio: !!preserveAspectRatio,
                source,
            },
        }, properties);
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
            opacity: 1,
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
            if (this.currentContainer.mask !== element) {
                this.currentContainer.mask = element;
            }

            this.wasClipped = true;
        } else {
            if (element !== existing) {
                this.currentContainer.addChildAt(element, this.currentIndex);
            }

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

type Setters<T, E> = {
    [P in keyof T]?: (value: T[P], element: E) => void;
};

class PropertiesSetter implements ShapeProperties {
    private static readonly SETTERS = Object.entries({
        graphics: (value, element) => {
            if (!value || !Types.is(element, Graphics)) {
                return;
            }

            const { bounds, fill, path, radius, stroke, type } = value;

            element.clear();
            if (type === 'Rect' && radius > 0) {
                element.roundRect(bounds.x, bounds.y, bounds.w, bounds.h, radius);
            } else if (type === 'Rect') {
                element.rect(bounds.x, bounds.y, bounds.w, bounds.h);
            } else if (type === 'Path' && path) {
                element.path(new GraphicsPath(path));
            } else if (type === 'RoundedRectangleLeft') {
                PixiHelper.roundedRectangleLeft(element, bounds, radius);
            } else if (type === 'RoundedRectangleRight') {
                PixiHelper.roundedRectangleRight(element, bounds, radius);
            } else if (type === 'RoundedRectangleTop') {
                PixiHelper.roundedRectangleTop(element, bounds, radius);
            } else if (type === 'RoundedRectangleBottom') {
                PixiHelper.roundedRectangleBottom(element, bounds, radius);
            } else {
                const rx = bounds.w * 0.5;
                const ry = bounds.h * 0.5;
                const cx = bounds.x + rx;
                const cy = bounds.y + ry;
                element.ellipse(cx, cy, rx, ry);
            }
            element.fill(fill);
            element.stroke({ alignment: 1, ...stroke });
        },
        opacity: (value, element) => {
            element.alpha = value;
        },
        sprite: async (value, element) => {
            if (!value || !Types.is(element, Sprite)) {
                return;
            }

            const { bounds, ratio, source: src } = value;
            if (!src) {
                return;
            }

            function align(target: Sprite, bounds: Rect2, ratio: boolean) {
                const texture = target.texture;

                if (!texture) {
                    return;
                }

                let x = 0;
                let y = 0;
                let w = bounds.w;
                let h = bounds.h;

                if (ratio && texture) {
                    const size = element.getSize();

                    const ratioElement = size.width / size.height;
                    const ratioImage = texture.width / texture.height;

                    if (ratioImage > ratioElement) {
                        w = size.width;
                        h = size.width / ratioImage;
                        y = bounds.y + (size.height - h) * 0.5;
                    } else {
                        w = size.height * ratioImage;
                        h = size.height;
                        x = bounds.x + (size.width - w) * 0.5;
                    }
                }

                element.x = x;
                element.y = y;
                element.width = w;
                element.height = h;
            }

            let lastValue = getValue<Properties['sprite']>(element, 'values');
            if (lastValue?.source === value.source) {
                align(element, bounds, ratio);
                return;
            }
            
            const texture = await Assets.load({ src, loadParser: 'loadTextures' });
        
            lastValue = getValue<Properties['sprite']>(element, 'values');
            if (lastValue !== value) {
                return;
            }

            element.texture = texture;
            align(element, bounds, ratio);
        },
        textContent: (value, element) => {
            if (!value || !Types.is(element, Container)) {
                return;
            }

            let textOrHtml = value.text;
            if (value.markdown && textOrHtml) {
                textOrHtml = marked.parseInline(textOrHtml) as string;
            }

            if (value.underline && textOrHtml) {
                textOrHtml = `<span style="text-decoration: underline">${textOrHtml}</span>`;
            }

            const text = element.getChildAt(1) as HTMLText;
            text.text = textOrHtml || '';
            setValue(element, 'size', null);
        },
        textStyle: (value, element) => {       
            if (!value || !Types.is(element, Container)) {
                return;
            }
                 
            const text = element.getChildAt(1) as HTMLText;
            text.style = { ...value };
            setValue(text, 'size', null);
        },
        textAlign: (value, element) => {
            if (!value || !Types.is(element, Container)) {
                return;
            }


            const { align, bounds, type } = value;
            element.position = { x: bounds.x, y: bounds.y };

            const mask = element.getChildAt(0) as Graphics;
            mask?.clear();
            mask?.rect(0, 0, bounds.w, bounds.h).fill('red');

            const text = element.getChildAt(1) as HTMLText;
            let ax = 0;
            let ay = 0;
            let px = 0;
            let py = 0;

            if (type === 'Single') {
                ay = 0.5;
                py = 0.5 * bounds.h;
            }

            if (align === 'center') {
                ax = 0.5;
                px = 0.5 * bounds.w;
            } else if (align === 'right') {
                ax = 1;
                px = bounds.w;
            }
                
            if (type === 'Single') {
                const size = getValue(element, 'size', () => text.getSize());
                if (size.width > bounds.w) {
                    ax = 0;
                    px = 0;
                }
            }

            text.anchor = { x: ax, y: ay };
            text.position = { x: px, y: py };
        },
    } as Setters<Properties, ContainerChild>);

    private properties: Properties = null!;
    public static readonly INSTANCE = new PropertiesSetter();

    public apply(element: ContainerChild) {
        const oldProperties = getValue(element, 'properties', () => ({} as Record<string, any>));

        const properties = this.properties as Record<string, any>;
        for (const [property, setter] of PropertiesSetter.SETTERS) {
            const value = properties[property];

            if (!Types.equals(value, oldProperties[property])) {
                setter(value as never, element);
            }
        }

        setValue(element, 'properties', properties);
    }

    public setProperties(properties: Properties) {
        this.properties = properties;
    }

    public setTextDecoration(decoration: TextDecoration): ShapeProperties {
        const props = this.properties.textContent;
        if (props) {
            props.underline = decoration === 'underline';
        }
        return this;
    }

    public setBackgroundColor(color: RendererColor | null | undefined): ShapeProperties {
        const props = this.properties.graphics;
        if (props) {
            props.fill = PixiHelper.toColor(getBackgroundColor(color));
        }
        return this;
    }

    public setForegroundColor(color: RendererColor | null | undefined): ShapeProperties {
        const props = this.properties.textStyle;
        if (props) {
            props.fill = PixiHelper.toColor(getForegroundColor(color));
        }
        return this;
    }

    public setStrokeColor(color: RendererColor | null | undefined): ShapeProperties {
        const props = this.properties.graphics;
        if (props) {
            props.stroke.color = PixiHelper.toColor(getStrokeColor(color));
        }
        return this;
    }

    public setStrokeWidth(width: number): ShapeProperties {
        const props = this.properties.graphics;
        if (props) {
            props.stroke.width = width;
        }
        return this;
    }

    public setStrokeStyle(cap: string, join: string): ShapeProperties {
        const props = this.properties.graphics;
        if (props) {
            props.stroke.cap = cap as any;
            props.stroke.join = join as any;
        }
        return this;
    }

    public setFontSize(fontSize: TextConfig | Shape | number | null | undefined): ShapeProperties {
        const props = this.properties.textStyle;
        if (props) {
            props.fontSize = getFontSize(fontSize);
        }
        return this;
    }

    public setFontFamily(fontFamily: TextConfig | string | null | undefined): ShapeProperties {
        const props = this.properties.textStyle;
        if (props) {
            props.fontFamily = getFontFamily(fontFamily);
        }
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
}