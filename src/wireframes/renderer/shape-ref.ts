/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DiagramItem, Renderer } from '@app/wireframes/model';
import * as svg from 'svg.js';

export class ShapeRef {
    private shape: DiagramItem;

    public renderedElement: svg.Element;

    public get renderId() {
        return this.renderedElement.id();
    }

    constructor(
        public readonly doc: svg.Container,
        public readonly renderer: Renderer,
        public readonly showDebugMarkers: boolean,
    ) {
    }

    public remove() {
        if (this.renderedElement) {
            this.renderedElement.remove();
        }
    }

    public render(shape: DiagramItem) {
        const mustRender = this.shape !== shape || !this.renderedElement;

        if (mustRender) {
            this.renderer.setContext(this.doc);

            this.renderedElement = this.renderer.render(shape, this.renderedElement, { debug: this.showDebugMarkers });
            this.renderedElement.node['shape'] = shape;
        }

        this.shape = shape;
    }
}
