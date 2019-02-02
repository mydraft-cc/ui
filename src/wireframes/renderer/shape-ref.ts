import * as svg from 'svg.js';

import { DiagramShape, Renderer } from '@app/wireframes/model';

export class ShapeRef {
    private shape: DiagramShape;

    public renderedElement: svg.Element;

    public get renderId() {
        return this.renderedElement.id();
    }

    constructor(
        public readonly doc: svg.Container,
        public readonly renderer: Renderer,
        public readonly showDebugMarkers: boolean
    ) {
    }

    public remove() {
        if (this.renderedElement) {
            this.renderedElement.remove();
        }
    }

    public render(shape: DiagramShape) {
        const mustRender = this.shape !== shape || !this.renderedElement;

        if (mustRender) {
            this.renderer.setContext(this.doc);

            this.renderedElement = this.renderer.render(shape, { debug: this.showDebugMarkers });
            this.renderedElement.node['shape'] = shape;
        } else {
            this.doc.add(this.renderedElement);
        }

        this.shape = shape;
    }
}

