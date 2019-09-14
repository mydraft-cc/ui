import * as React from 'react';
import * as svg from 'svg.js';

import { Rect2, Vec2 } from '@app/core';

import {
    calculateSelection,
    Diagram,
    DiagramItem
} from '@app/wireframes/model';

import {
    InteractionHandler,
    InteractionService,
    SvgEvent
} from './interaction-service';

import { SVGRenderer } from '@app/wireframes/shapes/utils/svg-renderer';

const SELECTION_STROKE_COLOR = '#080';
const SELECTION_STROKE_LOCK_COLOR = '#f00';
const SELECTION_FILL_COLOR = 'none';

export interface SelectionAdornerProps {
    // The adorner scope.
    adorners: svg.Container;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The interaction service.
    interactionService: InteractionService;

    // A function to select a set of items.
    selectItems: (diagram: Diagram, itemIds: string[]) => any;
}

export class SelectionAdorner extends React.Component<SelectionAdornerProps> implements InteractionHandler {
    private renderer: SVGRenderer;
    private shapesAdorners: any[] = [];
    private selectionShape: any;
    private dragStart: Vec2 | null;

    public componentDidMount() {
        this.props.interactionService.addHandler(this);

        this.renderer = new SVGRenderer();
        this.renderer.captureContext(this.props.adorners);

        this.selectionShape = this.renderer.createRectangle(1);

        this.renderer.setBackgroundColor(this.selectionShape, '#0a0');
        this.renderer.setStrokeColor(this.selectionShape, '#050');
        this.renderer.setOpacity(this.selectionShape, 0.3);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);

        this.shapesAdorners = [];
    }

    public componentDidUpdate() {
        this.markItems();
    }

    public onMouseDown(event: SvgEvent, next: () => void) {
        if (!event.event.shiftKey) {
            const selection = this.selectSingle(event, this.props.selectedDiagram);

            this.props.selectItems(this.props.selectedDiagram, selection);
        }

        if (!event.element) {
            this.dragStart = event.position;
        }
    }

    public onMouseDrag(event: SvgEvent, next: () => void) {
        if (!this.dragStart) {
            return next();
        }

        const rect = Rect2.fromVecs([this.dragStart, event.position]);

        if (rect.area > 0) {
            this.transformShape(this.selectionShape, new Vec2(rect.x, rect.y), new Vec2(rect.w, rect.h), 0);
        } else {
            this.renderer.setVisibility(this.selectionShape, false);
        }
    }

    public onMouseUp(event: SvgEvent, next: () => void) {
        if (!this.dragStart) {
            return next();
        }

        try {
            const selectedRect = Rect2.fromVecs([this.dragStart, event.position]);

            if (selectedRect.area > 100) {
                const selection = this.selectMultiple(selectedRect, this.props.selectedDiagram);

                if (selection) {
                    this.props.selectItems(this.props.selectedDiagram, selection!);
                }
            }
        } finally {
            this.renderer.setVisibility(this.selectionShape, false);

            this.dragStart = null;
        }
    }

    private selectMultiple(rect: Rect2, diagram: Diagram): string[] {
        const selectedItems = diagram.rootItems.filter(i => rect.contains(i.bounds(diagram).aabb));
        const selection = calculateSelection(selectedItems, diagram, false);

        return selection;
    }

    private selectSingle(event: SvgEvent, diagram: Diagram): string[] {
        if (event.shape && event.shape.bounds(diagram).aabb.contains(event.position)) {
            return calculateSelection([event.shape], diagram, true, event.event.ctrlKey);
        } else {
            return [];
        }
    }

    private markItems() {
        for (let adorner of this.shapesAdorners) {
            adorner.hide();
        }

        let i = 0;
        for (let item of this.props.selectedItems) {
            let shapeAdorner: any;

            if (i >= this.shapesAdorners.length) {
                shapeAdorner = this.renderer.createRectangle(1);

                this.shapesAdorners.push(shapeAdorner);
            } else {
                shapeAdorner = this.shapesAdorners[i];
            }

            const strokeColor =
                item.isLocked ?
                    SELECTION_STROKE_LOCK_COLOR :
                    SELECTION_STROKE_COLOR;

            this.renderer.setBackgroundColor(shapeAdorner, SELECTION_FILL_COLOR);
            this.renderer.setStrokeColor(shapeAdorner, strokeColor);

            const bounds = item.bounds(this.props.selectedDiagram);

            this.transformShape(shapeAdorner, bounds.position.sub(bounds.halfSize), bounds.size, 1, bounds.rotation.degree);
            i++;
        }
    }

    protected transformShape(shape: any, position: Vec2, size: Vec2, offset: number, rotation = 0) {
        this.renderer.setTransform(shape, {
            x: position.x - offset,
            y: position.y - offset,
            w: size.x + 2 * offset,
            h: size.y + 2 * offset,
            rotation
        });
        this.renderer.setVisibility(shape, true);
    }

    public render(): any {
        return null;
    }
}