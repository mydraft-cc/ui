/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { ShapePlugin } from '@app/wireframes/interface';
import { EngineItem, EngineLayer, EngineLine, EngineObject, EngineRect, EngineText } from './../interface';
import { SvgItem } from './item';
import { SvgLine } from './line';
import { SvgRectOrEllipse } from './rect-or-ellipse';
import { SvgRenderer } from './renderer';
import { SvgText } from './text';
import { getSource, linkToSvg } from './utils';

export class SvgLayer implements EngineLayer {
    constructor(
        private readonly renderer: SvgRenderer,
        private readonly container: svg.Container,
    ) {
        linkToSvg(this, this.container);
    }

    public ellipse(): EngineRect {
        return new SvgRectOrEllipse(this.container.ellipse());
    }

    public line(): EngineLine {
        return new SvgLine(this.container.line());
    }

    public rect(): EngineRect {        
        return new SvgRectOrEllipse(this.container.rect());
    }
    
    public text(): EngineText {        
        return new SvgText(this.container);
    }
    
    public item(plugin: ShapePlugin): EngineItem {        
        return new SvgItem(this.container, this.renderer, plugin);
    }

    public show(): void {
        this.container.show();
    }

    public hide(): void {
        this.container.hide();
    }

    public remove(): void {
        this.container.remove();
    }

    public hitTest(x: number, y: number) {
        const result: EngineObject[] = [];

        const point = new svg.Point(x, y);
        for (const element of this.container.children()) {
            if (!element.visible()) {
                continue;
            }

            const hitPoint = point.transform(element.matrix().inverseO());

            if (element.inside(hitPoint.x, hitPoint.y)) {
                result.push(getSource(element.node) as EngineObject);
            }
        }

        return result;
    }
}