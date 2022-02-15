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
        // Always remove them so we can add the shapes back in the right order.
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

        const previousElement = this.renderedElement;

        // Try to add them first, because we cannot handle clip paths that are not added.
        if (previousElement && !previousElement.parent()) {
            this.doc.add(previousElement);
        }

        if (mustRender) {
            this.renderer.setContext(this.doc);

            const newElement = this.renderer.render(shape, this.renderedElement, { debug: this.showDebugMarkers });

            if (newElement !== previousElement) {
                newElement.node['shape'] = shape;

                // For new elements we might have to add them.
                if (!newElement.parent()) {
                    this.doc.add(newElement);
                }

                this.renderedElement = newElement;
            }
        }

        this.currentShape = shape;
    }
}
