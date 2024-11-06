/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { Rect2 } from '@app/core';
import { ShapePlugin } from '@app/wireframes/interface';
import { DiagramItem } from '@app/wireframes/model';
import { EngineItem } from './../interface';
import { SvgObject } from './object';
import { SvgRenderer } from './renderer';
import { linkToSvg, SvgHelper } from './utils';

export class SvgItem extends SvgObject implements EngineItem {
    private readonly group: svg.G;
    private readonly selector: svg.Rect;
    private currentShape: DiagramItem | null = null;
    private isRendered = false;

    protected get root() {
        return this.group;
    }

    public get shape() {
        return this.currentShape;
    }

    constructor(
        public readonly layer: svg.Container,
        public readonly renderer: SvgRenderer,
        public readonly plugin: ShapePlugin,
    ) {
        super();
        this.selector = new svg.Rect().fill('#ffffff').opacity(0.001);

        this.group = new svg.G();
        this.group.add(this.selector);
        linkToSvg(this, this.group);
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
        if (!this.group.parent()) {
            this.layer.add(this.group);
        }
    }

    private renderCore(item: DiagramItem) {
        const localRect = new Rect2(0, 0, item.transform.size.x, item.transform.size.y);

        const previousContainer = this.renderer.getContainer();
        try {
            this.renderer.setContainer(this.group, 1);

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

        SvgHelper.transformBy(this.group, {
            x: to.position.x - 0.5 * to.size.x,
            y: to.position.y - 0.5 * to.size.y,
            w: to.size.x,
            h: to.size.y,
            rx: to.position.x,
            ry: to.position.y,
            rotation: to.rotation.degree,
        });

        this.group.opacity(item.opacity);
    }

    private arrangeSelector(localRect: Rect2) {
        let selectionRect = localRect;

        // Calculate a special selection rect, that is slightly bigger than the bounds to make selection easier.
        const diffW = Math.max(0, MIN_DIMENSIONS - selectionRect.width);
        const diffH = Math.max(0, MIN_DIMENSIONS - selectionRect.height);

        if (diffW > 0 || diffH > 0) {
            selectionRect = selectionRect.inflate(diffW * 0.5, diffH * 0.5);
        }

        SvgHelper.transformByRect(this.selector, selectionRect);
    }
}

const MIN_DIMENSIONS = 10;