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
        const previousElement = this.renderedElement;

        if (this.currentShape === shape && previousElement) {
            this.doc.add(this.renderedElement!);
            return;
        }

        this.renderer.setContext(this.doc);
        this.renderedElement = this.renderer.render(shape, previousElement, { debug: this.showDebugMarkers });

        // Always update shape to keep a reference to the actual object, not the old object.
        (this.renderedElement!.node as any)['shape'] = shape;

        // For new elements we might have to add them.
        if (!this.renderedElement!.parent()) {
            this.doc.add(this.renderedElement!);
        }

        this.currentShape = shape;
    }
}
