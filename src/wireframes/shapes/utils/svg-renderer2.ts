/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable quote-props */

import * as svg from '@svgdotjs/svg.js';
import { marked } from 'marked';
import { Rect } from 'react-measure';
import { escapeHTML, Rect2, sizeInPx, SVGHelper, Types } from '@app/core/utils';
import { RendererColor, RendererElement, RendererOpacity, RendererText, RendererWidth, Shape, ShapeFactory, ShapeFactoryFunc, ShapeProperties, ShapePropertiesFunc, TextConfig, TextDecoration } from '@app/wireframes/interface';
import { AbstractRenderer2 } from './abstract-renderer';

export * from './abstract-renderer';

class Factory implements ShapeFactory {
    private container: svg.G = null!;
    private containerIndex = 0;
    private clipping = false;
    private wasClipped = false;

    public getContainer() {
        return this.container;
    }

    public setContainer(container: svg.G, index = 0, clipping = false) {
        this.clipping = clipping;
        this.container = container;
        this.containerIndex = index;
        this.wasClipped = false;
    }

    public getOuterBounds(strokeWidth: RendererWidth, bounds: Rect2) {
        const actualStroke = getStrokeWidth(strokeWidth);
        const actualBounds = getBounds(bounds, actualStroke);

        return actualBounds;
    }

    public rectangle(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const actualStroke = getStrokeWidth(strokeWidth);
        const actualBounds = getBounds(bounds, actualStroke);
    
        return this.new('rect', () => new svg.Rect(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(actualStroke);
            p.setRadius(radius || 0);
            p.setTransform(actualBounds);
        }, properties);
    }

    public ellipse(strokeWidth: RendererWidth, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const actualStroke = getStrokeWidth(strokeWidth);
        const actualBounds = getBounds(bounds, actualStroke);

        return this.new('ellipse', () => new svg.Ellipse(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(actualStroke);
            p.setTransform(actualBounds);
        }, properties);
    }

    public roundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const actualStroke = getStrokeWidth(strokeWidth);
        const actualBounds = getBounds(bounds, actualStroke);

        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(actualStroke);
            p.setPath(SVGHelper.roundedRectangleLeft(actualBounds, radius));
        }, properties);
    }

    public roundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const actualStroke = getStrokeWidth(strokeWidth);
        const actualBounds = getBounds(bounds, actualStroke);
    
        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(actualStroke);
            p.setPath(SVGHelper.roundedRectangleRight(actualBounds, radius));
        }, properties);
    }

    public roundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const actualStroke = getStrokeWidth(strokeWidth);
        const actualBounds = getBounds(bounds, actualStroke);
    
        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(actualStroke);
            p.setPath(SVGHelper.roundedRectangleTop(actualBounds, radius));
        }, properties);
    }

    public roundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const actualStroke = getStrokeWidth(strokeWidth);
        const actualBounds = getBounds(bounds, actualStroke);
    
        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(actualStroke);
            p.setPath(SVGHelper.roundedRectangleBottom(actualBounds, radius));
        }, properties);
    }

    public path(strokeWidth: RendererWidth, path: string, properties?: ShapePropertiesFunc) {
        const actualStroke = getStrokeWidth(strokeWidth);

        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(actualStroke);
            p.setPath(path);
        }, properties);
    }

    public text(config: RendererText, bounds: Rect2, properties?: ShapePropertiesFunc, allowMarkdown?: boolean) {
        return this.new('foreignObject', () => SVGHelper.createText(), p => {
            p.setBackgroundColor('transparent');
            p.setText(config?.text, allowMarkdown);
            p.setFontSize(config);
            p.setFontFamily(config);
            p.setAlignment(config);
            p.setVerticalAlignment('middle');
            p.setTransform(bounds);
        }, properties);
    }

    public textMultiline(config: RendererText, bounds: Rect2, properties?: ShapePropertiesFunc, allowMarkdown?: boolean) {
        return this.new('foreignObject', () => SVGHelper.createText(), p => {
            p.setBackgroundColor('transparent');
            p.setText(config?.text, allowMarkdown);
            p.setFontSize(config);
            p.setFontFamily(config);
            p.setAlignment(config);
            p.setVerticalAlignment('top');
            p.setTransform(bounds);
        }, properties);
    }

    public raster(source: string, bounds: Rect2, preserveAspectRatio?: boolean, properties?: ShapePropertiesFunc) {
        return this.new('image', () => new svg.Image(), p => {
            p.setBackgroundColor('transparent');
            p.setPreserveAspectValue(preserveAspectRatio);
            p.setImage(source);
            p.setTransform(bounds);
        }, properties);
    }

    public group(items: ShapeFactoryFunc, clip?: ShapeFactoryFunc, properties?: ShapePropertiesFunc) {
        return this.new('g', () => new svg.G(), (_, group) => {
            const clipping = this.clipping;
            const container = this.container;
            const containerIndex = this.containerIndex;
            const wasClipped = this.wasClipped;

            this.container = group;
            this.containerIndex = 0;

            if (items) {
                items(this);
            }

            if (clip) {
                this.clipping = true;

                clip(this);
            }

            this.cleanupAll();
            this.clipping = clipping;
            this.container = container;
            this.containerIndex = containerIndex;
            this.wasClipped = wasClipped;
        }, properties);
    }

    private new<T extends svg.Element>(name: string, factory: () => T, defaults: (properties: Properties, element: T) => void, customProperties: ShapePropertiesFunc | undefined) {
        let element: T;

        if (this.wasClipped) {
            throw new Error('Only one clipping element is supported.');
        }

        const properties = Properties.INSTANCE;

        if (this.clipping) {
            element = this.container.clipper()?.get(0) as T;

            if (!element || element.node.tagName !== name) {
                element = factory();

                const clipPath = new svg.ClipPath();

                clipPath.add(element);

                this.container.add(clipPath);
                this.container.clipWith(clipPath);
            }

            this.wasClipped = true;
        } else {
            element = this.container.get(this.containerIndex) as T;

            if (!element) {
                element = factory();
                element.addTo(this.container);
            } else if (element.node.tagName !== name) {
                const previous = element;

                element = factory();
                element.insertAfter(previous);

                previous.remove();
            }

            this.containerIndex++;
        }

        properties.setElement(element);

        if (defaults) {
            defaults(properties, element);
        }

        if (customProperties) {
            customProperties(properties);
        }

        properties.sync();

        return element;
    }

    public cleanupAll() {
        const childNodes = this.container.node.childNodes;
        const childrenSize = childNodes.length;

        for (let i = childrenSize - 1; i >= this.containerIndex; i--) {
            const last = childNodes[i];

            if (last.nodeName === 'clipPath' && this.wasClipped) {
                i--;
            } else {
                last.remove();
            }
        }

        if (!this.wasClipped) {
            this.container.unclip();
        }
    }
}

export class SVGRenderer2 extends Factory implements AbstractRenderer2 {
    private readonly measureDiv: HTMLDivElement;

    public static readonly INSTANCE = new SVGRenderer2();

    public constructor() {
        super();

        this.measureDiv = document.createElement('div');
        this.measureDiv.style.height = 'auto';
        this.measureDiv.style.position = 'absolute';
        this.measureDiv.style.visibility = 'hidden';
        this.measureDiv.style.width = 'auto';
        this.measureDiv.style.whiteSpace = 'nowrap';

        document.body.appendChild(this.measureDiv);
    }

    public getLocalBounds(element: RendererElement): Rect2 {
        const e = this.getElement(element);

        if (!e.visible()) {
            return Rect2.EMPTY;
        }

        const box: svg.Box = e.bbox();

        return SVGHelper.box2Rect(box);
    }

    public getBounds(element: RendererElement): Rect2 {
        const e = this.getElement(element);

        if (!e.visible()) {
            return Rect2.EMPTY;
        }

        const box = e.bbox().transform(e.matrixify());

        return SVGHelper.box2Rect(box);
    }

    private getElement(element: RendererElement): svg.Element {
        if (element.textElement) {
            return element.textElement;
        } else {
            return element;
        }
    }

    public getTextWidth(text: string, fontSize: number, fontFamily: string) {
        this.measureDiv.textContent = text;
        this.measureDiv.style.fontSize = sizeInPx(fontSize);
        this.measureDiv.style.fontFamily = fontFamily;

        return this.measureDiv.clientWidth + 1;
    }
}

type PropertySet = Partial<{
    ['color']: any;
    ['fill']: any;
    ['font-family']: any;
    ['font-size']: any;
    ['image']: any;
    ['markdown']: any;
    ['opacity']: any;
    ['preserve-aspect-ratio']: any;
    ['radius']: any;
    ['path']: any;
    ['stroke']: any;
    ['stroke-cap']: any;
    ['stroke-line-join']: any;
    ['stroke-width']: any;
    ['text']: any;
    ['text-alignment']: any;
    ['text-decoration']: any;
    ['transform']: any;
    ['vertical-alignment']: any;
}>;

const PROPERTIES: ReadonlyArray<keyof PropertySet> = [
    'color',
    'fill',
    'font-family',
    'font-size',
    'image',
    'markdown',
    'opacity',
    'preserve-aspect-ratio',
    'radius',
    'stroke',
    'stroke-cap',
    'stroke-line-join',
    'stroke-width',
    'path',
    'text',
    'text-alignment',
    'text-decoration',
    'vertical-alignment',
    'transform', // Transform must be last.
];

class Properties implements ShapeProperties {
    private static readonly SETTERS: Record<keyof PropertySet, (value: any, element: svg.Element) => void> = {
        'color': (value, element) => {
            SVGHelper.fastSetAttribute(element.node, 'color', value);
        },
        'fill': (value, element) => {
            SVGHelper.setAttribute(element.node, 'fill', value);
        },
        'opacity': (value, element) => {
            SVGHelper.setAttribute(element.node, 'opacity', value);
        },
        'preserve-aspect-ratio': (value, element) => {
            SVGHelper.setAttribute(element.node, 'preserveAspectRatio', value ? 'xMidYMid' : 'none');
        },
        'stroke': (value, element) => {
            SVGHelper.setAttribute(element.node, 'stroke', value);
        },
        'stroke-cap': (value, element) => {
            SVGHelper.setAttribute(element.node, 'stroke-linecap', value);
        },
        'stroke-line-join': (value, element) => {
            SVGHelper.setAttribute(element.node, 'stroke-linejoin', value);
        },
        'stroke-width': (value, element) => {
            SVGHelper.setAttribute(element.node, 'stroke-width', value);
        },
        'image': (value, element) => {
            SVGHelper.setAttribute(element.node, 'href', value);
        },
        'path': (value, element) => {
            SVGHelper.setAttribute(element.node, 'd', value);
        },
        'radius': (value, element) => {
            SVGHelper.setAttribute(element.node, 'rx', value);
            SVGHelper.setAttribute(element.node, 'ry', value);
        },
        'font-family': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.fontFamily = value;
            }
        },
        'font-size': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.fontSize = `${value}px`;
            }
        },
        'markdown': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                const textOrHtml = marked.parseInline(value) as string;

                if (textOrHtml.indexOf('&') >= 0 || textOrHtml.indexOf('<') >= 0) {
                    div.innerHTML = textOrHtml;
                } else {
                    div.innerText = textOrHtml;
                }
            }
        },
        'text': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                const textOrHtml = escapeHTML(value);

                if (textOrHtml.indexOf('&') >= 0 || textOrHtml.indexOf('<') >= 0) {
                    div.innerHTML = textOrHtml;
                } else {
                    div.innerText = textOrHtml;
                }
            }
        },
        'text-alignment': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.textAlign = value;
            }
        },
        'text-decoration': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.textDecoration = value;
            }
        },
        'vertical-alignment': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.verticalAlign = value;
            }
        },
        'transform': (value, element) => {
            SVGHelper.transformByRect(element, value, false);
        },
    };

    private element: svg.Element = null!;
    private propertiesNew: PropertySet = {};
    private propertiesOld: PropertySet = {};

    public get shape() {
        return this.element;
    }

    public static readonly INSTANCE = new Properties();

    public setElement(element: RendererElement) {
        if (element.textElement) {
            this.element = element.textElement;
        } else {
            this.element = element;
        }

        this.propertiesNew = {};
        this.propertiesOld = (this.element.node as any)['properties'] || {};
    }

    public setBackgroundColor(color: RendererColor | null | undefined): ShapeProperties {
        this.propertiesNew['fill'] = getBackgroundColor(color);

        return this;
    }

    public setForegroundColor(color: RendererColor | null | undefined): ShapeProperties {
        this.propertiesNew['color'] = getForegroundColor(color);

        return this;
    }

    public setStrokeColor(color: RendererColor | null | undefined): ShapeProperties {
        this.propertiesNew['stroke'] = getStrokeColor(color);

        return this;
    }

    public setStrokeWidth(width: number): ShapeProperties {
        this.propertiesNew['stroke-width'] = width;

        return this;
    }

    public setPath(path: string | null | undefined): ShapeProperties {
        this.propertiesNew['path'] = path;

        return this;
    }

    public setPreserveAspectValue(value: boolean | null | undefined): ShapeProperties {
        this.propertiesNew['preserve-aspect-ratio'] = value;

        return this;
    }

    public setRadius(radius: number | null | undefined): ShapeProperties {
        this.propertiesNew['radius'] = radius || 0;

        return this;
    }

    public setTransform(rect: Rect | null | undefined): ShapeProperties {
        this.propertiesNew['transform'] = rect;

        return this;
    }

    public setImage(source: string | null | undefined): ShapeProperties {
        this.propertiesNew['image'] = source;

        return this;
    }

    public setFontSize(fontSize: TextConfig | Shape | number | null | undefined): ShapeProperties {
        this.propertiesNew['font-size'] = getFontSize(fontSize);

        return this;
    }

    public setFontFamily(fontFamily: TextConfig | string | null | undefined): ShapeProperties {
        this.propertiesNew['font-family'] = getFontFamily(fontFamily);

        return this;
    }

    public setAlignment(alignment: TextConfig | null | undefined): ShapeProperties {
        this.propertiesNew['text-alignment'] = getTextAlignment(alignment);

        return this;
    }

    public setTextDecoration(decoration: TextDecoration): ShapeProperties {
        this.propertiesNew['text-decoration'] = decoration;

        return this;
    }

    public setVerticalAlignment(alignment: string | null | undefined): ShapeProperties {
        this.propertiesNew['vertical-alignment'] = alignment;

        return this;
    }

    public setStrokeStyle(cap: string, join: string): ShapeProperties {
        this.propertiesNew['stroke-cap'] = cap;
        this.propertiesNew['stroke-line-join'] = join;

        return this;
    }

    public setOpacity(opacity: RendererOpacity | null | undefined): ShapeProperties {
        const value = getOpacity(opacity);

        if (Number.isFinite(value)) {
            this.propertiesNew['opacity'] = value;
        }

        return this;
    }

    public setText(text: RendererText | string | null | undefined, markdown?: boolean): ShapeProperties {
        if (markdown) {
            this.propertiesNew['markdown'] = getText(text);
        } else {
            this.propertiesNew['text'] = getText(text);
        }

        return this;
    }

    public sync() {
        for (const key of PROPERTIES) {
            const value = this.propertiesNew[key];

            if (!Types.equals(value, this.propertiesOld[key])) {
                Properties.SETTERS[key](value, this.element);
            }
        }

        (this.element.node as any)['properties'] = this.propertiesNew;
    }
}

function getBounds(bounds: Rect2, strokeWidth: number) {
    const halfStrokeWidth = strokeWidth / 2;

    return bounds.inflate(-halfStrokeWidth, -halfStrokeWidth);
}

function getBackgroundColor(value: RendererColor | null | undefined) {
    if (isShape(value)) {
        return SVGHelper.toColor(value.backgroundColor);
    } else {
        return SVGHelper.toColor(value);
    }
}

function getForegroundColor(value: RendererColor | null | undefined) {
    if (isShape(value)) {
        return SVGHelper.toColor(value.foregroundColor);
    } else {
        return SVGHelper.toColor(value);
    }
}

function getStrokeColor(value: RendererColor | null | undefined) {
    if (isShape(value)) {
        return SVGHelper.toColor(value.strokeColor);
    } else {
        return SVGHelper.toColor(value);
    }
}

function getStrokeWidth(value: RendererWidth | null | null | undefined) {
    if (isShape(value)) {
        return value.strokeThickness;
    } else {
        return value || 0;
    }
}

function getText(value: TextConfig | Shape | string | null | undefined) {
    if (isShape(value)) {
        return value.text || '';
    } else {
        return (value as any)?.['text'] || value || '';
    }
}

function getTextAlignment(value: TextConfig | Shape | string | null | undefined) {
    if (isShape(value)) {
        return value.textAlignment || 'center';
    } else {
        return (value as any)?.['alignment'] || value || 'center';
    }
}

function getFontSize(value: TextConfig | Shape | number | null | undefined) {
    if (isShape(value)) {
        return value.fontSize || 10;
    } else {
        return (value as any)?.['fontSize'] || value || 10;
    }
}

function getFontFamily(value: TextConfig | Shape | string | null | undefined) {
    if (isShape(value)) {
        return value.fontFamily || 'inherit';
    } else {
        return (value as any)?.['fontFamily'] || value || 10;
    }
}

function getOpacity(value: RendererWidth | null | undefined) {
    if (isShape(value)) {
        return value.opacity;
    } else {
        return value;
    }
}

function isShape(element: any): element is Shape {
    return Types.isFunction(element?.getAppearance);
}
