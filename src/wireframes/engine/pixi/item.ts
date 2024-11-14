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
import { EngineItem } from './../interface';
import { PixiObject } from './object';
import { PixiRenderer } from './renderer';
import { linkToPixi } from './utils';

export class PixiItem extends PixiObject implements EngineItem {
    private readonly container: Container;
    private readonly selector: Graphics;
    private currentShape: DiagramItem | null = null;
    private isRendered = false;

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
        this.container.addChild(this.selector);
        linkToPixi(this, this.container);

        layer.addChild(this.container);
    }

    public detach() {
        this.remove();
    }

    public plot(shape: DiagramItem) {
        if (this.currentShape === shape && this.isRendered) {
            this.addToLayer();
            return;
        }
    
        this.renderCore(shape);

        this.addToLayer();
        this.currentShape = shape;
    }

    private addToLayer() {
        if (!this.container.parent) {
            this.layer.addChild(this.container);
        }
    }

    private renderCore(item: DiagramItem) {
        const localRect = new Rect2(0, 0, item.transform.size.x, item.transform.size.y);

        const previousContainer = this.renderer.getContainer();
        try {
            this.renderer.setContainer(this.container, 1);

            this.plugin.render({ renderer2: this.renderer, rect: localRect, shape: item });

            this.arrangeSelector(localRect);
            this.arrangeContainer(item);
        } finally {
            this.renderer.cleanupAll();
            this.renderer.setContainer(previousContainer);
            this.isRendered = true;
        }
    }

    private arrangeContainer(item: DiagramItem) {
        const to = item.transform;
        const pivotX = 0; // 0.5 * to.size.x;
        const pivotY = 0; // 0.5 * to.size.y;
        
        const rotation = to.rotation.radian;

        this.root.updateTransform({
            x: to.position.x + pivotX,
            y: to.position.y + pivotY,
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

        // Calculate a special selection rect, that is slightly bigger than the bounds to make selection easier.
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