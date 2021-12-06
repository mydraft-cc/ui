/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MatrixTransform, Rect2, sizeInPx, SVGHelper, Types } from '@app/core';
import { DefaultAppearance, RendererColor, RendererElement, RendererOpacity, RendererText, RendererWidth, Shape, ShapeFactory, ShapeFactoryFunc, ShapeProperties, ShapePropertiesFunc, TextConfig } from '@app/wireframes/interface';
import { DiagramItem, Transform } from '@app/wireframes/model';
import { Rect } from 'react-measure';
import * as svg from 'svg.js';
import { AbstractRenderer2 } from './abstract-renderer';

export * from './abstract-renderer';

/* eslint-disable quote-props */

class Factory implements ShapeFactory {
    private container: svg.G;
    private containerIndex: number;
    private clipping: boolean;

    public getContainer() {
        return this.container;
    }

    public setContainer(container: svg.G, index = 0, clipping = false) {
        this.clipping = clipping;
        this.container = container;
        this.containerIndex = index;
    }

    public rectangle(strokeWidth: RendererWidth, radius?: number, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('rect', x => x.rect(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setRadius(radius || 0);
            p.setTransform(bounds);
        }, properties);
    }

    public ellipse(strokeWidth: RendererWidth, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('ellipse', x => x.ellipse(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setTransform(bounds);
        }, properties);
    }

    public roundedRectangleLeft(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('path', x => x.path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setPath(SVGHelper.roundedRectangleLeft(bounds, radius));
            p.setTransform(bounds);
        }, properties);
    }

    public roundedRectangleRight(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('path', x => x.path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setPath(SVGHelper.roundedRectangleRight(bounds, radius));
            p.setTransform(bounds);
        }, properties);
    }

    public roundedRectangleTop(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('path', x => x.path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setPath(SVGHelper.roundedRectangleTop(bounds, radius));
            p.setTransform(bounds);
        }, properties);
    }

    public roundedRectangleBottom(strokeWidth: RendererWidth, radius: number, bounds: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('path', x => x.path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setPath(SVGHelper.roundedRectangleBottom(bounds, radius));
            p.setTransform(bounds);
        }, properties);
    }

    public path(strokeWidth: RendererWidth, path: string, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('path', x => x.path(), p => {
            p.setBackgroundColor('transparent');
            p.setStrokeWidth(strokeWidth);
            p.setPath(path);
            p.setTransform(bounds);
        }, properties);
    }

    public text(config?: RendererText, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('foreignObject', x => SVGHelper.createText(x, ''), p => {
            p.setBackgroundColor('transparent');
            p.setText(config.text);
            p.setFontSize(config);
            p.setFontFamily(config);
            p.setAlignment(config);
            p.setVerticalAlignment('middle');
            p.setTransform(bounds);
        }, properties);
    }

    public textMultiline(config?: RendererText, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('foreignObject', x => SVGHelper.createText(x, ''), p => {
            p.setBackgroundColor('transparent');
            p.setText(config.text);
            p.setFontSize(config);
            p.setFontFamily(config);
            p.setAlignment(config);
            p.setVerticalAlignment('top');
            p.setTransform(bounds);
        }, properties);
    }

    public raster(source: string, bounds?: Rect2, properties?: ShapePropertiesFunc) {
        return this.new('image', x => x.image(), p => {
            p.setBackgroundColor('transparent');
            p.setImage(source);
            p.setTransform(bounds);
        }, properties);
    }

    public group(items: ShapeFactoryFunc, clip?: ShapeFactoryFunc, properties?: ShapePropertiesFunc) {
        return this.new('group', x => x.group(), (_, group) => {
            const clipping = this.clipping;
            const container = this.container;
            const containerIndex = this.containerIndex;

            this.container = group;
            this.containerIndex = 0;

            if (items) {
                items(this);
            }

            if (clip) {
                this.clipping = true;

                clip(this);
            }

            this.cleanup();
            this.clipping = clipping;
            this.container = container;
            this.containerIndex = containerIndex;
        }, properties);
    }

    private new<T extends svg.Element>(name: string, factory: (container: svg.Container) => T, configure: (properties: Properties, element: T) => void, properties: ShapePropertiesFunc | undefined) {
        const element = this.create(name, factory);

        Properties.INSTANCE.setElement(element);

        configure(Properties.INSTANCE, element);

        if (properties) {
            properties(Properties.INSTANCE);
        }

        Properties.INSTANCE.sync();

        return element;
    }

    private create<T extends svg.Element>(name: string, factory: (container: svg.Container) => T): T {
        if (this.clipping) {
            let element = this.container.clipper as any;

            if (!element || element.node.tagName !== name) {
                element = factory(this.container);

                this.container.clipWith(element);
            }

            return element;
        } else {
            let element: T = this.container.get(this.containerIndex) as any;

            if (!element) {
                element = factory(this.container);
            } else if (element.node.tagName !== name) {
                this.cleanup();

                element = factory(this.container);
            }

            this.containerIndex++;

            return element;
        }
    }

    public cleanup() {
        const size = this.container.children().length;

        for (let i = this.containerIndex + 1; i < size; i++) {
            this.container.last().remove();
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

    public setTransform(element: any, to: Transform | DiagramItem | MatrixTransform): AbstractRenderer2 {
        const e = this.getElement(element);

        if (to instanceof DiagramItem) {
            this.setTransform(element, to.transform);
        } else if (to instanceof Transform) {
            SVGHelper.transform(e, {
                x: to.position.x - 0.5 * to.size.x,
                y: to.position.y - 0.5 * to.size.y,
                w: to.size.x,
                h: to.size.y,
                rx: to.position.x,
                ry: to.position.y,
                rotation: to.rotation.degree,
            });
        } else {
            SVGHelper.transform(element, to);
        }

        return this;
    }

    public getBounds(element: RendererElement, untransformed?: boolean): Rect2 {
        const e = this.getElement(element);

        if (!e.visible()) {
            return Rect2.EMPTY;
        }

        let box: svg.Box = e.bbox();

        if (!untransformed) {
            const m = e.matrixify();

            if (m) {
                box = box.transform(m);
            }
        }

        return SVGHelper.box2Rect(box);
    }

    private getElement(element: RendererElement): svg.Element {
        if (element.textElement) {
            return element.textElement;
        } else {
            return element;
        }
    }

    public getTextWidth(text: string, fontSize: number, fontFamily: string): number | undefined {
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
    // Transform must be last.
    'transform',
];

class Properties implements ShapeProperties {
    private static readonly SETTERS: Record<keyof PropertySet, (value: any, element: svg.Element) => void> = {
        'color': (value, element) => {
            element.attr('color', value);
        },
        'fill': (value, element) => {
            element.attr('fill', value);
        },
        'font-family': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            div.style.fontFamily = value;
        },
        'font-size': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            div.style.fontSize = `${value}px`;
        },
        'image': (value, element) => {
            const image = element as svg.Image;

            image.load(value);
        },
        'opacity': (value, element) => {
            element.opacity(value);
        },
        'radius': (value, element) => {
            const rect = element as svg.Rect;

            rect.radius(value, value);
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
        'path': (value, element) => {
            const path = element as svg.Path;

            path.plot(value);
        },
        'text': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            div.textContent = value;
        },
        'text-alignment': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            div.style.textAlign = value;
        },
        'vertical-alignment': (value, element) => {
            const div = element.node.children[0] as HTMLDivElement;

            div.style.verticalAlign = value;
        },
        'transform': (value, element) => {
            SVGHelper.transform(element, value);
        },
    };

    private element: svg.Element;
    private properties: PropertySet;
    private propertiesOld: PropertySet;

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

    public setForegroundColor(color: RendererColor): ShapeProperties {
        this.properties['color'] = this.getColor(color, DefaultAppearance.FOREGROUND_COLOR);

        return this;
    }

    public setBackgroundColor(color: RendererColor): ShapeProperties {
        this.properties['fill'] = this.getColor(color, DefaultAppearance.BACKGROUND_COLOR);

        return this;
    }

    public setStrokeColor(color: RendererColor): ShapeProperties {
        this.properties['stroke'] = this.getColor(color, DefaultAppearance.STROKE_COLOR);

        return this;
    }

    public setStrokeWidth(width: RendererWidth): ShapeProperties {
        this.properties['stroke-width'] = this.getStrokeWidth(width);

        return this;
    }

    public setPath(path: string): ShapeProperties {
        this.properties['path'] = path;

        return this;
    }

    public setRadius(radius: number): ShapeProperties {
        this.properties['radius'] = radius;

        return this;
    }

    public setText(text: string): ShapeProperties {
        this.properties['text'] = text;

        return this;
    }

    public setTransform(rect: Rect): ShapeProperties {
        this.properties['transform'] = { rect };

        return this;
    }

    public setImage(source: string): ShapeProperties {
        this.properties['image'] = source;

        return this;
    }

    public setFontSize(fontSize: TextConfig | undefined): ShapeProperties {
        this.properties['font-size'] = this.getFontSize(fontSize);

        return this;
    }

    public setFontFamily(fontFamily: TextConfig | string): ShapeProperties {
        this.properties['font-family'] = this.getFontFamily(fontFamily);

        return this;
    }

    public setAlignment(alignment: TextConfig): ShapeProperties {
        this.properties['text-alignment'] = this.getTextAlignment(alignment);

        return this;
    }

    public setVerticalAlignment(alignment: string): ShapeProperties {
        this.properties['vertical-alignment'] = alignment;

        return this;
    }

    public setStrokeStyle(cap: string, join: string): ShapeProperties {
        this.properties['stroke-cap'] = cap;
        this.properties['stroke-line-join'] = join;

        return this;
    }

    public setOpacity(opacity: RendererOpacity): ShapeProperties {
        const value = this.getOpacity(opacity);

        if (Number.isFinite(value)) {
            this.properties['opacity'] = value;
        }

        return this;
    }

    public sync() {
        const element = this.element;

        const properties = this.properties;
        const propertiesOld = this.propertiesOld;

        for (const key of PROPERTIES) {
            const value = properties[key];
            const valueOld = propertiesOld[key];

            if (!Types.equals(value, valueOld)) {
                Properties.SETTERS[key](value, element);
            }
        }

        element.node['properties'] = properties;
    }

    private getStrokeWidth(value: RendererWidth) {
        if (isShape(value)) {
            return value.strokeThickness;
        } else {
            return value;
        }
    }

    private getColor(value: RendererColor, key: string) {
        if (isShape(value)) {
            return SVGHelper.toColor(value.getAppearance(key));
        } else {
            return SVGHelper.toColor(value);
        }
    }

    private getTextAlignment(value?: TextConfig) {
        if (isShape(value)) {
            return value.textAlignment || 'center';
        } else {
            return value?.alignment || 'center';
        }
    }

    private getFontSize(value?: TextConfig) {
        if (isShape(value)) {
            return value.fontSize || 10;
        } else {
            return value?.fontSize || 10;
        }
    }

    private getFontFamily(value?: TextConfig | string) {
        if (isShape(value)) {
            return value.fontFamily || 'inherit';
        } else if (Types.isObject(value)) {
            return 'inherit';
        } else {
            return value || 'inherit';
        }
    }

    private getOpacity(value: RendererWidth) {
        if (isShape(value)) {
            return value.opacity;
        } else {
            return value;
        }
    }
}

function isShape(element: any): element is Shape {
    return element instanceof DiagramItem;
}
