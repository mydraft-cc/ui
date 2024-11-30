/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable quote-props */

import * as svg from '@svgdotjs/svg.js';
import { marked } from 'marked';
import { escapeHTML, Rect2, TextMeasurer, Types } from '@app/core/utils';
import { RendererColor, RendererOpacity, RendererText, RendererWidth, ShapeProperties, ShapePropertiesFunc, ShapeRenderer, ShapeRendererFunc, TextConfig, TextDecoration } from '@app/wireframes/interface';
import { getBackgroundColor, getFontFamily, getFontSize, getForegroundColor, getOpacity, getStrokeColor, getStrokeWidth, getText, getTextAlignment, getValue, setValue } from './../shared';
import { SvgHelper } from './utils';

const FACTORY_ELLIPSE = () => {
    return new svg.Ellipse();
};

const FACTORY_PATH = () => {
    return new svg.Path();
};

const FACTORY_RECT = () => {
    return new svg.Rect();
};

const FACTORY_TEXT = () => {
    return  SvgHelper.createText();
};

export class SvgRenderer implements ShapeRenderer {
    private currentContainer: svg.G = null!;
    private currentIndex = 0;
    private clipping = false;
    private wasClipped = false;

    public getContainer() {
        return this.currentContainer;
    }

    public getTextWidth(text: string, fontSize: number, fontFamily: string) {
        return TextMeasurer.DEFAULT.getTextWidth(text, fontSize, fontFamily);
    }

    public setContainer(container: svg.G, index = 0, clipping = false) {
        this.clipping = clipping;
        this.currentContainer = container;
        this.currentIndex = index;
        this.wasClipped = false;
    }

    public getOuterBounds(strokeWidth: RendererWidth, bounds: Rect2) {
        const actualStroke = getStrokeWidth(strokeWidth);
        const actualBounds = getBounds(bounds, actualStroke);

        return actualBounds;
    }

    public rectangle(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const w = getStrokeWidth(strokeWidth);
    
        return this.new('rect', FACTORY_RECT, {
            bounds: getBounds(bounds, w),
            radius,
            strokeWidth: w,
        }, properties);
    }

    public ellipse(strokeWidth: RendererWidth, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const w = getStrokeWidth(strokeWidth);

        return this.new('ellipse', FACTORY_ELLIPSE, {
            bounds: getBounds(bounds, w),
            strokeWidth: w,
        }, properties);
    }

    public roundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const w = getStrokeWidth(strokeWidth);
        const b = getBounds(bounds, w);

        return this.new('path', FACTORY_PATH, {
            path: SvgHelper.roundedRectangleLeft(b, radius),
            strokeWidth: w,
        }, properties);
    }

    public roundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const w = getStrokeWidth(strokeWidth);
        const b = getBounds(bounds, w);
    
        return this.new('path', FACTORY_PATH, {
            path: SvgHelper.roundedRectangleRight(b, radius),
            strokeWidth: w,
        }, properties);
    }

    public roundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const w = getStrokeWidth(strokeWidth);
        const b = getBounds(bounds, w);
    
        return this.new('path', FACTORY_PATH, {
            path: SvgHelper.roundedRectangleTop(b, radius),
            strokeWidth: w,
        }, properties);
    }

    public roundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const w = getStrokeWidth(strokeWidth);
        const b = getBounds(bounds, w);
    
        return this.new('path', FACTORY_PATH, {
            path: SvgHelper.roundedRectangleBottom(b, radius),
            strokeWidth: w,
        }, properties);
    }

    public path(strokeWidth: RendererWidth, path: string, properties?: ShapePropertiesFunc) {
        const w = getStrokeWidth(strokeWidth);

        return this.new('path', FACTORY_PATH, {
            path,
            strokeWidth: w,
        }, properties);
    }

    public text(config: RendererText, bounds: Rect2, properties?: ShapePropertiesFunc, allowMarkdown?: boolean) {
        return this.new('foreignObject', FACTORY_TEXT, {
            whiteSpace: 'nowrap',
            bounds,
            fontFamily: getFontFamily(config),
            fontSize: getFontSize(config),
            textContent: { text: getText(config), markdown: allowMarkdown },
            textAlignment: getTextAlignment(config),
            verticalAlignment: 'middle',
        }, properties);
    }

    public textMultiline(config: RendererText, bounds: Rect2, properties?: ShapePropertiesFunc, allowMarkdown?: boolean) {
        return this.new('foreignObject', FACTORY_TEXT, {
            whiteSpace: 'normal',
            bounds,
            fontFamily: getFontFamily(config),
            fontSize: getFontSize(config),
            textContent: { text: getText(config), markdown: allowMarkdown },
            textAlignment: getTextAlignment(config),
            verticalAlignment: 'top',
        }, properties);
    }

    public raster(source: string, bounds: Rect2, preserveAspectRatio?: boolean, properties?: ShapePropertiesFunc) {
        return this.new('image', () => new svg.Image(), {
            bounds,
            image: source,
            preserveAspectRatio,
        }, properties);
    }

    public group(items: ShapeRendererFunc, clip?: ShapeRendererFunc, properties?: ShapePropertiesFunc) {
        return this.new('g', () => new svg.G(), {}, properties, group => {
            const clipping = this.clipping;
            const container = this.currentContainer;
            const containerIndex = this.currentIndex;
            const wasClipped = this.wasClipped;

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
            this.clipping = clipping;
            this.currentContainer = container;
            this.currentIndex = containerIndex;
            this.wasClipped = wasClipped;
        });
    }

    private new<T extends svg.Element>(name: string, factory: () => T, defaults: Partial<Properties>,
        customProperties?: ShapePropertiesFunc,
        customInitializer?: (element: T) => void) {

        let element: T;

        if (this.wasClipped) {
            throw new Error('Only one clipping element is supported.');
        }

        if (this.clipping) {
            element = this.currentContainer.clipper()?.get(0) as T;

            if (!element || element.node.tagName !== name) {
                element = factory();

                const clipPath = new svg.ClipPath();
                clipPath.add(element);
                this.currentContainer.add(clipPath);
                this.currentContainer.clipWith(clipPath);
            }

            this.wasClipped = true;
        } else {
            element = this.currentContainer.get(this.currentIndex) as T;

            if (!element) {
                element = factory();
                element.addTo(this.currentContainer);
            } else if (element.node.tagName !== name) {
                const previous = element;

                element = factory();
                element.insertAfter(previous);

                previous.remove();
            }

            this.currentIndex++;
        }

        customInitializer?.(element);

        const properties = PropertiesSetter.INSTANCE;
        properties.prepare(defaults);
        try {
            customProperties?.(properties);
        } finally {
            properties.apply(element);
        }

        return element;
    }

    public cleanupAll() {
        const childNodes = this.currentContainer.node.childNodes;
        const childrenSize = childNodes.length;

        for (let i = childrenSize - 1; i >= this.currentIndex; i--) {
            const last = childNodes[i];

            if (last.nodeName === 'clipPath' && this.wasClipped) {
                i--;
            } else {
                last.remove();
            }
        }

        if (!this.wasClipped) {
            this.currentContainer.unclip();
        }
    }
}

export type Properties = {
    bounds?: Rect2;
    color?: string;
    fill?: string;
    fontFamily: string;
    fontSize?: number;
    image?: string | null;
    opacity: number;
    path?: string | null;
    preserveAspectRatio?: boolean;
    radius?: number;
    stroke?: string;
    strokeStyle?: { cap: string; join: string };
    strokeWidth?: number;
    textContent?: { text: string; markdown?: boolean };
    textAlignment: string;
    textDecoration: string;
    verticalAlignment: string;
    whiteSpace: string;
};

const DEFAULT_PROPERTIES: Properties = {
    fill: 'transparent',
    fontFamily: 'Arial',
    fontSize: 16,
    opacity: 1,
    textAlignment: 'left',
    textDecoration: 'none',
    verticalAlignment: 'top',
    whiteSpace: 'normal',
};

type Setters<T> = {
    [P in keyof T]?: (value: T[P], element: svg.Element) => void;
};

class PropertiesSetter implements ShapeProperties {
    private static readonly SETTERS = Object.entries({
        color: (value, element) => {
            SvgHelper.fastSetAttribute(element.node, 'color', value);
        },
        fill: (value, element) => {
            SvgHelper.setAttribute(element.node, 'fill', value);
        },
        opacity: (value, element) => {
            SvgHelper.setAttribute(element.node, 'opacity', value);
        },
        preserveAspectRatio: (value, element) => {
            SvgHelper.setAttribute(element.node, 'preserveAspectRatio', value ? 'xMidYMid' : 'none');
        },
        stroke: (value, element) => {
            SvgHelper.setAttribute(element.node, 'stroke', value);
        },
        strokeStyle: (value, element) => {
            SvgHelper.setAttribute(element.node, 'stroke-linecap', value?.cap);
            SvgHelper.setAttribute(element.node, 'stroke-linejoin', value?.join);
        },
        strokeWidth: (value, element) => {
            SvgHelper.setAttribute(element.node, 'stroke-width', value);
        },
        image: (value, element) => {
            SvgHelper.setAttribute(element.node, 'href', value);
        },
        path: (value, element) => {
            SvgHelper.setAttribute(element.node, 'd', value);
        },
        radius: (value, element) => {
            SvgHelper.setAttribute(element.node, 'rx', value);
            SvgHelper.setAttribute(element.node, 'ry', value);
        },
        fontFamily: (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.fontFamily = value;
            }
        },
        fontSize: (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.fontSize = `${value}px`;
            }
        },
        textContent: (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                let textOrHtml = '';
                if (value?.markdown) {
                    textOrHtml = marked.parseInline(value.text) as string;
                } else if (value?.text) {
                    textOrHtml = escapeHTML(value.text);
                }

                if (textOrHtml.indexOf('&') >= 0 || textOrHtml.indexOf('<') >= 0) {
                    div.innerHTML = textOrHtml;
                } else {
                    div.innerText = textOrHtml;
                }
            }
        },
        textAlignment: (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.textAlign = value;
            }
        },
        textDecoration: (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.textDecoration = value;
            }
        },
        verticalAlignment: (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.verticalAlign = value;
            }
        },
        whiteSpace: (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.whiteSpace = value;
            }
        },
        bounds: (value, element) => {
            if (value) {
                SvgHelper.transformByRect(element, value, false);
            }
        },
    } as Setters<Properties>);

    public static readonly INSTANCE = new PropertiesSetter();
    private properties!: Properties;

    public prepare(defaults: Partial<Properties>) {
        const newProperties = { ...DEFAULT_PROPERTIES };
        Object.assign(newProperties, defaults);
        
        this.properties = newProperties;
    }

    public apply(element: svg.Element) {
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

    public setBackgroundColor(color: RendererColor | null | undefined): ShapeProperties {
        this.properties.fill =  SvgHelper.toColor(getBackgroundColor(color));
        return this;
    }

    public setForegroundColor(color: RendererColor | null | undefined): ShapeProperties {
        this.properties.color =  SvgHelper.toColor(getForegroundColor(color));
        return this;
    }

    public setStrokeColor(color: RendererColor | null | undefined): ShapeProperties {
        this.properties.stroke = SvgHelper.toColor(getStrokeColor(color));
        return this;
    }

    public setStrokeWidth(width: number): ShapeProperties {
        this.properties.strokeWidth = width;
        return this;
    }

    public setFontFamily(fontFamily: TextConfig | string | null | undefined): ShapeProperties {
        this.properties.fontFamily = getFontFamily(fontFamily);
        return this;
    }

    public setFontSize(fontSize: TextConfig | number | null | undefined): ShapeProperties {
        this.properties.fontSize = getFontSize(fontSize);
        return this;
    }

    public setAlignment(alignment: TextConfig | null | undefined): ShapeProperties {
        this.properties.textAlignment = getTextAlignment(alignment);
        return this;
    }

    public setTextDecoration(decoration: TextDecoration): ShapeProperties {
        this.properties.textDecoration = decoration;
        return this;
    }

    public setText(text: RendererText | string | null | undefined, markdown?: boolean): ShapeProperties {
        this.properties.textContent = { text: getText(text), markdown };
        return this;
    }

    public setStrokeStyle(cap: string, join: string): ShapeProperties {
        this.properties.strokeStyle = { cap, join };
        return this;
    }

    public setOpacity(opacity: RendererOpacity | null | undefined): ShapeProperties {
        this.properties.opacity = getOpacity(opacity);
        return this;
    }
}

function getBounds(bounds: Rect2, strokeWidth: number) {
    const halfStrokeWidth = strokeWidth / 2;

    return bounds.inflate(-halfStrokeWidth, -halfStrokeWidth);
}
