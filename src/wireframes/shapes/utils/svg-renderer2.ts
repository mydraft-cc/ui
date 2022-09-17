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
import { Rect2, sizeInPx, SVGHelper, Types } from '@app/core';
import { RendererColor, RendererElement, RendererOpacity, RendererText, RendererWidth, Shape, ShapeFactory, ShapeFactoryFunc, ShapeProperties, ShapePropertiesFunc, TextConfig } from '@app/wireframes/interface';
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

    public rectangle(strokeWidth: RendererWidth, radius?: number, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('rect', () => new svg.Rect(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setRadius(radius || 0);
            p.setTransform(bounds);
        }, properties);
    }

    public ellipse(strokeWidth: RendererWidth, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('ellipse', () => new svg.Ellipse(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setTransform(bounds);
        }, properties);
    }

    public roundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setPath(SVGHelper.roundedRectangleLeft(bounds, radius));
        }, properties);
    }

    public roundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setPath(SVGHelper.roundedRectangleRight(bounds, radius));
        }, properties);
    }

    public roundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setPath(SVGHelper.roundedRectangleTop(bounds, radius));
        }, properties);
    }

    public roundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setPath(SVGHelper.roundedRectangleBottom(bounds, radius));
        }, properties);
    }

    public path(strokeWidth: RendererWidth, path: string, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('path', () => new svg.Path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setPath(path);
            p.setTransform(bounds);
        }, properties);
    }

    public text(config?: RendererText, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('foreignObject', () => SVGHelper.createText(), p => {
            p.setBackgroundColor('transparent');
            p.setText(config?.text);
            p.setFontSize(config);
            p.setFontFamily(config);
            p.setAlignment(config);
            p.setVerticalAlignment('middle');
            p.setTransform(bounds);
        }, properties);
    }

    public textMultiline(config?: RendererText, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('foreignObject', () => SVGHelper.createText(), p => {
            p.setBackgroundColor('transparent');
            p.setText(config?.text);
            p.setFontSize(config);
            p.setFontFamily(config);
            p.setAlignment(config);
            p.setVerticalAlignment('top');
            p.setTransform(bounds);
        }, properties);
    }

    public raster(source: string, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('image', () => new svg.Image(), p => {
            p.setBackgroundColor('transparent');
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
                element?.remove();
                element = factory();

                this.container.unclip();
                this.container.clipWith(element);
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
        const size = this.container.children().length;

        for (let i = this.containerIndex; i < size; i++) {
            const last = this.container.last();

            last.clipper()?.remove();
            last.remove();
        }

        if (!this.wasClipped) {
            this.container.clipper()?.remove();
            this.container.unclip();
        }
    }
}

export class SVGRenderer2 extends Factory implements AbstractRenderer2 {
    private measureDiv: HTMLDivElement;

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
    ['opacity']: any;
    ['radius']: any;
    ['path']: any;
    ['stroke']: any;
    ['stroke-cap']: any;
    ['stroke-line-join']: any;
    ['stroke-width']: any;
    ['text']: any;
    ['text-alignment']: any;
    ['transform']: any;
    ['vertical-alignment']: any;
}>;

const PROPERTIES: ReadonlyArray<keyof PropertySet> = [
    'color',
    'fill',
    'font-family',
    'font-size',
    'image',
    'opacity',
    'radius',
    'stroke',
    'stroke-cap',
    'stroke-line-join',
    'stroke-width',
    'path',
    'text',
    'text-alignment',
    'vertical-alignment',
    'transform', // Transform must be last.
];

class Properties implements ShapeProperties {
    private static readonly SETTERS: Record<keyof PropertySet, (value: any, element: svg.Element) => void> = {
        'color': (value, element) => {
            element.attr('color', value);
        },
        'fill': (value, element) => {
            element.attr('fill', value);
        },
        'opacity': (value, element) => {
            element.opacity(value);
        },
        'stroke': (value, element) => {
            element.stroke({ color: value });
        },
        'stroke-cap': (value, element) => {
            element.stroke({ linecap: value });
        },
        'stroke-line-join': (value, element) => {
            element.stroke({ linejoin: value });
        },
        'stroke-width': (value, element) => {
            element.stroke({ width: value });
        },
        'image': (value, element) => {
            const image = element as svg.Image;

            image.load(value);
        },
        'path': (value, element) => {
            const path = element as svg.Path;

            path.plot(value);
        },
        'radius': (value, element) => {
            const rect = element as svg.Rect;

            rect.radius(value, value);
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
        'text': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.innerHTML = marked.parseInline(value);
            }
        },
        'text-alignment': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.textAlign = value;
            }
        },
        'vertical-alignment': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            if (div?.nodeName === 'DIV') {
                div.style.verticalAlign = value;
            }
        },
        'transform': (value, element) => {
            SVGHelper.transform(element, value, false);
        },
    };

    private element: svg.Element = null!;
    private properties: PropertySet = {};
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

        this.properties = {};
        this.propertiesOld = this.element.node['properties'] || {};
    }

    public setBackgroundColor(color: RendererColor | null | undefined): ShapeProperties {
        this.properties['fill'] = this.getBackgroundColor(color);

        return this;
    }

    public setForegroundColor(color: RendererColor | null | undefined): ShapeProperties {
        this.properties['color'] = this.getForegroundColor(color);

        return this;
    }

    public setStrokeColor(color: RendererColor | null | undefined): ShapeProperties {
        this.properties['stroke'] = this.getStrokeColor(color);

        return this;
    }

    public setStrokeWidth(width: RendererWidth | null | undefined): ShapeProperties {
        this.properties['stroke-width'] = this.getStrokeWidth(width);

        return this;
    }

    public setPath(path: string | null | undefined): ShapeProperties {
        this.properties['path'] = path;

        return this;
    }

    public setRadius(radius: number | null | undefined): ShapeProperties {
        this.properties['radius'] = radius || 0;

        return this;
    }

    public setText(text: RendererText | string | null | undefined): ShapeProperties {
        this.properties['text'] = this.getText(text);

        return this;
    }

    public setTransform(rect: Rect | null | undefined): ShapeProperties {
        this.properties['transform'] = { rect };

        return this;
    }

    public setImage(source: string | null | undefined): ShapeProperties {
        this.properties['image'] = source;

        return this;
    }

    public setFontSize(fontSize: TextConfig | Shape | number | null | undefined): ShapeProperties {
        this.properties['font-size'] = this.getFontSize(fontSize);

        return this;
    }

    public setFontFamily(fontFamily: TextConfig | string | null | undefined): ShapeProperties {
        this.properties['font-family'] = this.getFontFamily(fontFamily);

        return this;
    }

    public setAlignment(alignment: TextConfig | null | undefined): ShapeProperties {
        this.properties['text-alignment'] = this.getTextAlignment(alignment);

        return this;
    }

    public setVerticalAlignment(alignment: string | null | undefined): ShapeProperties {
        this.properties['vertical-alignment'] = alignment;

        return this;
    }

    public setStrokeStyle(cap: string, join: string): ShapeProperties {
        this.properties['stroke-cap'] = cap;
        this.properties['stroke-line-join'] = join;

        return this;
    }

    public setOpacity(opacity: RendererOpacity | null | undefined): ShapeProperties {
        const value = this.getOpacity(opacity);

        if (Number.isFinite(value)) {
            this.properties['opacity'] = value;
        }

        return this;
    }

    public sync() {
        for (const key of PROPERTIES) {
            const value = this.properties[key];

            if (!Types.equals(value, this.propertiesOld[key])) {
                Properties.SETTERS[key](value, this.element);
            }
        }

        this.element.node['properties'] = this.properties;
    }

    private getBackgroundColor(value: RendererColor | null | undefined) {
        if (isShape(value)) {
            return SVGHelper.toColor(value.backgroundColor);
        } else {
            return SVGHelper.toColor(value);
        }
    }

    private getForegroundColor(value: RendererColor | null | undefined) {
        if (isShape(value)) {
            return SVGHelper.toColor(value.foregroundColor);
        } else {
            return SVGHelper.toColor(value);
        }
    }

    private getStrokeColor(value: RendererColor | null | undefined) {
        if (isShape(value)) {
            return SVGHelper.toColor(value.strokeColor);
        } else {
            return SVGHelper.toColor(value);
        }
    }

    private getStrokeWidth(value: RendererWidth | null | null | undefined) {
        if (isShape(value)) {
            return value.strokeThickness;
        } else {
            return value || 0;
        }
    }

    private getText(value: TextConfig | Shape | string | null | undefined) {
        if (isShape(value)) {
            return value.text || '';
        } else {
            return value?.['text'] || value || '';
        }
    }

    private getTextAlignment(value: TextConfig | Shape | string | null | undefined) {
        if (isShape(value)) {
            return value.textAlignment || 'center';
        } else {
            return value?.['alignment'] || value || 'center';
        }
    }

    private getFontSize(value: TextConfig | Shape | number | null | undefined) {
        if (isShape(value)) {
            return value.fontSize || 10;
        } else {
            return value?.['fontSize'] || value || 10;
        }
    }

    private getFontFamily(value: TextConfig | Shape | string | null | undefined) {
        if (isShape(value)) {
            return value.fontFamily || 'inherit';
        } else {
            return value?.['fontFamily'] || value || 10;
        }
    }

    private getOpacity(value: RendererWidth | null | undefined) {
        if (isShape(value)) {
            return value.opacity;
        } else {
            return value;
        }
    }
}

function isShape(element: any): element is Shape {
    return Types.isFunction(element?.getAppearance);
}
