/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DiagramItem, Renderer } from '@app/wireframes/model';
import * as svg from 'svg.js';

export class ShapeRef {
    private previousShape: DiagramItem;
    private previousIndex: number;

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
        this.renderedElement?.remove();
    }

    public render(shape: DiagramItem, index: number) {
        const mustRender = this.previousShape !== shape || !this.renderedElement;

        if (index !== this.previousIndex) {
            this.renderedElement?.remove();
        }

        if (mustRender) {
            this.renderer.setContext(this.doc);

            this.renderedElement = this.renderer.render(shape, this.renderedElement, { debug: this.showDebugMarkers });
            this.renderedElement.node['shape'] = shape;
        }

        if (!this.renderedElement.parent()) {
            this.doc.add(this.renderedElement);
        }

        this.previousShape = shape;
        this.previousIndex = index;
    }
}
