/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { ShapePlugin } from '@app/wireframes/interface';
import { EngineItem, EngineLayer, EngineLine, EngineRect, EngineText } from './../interface';
import { SvgItem } from './item';
import { SvgLine } from './line';
import { SvgRect } from './rect';
import { SvgRenderer } from './renderer';
import { SvgText } from './text';
import { linkToSvg } from './utils';

export class SvgLayer implements EngineLayer {
    constructor(
        private readonly renderer: SvgRenderer,
        private readonly container: svg.Container,
    ) {
        linkToSvg(this, this.container);
    }

    public ellipse(): EngineRect {
        return new SvgRect(this.container);
    }

    public line(): EngineLine {
        return new SvgLine(this.container);
    }

    public rect(): EngineRect {        
        return new SvgRect(this.container);
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
}