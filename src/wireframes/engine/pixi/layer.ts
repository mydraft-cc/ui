/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Application, Container, EventBoundary } from 'pixi.js';
import { Types } from '@app/core';
import { ShapePlugin } from '@app/wireframes/interface';
import { EngineItem, EngineLayer, EngineLine, EngineObject, EngineRect, EngineText } from './../interface';
import { PixiItem } from './item';
import { PixiLine } from './line';
import { PixiRect as PixiRectOrEllipse } from './rect-or-ellipse';
import { PixiRenderer } from './renderer';
import { PixiText } from './text';
import { getSource, linkToPixi } from './utils';

export class PixiLayer implements EngineLayer {
    public readonly container = new Container();

    constructor(
        private readonly application: Application,
        private readonly renderer: PixiRenderer,
        public readonly name: string,
    ) {
        this.container.eventMode = 'auto';

        this.application.stage.addChild(this.container);
        linkToPixi(this, this.container);
    }

    public rect(): EngineRect {
        return new PixiRectOrEllipse(this.container, true);
    }

    public ellipse(): EngineRect {
        return new PixiRectOrEllipse(this.container, false);
    }

    public line(): EngineLine {
        return new PixiLine(this.container);
    }

    public text(): EngineText {
        return new PixiText(this.container);
    }

    public item(plugin: ShapePlugin): EngineItem { 
        return new PixiItem(this.container, this.renderer, plugin);
    }

    public show() {
        this.container.visible = true;
    }

    public hide() {
        this.container.visible = false;
    }

    public disable() {
        this.container.eventMode = 'none';
    }

    public remove() {
        this.container.removeFromParent();
    }

    public hitTest(x: number, y: number): EngineObject[] {
        const boundary = new EventBoundary(this.container);

        const { 
            x: clientX,
            y: clientY,
        } = this.application.stage.worldTransform.apply({ x, y });
        
        const hit = boundary.hitTest(clientX, clientY);
        if (!hit) {
            return [];
        }
        
        const source = getSource(hit);
        if (!source || Types.is(source, PixiLayer)) {
            return [];
        }

        return [source];
    }

    public invalidate() {
        for (const child of this.container.children) {
            const source = getSource(child);

            if (source && Types.isFunction(source['invalidate'])) {
                source.invalidate();
            }
        }
    }
}