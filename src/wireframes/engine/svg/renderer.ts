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
import { escapeHTML, Rect2, TextMeasurer, Types } from '@app/core/utils';
import { RendererColor, RendererElement, RendererOpacity, RendererText, RendererWidth, Shape, ShapeProperties, ShapePropertiesFunc, ShapeRenderer, ShapeRendererFunc, TextConfig, TextDecoration } from '@app/wireframes/interface';
import { getBackgroundColor, getFontFamily, getFontSize, getForegroundColor, getOpacity, getStrokeColor, getStrokeWidth, getText, getTextAlignment, PROPERTIES, PropertySet } from './../shared';
import { SvgHelper } from './utils';

export class SvgRenderer implements ShapeRenderer {
    private containerItem: svg.G = null!;
    private containerIndex = 0;
    private clipping = false;
    private wasClipped = false;

    public getContainer() {
        return this.containerItem;
    }

    public getTextWidth(text: string, fontSize: number, fontFamily: string) {
        return TextMeasurer.DEFAULT.getTextWidth(text, fontSize, fontFamily);
    }

    public setContainer(container: svg.G, index = 0, clipping = false) {
        this.clipping = clipping;
        this.containerItem = container;
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
            p.setPath(SvgHelper.roundedRectangleLeft(actualBounds, radius));
        }, properties);
    }

    public roundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const actualStroke = getStrokeWidth(strokeWidth);
        const actualBounds = getBounds(bounds, actualStroke);
    
        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(actualStroke);
            p.setPath(SvgHelper.roundedRectangleRight(actualBounds, radius));
        }, properties);
    }

    public roundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const actualStroke = getStrokeWidth(strokeWidth);
        const actualBounds = getBounds(bounds, actualStroke);
    
        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(actualStroke);
            p.setPath(SvgHelper.roundedRectangleTop(actualBounds, radius));
        }, properties);
    }

    public roundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        const actualStroke = getStrokeWidth(strokeWidth);
        const actualBounds = getBounds(bounds, actualStroke);
    
        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(actualStroke);
            p.setPath(SvgHelper.roundedRectangleBottom(actualBounds, radius));
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
        return this.new('foreignObject', () => SvgHelper.createText('nowrap'), p => {
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
        return this.new('foreignObject', () => SvgHelper.createText('normal'), p => {
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

    public group(items: ShapeRendererFunc, clip?: ShapeRendererFunc, properties?: ShapePropertiesFunc) {
        return this.new('g', () => new svg.G(), (_, group) => {
            const clipping = this.clipping;
            const container = this.containerItem;
            const containerIndex = this.containerIndex;
            const wasClipped = this.wasClipped;

            this.containerItem = group;
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
            this.containerItem = container;
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
            element = this.containerItem.clipper()?.get(0) as T;

            if (!element || element.node.tagName !== name) {
                element = factory();

                const clipPath = new svg.ClipPath();

                clipPath.add(element);

                this.containerItem.add(clipPath);
                this.containerItem.clipWith(clipPath);
            }

            this.wasClipped = true;
        } else {
            element = this.containerItem.get(this.containerIndex) as T;

            if (!element) {
                element = factory();
                element.addTo(this.containerItem);
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
        const childNodes = this.containerItem.node.childNodes;
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
            this.containerItem.unclip();
        }
    }
}

const ORDERED_PROPERTIES = [...PROPERTIES];

ORDERED_PROPERTIES.splice(ORDERED_PROPERTIES.indexOf('transform'), 1);
ORDERED_PROPERTIES.push('transform');

class Properties implements ShapeProperties {
    private static readonly SETTERS: Record<keyof PropertySet, (value: any, element: svg.Element) => void> = {
        'color': (value, element) => {
            SvgHelper.fastSetAttribute(element.node, 'color', value);
        },
        'fill': (value, element) => {
            SvgHelper.setAttribute(element.node, 'fill', value);
        },
        'opacity': (value, element) => {
            SvgHelper.setAttribute(element.node, 'opacity', value);
        },
        'preserve-aspect-ratio': (value, element) => {
            SvgHelper.setAttribute(element.node, 'preserveAspectRatio', value ? 'xMidYMid' : 'none');
        },
        'stroke': (value, element) => {
            SvgHelper.setAttribute(element.node, 'stroke', value);
        },
        'stroke-style': (value, element) => {
            SvgHelper.setAttribute(element.node, 'stroke-linecap', value.cap);
            SvgHelper.setAttribute(element.node, 'stroke-linejoin', value.join);
        },
        'stroke-width': (value, element) => {
            SvgHelper.setAttribute(element.node, 'stroke-width', value);
        },
        'image': (value, element) => {
            SvgHelper.setAttribute(element.node, 'href', value);
        },
        'path': (value, element) => {
            SvgHelper.setAttribute(element.node, 'd', value);
        },
        'radius': (value, element) => {
            SvgHelper.setAttribute(element.node, 'rx', value);
            SvgHelper.setAttribute(element.node, 'ry', value);
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
                const typed = value as { text: string; markdown?: boolean } | undefined;

                let textOrHtml = '';
                if (typed?.markdown) {
                    textOrHtml = marked.parseInline(typed.text) as string;
                } else if (typed?.text) {
                    textOrHtml = escapeHTML(typed.text);
                }

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
            SvgHelper.transformByRect(element, value, false);
        },
    };

    private propertiesNew: PropertySet = {};
    private propertiesOld: PropertySet = {};
    private element: svg.Element = null!;

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
        this.propertiesNew['fill'] =  SvgHelper.toColor(getBackgroundColor(color));
        return this;
    }

    public setForegroundColor(color: RendererColor | null | undefined): ShapeProperties {
        this.propertiesNew['color'] =  SvgHelper.toColor(getForegroundColor(color));
        return this;
    }

    public setStrokeColor(color: RendererColor | null | undefined): ShapeProperties {
        this.propertiesNew['stroke'] = SvgHelper.toColor(getStrokeColor(color));
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

    public setText(text: RendererText | string | null | undefined, markdown?: boolean): ShapeProperties {
        this.propertiesNew['text'] = { text: getText(text), markdown };
        return this;
    }

    public setStrokeStyle(cap: string, join: string): ShapeProperties {
        this.propertiesNew['stroke-style'] = { cap, join };
        return this;
    }

    public setOpacity(opacity: RendererOpacity | null | undefined): ShapeProperties {
        this.propertiesNew.opacity = getOpacity(opacity);
        return this;
    }

    public sync() {
        for (const key of ORDERED_PROPERTIES) {
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
