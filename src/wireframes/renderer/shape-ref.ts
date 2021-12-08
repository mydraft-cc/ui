/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DiagramItem, Renderer } from '@app/wireframes/model';
import * as svg from '@svgdotjs/svg.js';

export class ShapeRef {
    private previousShape: DiagramItem;
    private previousIndex = -1;

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

    public checkIndex(index: number) {
        const result = this.previousIndex >= 0 && this.previousIndex !== index;

        this.previousIndex = index;

        return result;
    }

    public render(shape: DiagramItem) {
        const mustRender = this.previousShape !== shape || !this.renderedElement;

        if (mustRender) {
            this.renderer.setContext(this.doc);

            this.renderedElement = this.renderer.render(shape, this.renderedElement, { debug: this.showDebugMarkers });
            this.renderedElement.node['shape'] = shape;
        }

        if (!this.renderedElement.parent()) {
            this.doc.add(this.renderedElement);
        }

        this.previousShape = shape;
    }
}
