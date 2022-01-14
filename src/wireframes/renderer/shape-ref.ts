/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { DiagramItem, Renderer } from '@app/wireframes/model';

export class ShapeRef {
    private previewShape: DiagramItem | null = null;
    private currentShape: DiagramItem | null = null;
    private currentIndex = -1;

    public renderedElement: svg.Element | null = null;

    public get renderId() {
        return this.renderedElement?.id();
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
        const result = this.currentIndex >= 0 && this.currentIndex !== index;

        this.currentIndex = index;

        return result;
    }

    public setPreview(previewShape: DiagramItem | null) {
        if (this.previewShape !== previewShape) {
            const shapeToRender = previewShape || this.currentShape;

            if (!shapeToRender) {
                return;
            }

            this.renderer.setContext(this.doc);
            this.renderer.render(shapeToRender, this.renderedElement, { debug: this.showDebugMarkers });

            this.previewShape = previewShape;
        }
    }

    public render(shape: DiagramItem) {
        const mustRender = this.currentShape !== shape || !this.renderedElement;

        if (mustRender) {
            this.renderer.setContext(this.doc);

            this.renderedElement = this.renderer.render(shape, this.renderedElement, { debug: this.showDebugMarkers });
            this.renderedElement!.node['shape'] = shape;
        }

        if (!this.renderedElement!.parent()) {
            this.doc.add(this.renderedElement!);
        }

        this.currentShape = shape;
    }
}
