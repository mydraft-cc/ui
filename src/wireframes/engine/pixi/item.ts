/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Container, Graphics } from 'pixi.js';
import { Rect2, Types } from '@app/core';
import { ShapePlugin } from '@app/wireframes/interface';
import { DiagramItem } from '@app/wireframes/model';
import { EngineItem, RenderContext } from './../interface';
import { PixiObject } from './object';
import { PixiRenderer } from './renderer';
import { linkToPixi } from './utils';

export class PixiItem extends PixiObject implements EngineItem {
    private readonly container: Container;
    private readonly selector: Graphics;
    private currentShape: DiagramItem | null = null;
    private currentRect: Rect2 | null = null;
    private isRendered = false;
    private currentContext: RenderContext = { designThemeMode: 'light' };

    protected get root() {
        return this.container;
    }

    public get shape() {
        return this.currentShape;
    }

    constructor(
        public readonly layer: Container,
        public readonly renderer: PixiRenderer,
        public readonly plugin: ShapePlugin,
    ) {
        super();

        this.selector = new Graphics();

        this.container = new Container();
        this.container.eventMode = 'static';
        this.container.addChild(this.selector);
        linkToPixi(this, this.container);

        layer.addChild(this.container);
    }

    public detach() {
        this.remove();
    }

    public plot(shape: DiagramItem, context?: RenderContext) {
        if (context) {
            this.currentContext = context;
        }

        if (!shape) {
            this.remove();
            this.currentShape = null;
            return;
        }

        if (this.currentShape === shape && this.isRendered) {
            this.addToLayer();
            return;
        }
    
        this.renderCore(shape);

        this.addToLayer();
        this.currentShape = shape;
    }

    public forceReplot(shape: DiagramItem, context?: RenderContext) {
        if (context) {
            this.currentContext = context;
        }

        if (!shape) {
            this.remove();
            this.currentShape = null;
            return;
        }

        this.isRendered = false;
        
        this.currentShape = null;
        
        for (let i = this.container.children.length - 1; i >= 0; i--) {
            const child = this.container.children[i];
            if (child !== this.selector) {
                this.container.removeChild(child);
            }
        }
        
        this.plot(shape);
    }

    private addToLayer() {
        if (!this.container.parent) {
            this.layer.addChild(this.container);
        }
    }

    private renderCore(shape: DiagramItem) {
        const localRect = new Rect2(0, 0, shape.transform.size.x, shape.transform.size.y);

        const previousContainer = this.renderer.getContainer();
        try {
            this.renderer.setContainer(this.container, 1);

            const renderContext = { renderer2: this.renderer, rect: localRect, shape: shape, ...this.currentContext };
            this.plugin.render(renderContext);

            this.arrangeSelector(localRect);
            this.arrangeContainer(shape);
        } finally {
            this.currentRect = localRect;
            this.renderer.cleanupAll();
            this.renderer.setContainer(previousContainer);
            this.isRendered = true;
        }
    }

    private arrangeContainer(item: DiagramItem) {
        const to = item.transform;
        const pivotX = 0.5 * to.size.x;
        const pivotY = 0.5 * to.size.y;

        const x = to.position.x - 0.5 * to.size.x;
        const y = to.position.y - 0.5 * to.size.y;
        
        const rotation = to.rotation.radian;

        this.root.updateTransform({
            x: x + pivotX,
            y: y + pivotY,
            rotation,
            pivotX,
            pivotY,
        });

        if (Types.isNumber(item.opacity)) {
            this.container.alpha = item.opacity;
        }
    }

    private arrangeSelector(localRect: Rect2) {
        let selectionRect = localRect;

        const diffW = Math.max(0, MIN_DIMENSIONS - selectionRect.width);
        const diffH = Math.max(0, MIN_DIMENSIONS - selectionRect.height);

        if (diffW > 0 || diffH > 0) {
            selectionRect = selectionRect.inflate(diffW * 0.5, diffH * 0.5);
        }

        this.selector.rect(0, 0, selectionRect.w, selectionRect.y).fill('#fff');
        this.selector.alpha = 0.00001;
    }

    public invalidate() {
        return;
    }
}

const MIN_DIMENSIONS = 10;