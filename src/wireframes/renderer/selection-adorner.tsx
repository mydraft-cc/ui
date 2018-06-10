import * as React from 'react';
import * as svg from 'svg.js';

import {
    Rect2,
    Vec2
} from '@app/core';

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

const SELECTION_STROKE_COLOR = '#009';
const SELECTION_FILL_COLOR = '#00f';

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
    private layer: svg.Container;
    private shapesAdorners: svg.Element[] = [];
    private selectionShape: svg.Element | null = null;
    private dragStart: Vec2 | null;
    private dragging = false;

    public componentDidMount() {
        this.props.interactionService.addHandler(this);

        this.layer = this.props.adorners;
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
        const selectionShape = this.getOrCreateRectangle();

        if (selectedRect.area > 0) {
            this.transformShape(selectionShape, selectedRect.position, selectedRect.size, 0);
        } else {
            selectionShape.hide();
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
            const selectionShape = this.getOrCreateRectangle();

            selectionShape.hide();

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
            let shapeAdorner: svg.Element;

            if (i >= this.shapesAdorners.length) {
                shapeAdorner = this.props.adorners.rect().stroke(SELECTION_STROKE_COLOR).fill('none').back();

                this.shapesAdorners.push(shapeAdorner);
            } else {
                shapeAdorner = this.shapesAdorners[i];
            }

            const bounds = item.bounds(this.props.selectedDiagram);

            this.transformShape(shapeAdorner, bounds.position.sub(bounds.halfSize), bounds.size, 1, bounds.rotation.degree);
            i++;
        }
    }

    private getOrCreateRectangle(): svg.Element {
        if (this.selectionShape) {
            return this.selectionShape;
        }

        this.selectionShape =
            this.layer.rect().fill(SELECTION_FILL_COLOR).opacity(0.4)
                .stroke(SELECTION_STROKE_COLOR);

        return this.selectionShape;
    }

    protected transformShape(shape: svg.Element, position: Vec2, size: Vec2, offset: number, rotation = 0) {
        const bounds = new Rect2(position, size);
        let l = Math.round(bounds.left);
        let t = Math.round(bounds.top);
        let r = Math.round(bounds.right);
        let b = Math.round(bounds.bottom);

        l += 0.5 - offset;
        t += 0.5 - offset;
        r -= 0.5 - offset;
        b -= 0.5 - offset;

        shape.untransform();
        shape.size(r - l, b - t).rotate(rotation).move(l, t).show();
    }

    public render() {
        return null;
    }
}