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
    private dragging = false;

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
        if (!this.props.interactionService.isShiftKeyPressed()) {
            const selection = this.selectSingle(event, this.props.selectedDiagram);

            this.props.selectItems(this.props.selectedDiagram, selection);
        }

        if (!event.element) {
            this.dragging = true;
            this.dragStart = event.position;
        }
    }

    public onMouseDrag(event: SvgEvent, next: () => void) {
        if (!this.dragging) {
            return next();
        }

        const selectedRect = Rect2.createFromVecs([this.dragStart!, event.position]);

        if (selectedRect.area > 0) {
            this.transformShape(this.selectionShape, selectedRect.position, selectedRect.size, 0);
        } else {
            this.renderer.setVisibility(this.selectionShape, false);
        }
    }

    public onMouseUp(event: SvgEvent, next: () => void) {
        if (!this.dragging) {
            return next();
        }

        try {
            const selectedRect = Rect2.createFromVecs([this.dragStart!, event.position]);

            if (selectedRect.area > 100) {
                const selection = this.selectMultiple(selectedRect, this.props.selectedDiagram);

                if (selection) {
                    this.props.selectItems(this.props.selectedDiagram, selection!);
                }
            }
        } finally {
            this.renderer.setVisibility(this.selectionShape, false);

            this.dragging = false;
            this.dragStart = null;
        }
    }

    private selectMultiple(rect: Rect2, diagram: Diagram): string[] {
        const selectedItems = diagram.rootIds.map(id => diagram.items.get(id)).filter(i => i && rect.containsRect(i.bounds(diagram).aabb)).map(i => i!);
        const selection = calculateSelection(selectedItems, diagram, true);

        return selection;
    }

    private selectSingle(event: SvgEvent, diagram: Diagram): string[] {
        let selection: string[] = [];

        if (event.shape && event.shape.bounds(diagram).aabb.containsVec(event.position)) {
            selection = calculateSelection([event.shape], diagram, true, this.props.interactionService.isControlKeyPressed());
        }

        return selection;
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

                this.renderer.setBackgroundColor(shapeAdorner, 'none');
                this.renderer.setStrokeColor(shapeAdorner, '#00a');

                this.shapesAdorners.push(shapeAdorner);
            } else {
                shapeAdorner = this.shapesAdorners[i];
            }

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

    public render() {
        return null;
    }
}