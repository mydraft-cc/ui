/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { Rotation, SVGHelper, Vec2 } from '@app/core';
import { Diagram, DiagramItem, SnapManager, Transform } from '@app/wireframes/model';
import { SVGRenderer2 } from '../shapes/utils/svg-renderer2';
import { InteractionOverlays } from './interaction-overlays';
import { InteractionHandler, InteractionService, SvgEvent } from './interaction-service';

const MODE_RESIZE = 2;
const MODE_MOVE = 3;
const MODE_ROTATE = 1;

const TRANSFORMER_STROKE_COLOR = '#080';
const TRANSFORMER_FILL_COLOR = '#0f0';

export interface TransformAdornerProps {
    // The current zoom value.
    zoom: number;

    // The view size of the editor.
    viewSize: Vec2;

    // The adorner scope.
    adorners: svg.Container;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The interaction service.
    interactionService: InteractionService;

    // The preview of items.
    onPreview: (items: DiagramItem[]) => void;

    // The preview of items.
    onPreviewEnd: () => void;

    // A function to transform a set of items.
    onTransformItems: (diagram: Diagram, items: DiagramItem[], oldBounds: Transform, newBounds: Transform) => void;
}

export class TransformAdorner extends React.PureComponent<TransformAdornerProps> implements InteractionHandler {
    private transform = Transform.ZERO;
    private startTransform = Transform.ZERO;
    private allElements: svg.Element[];
    private overlays: InteractionOverlays;
    private canResizeX = false;
    private canResizeY = false;
    private manipulated = false;
    private manipulationMode = 0;
    private moveShape: svg.Element = null!;
    private dragStart = Vec2.ZERO;
    private rotation = Rotation.ZERO;
    private rotateShape: svg.Element = null!;
    private resizeDragOffset = Vec2.ZERO;
    private resizeShapes: svg.Element[] = [];
    private snapManager = new SnapManager();

    constructor(props: TransformAdornerProps) {
        super(props);

        this.createRotateShape();
        this.createMoveShape();
        this.createResizeShapes();
        this.allElements = [...this.resizeShapes, this.moveShape, this.rotateShape];
        this.hideShapes();

        this.props.interactionService.addHandler(this);

        this.overlays = new InteractionOverlays(this.props.adorners);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);
    }

    public componentDidUpdate(prevProps: TransformAdornerProps) {
        if (this.props.selectedDiagram.selectedIds !== prevProps.selectedDiagram.selectedIds) {
            this.rotation = Rotation.ZERO;
        }

        this.manipulationMode = 0;
        this.manipulated = false;

        if (this.hasSelection()) {
            this.calculateInitializeTransform();
            this.calculateResizeRestrictions();
            this.layoutShapes();
        } else {
            this.hideShapes();
        }
    }

    private hasSelection(): boolean {
        return this.props.selectedItems.length > 0;
    }

    private calculateInitializeTransform() {
        let transform: Transform;

        if (this.props.selectedItems.length === 1) {
            transform = this.props.selectedItems[0].bounds(this.props.selectedDiagram);
        } else {
            const bounds = this.props.selectedItems.map(x => x.bounds(this.props.selectedDiagram));

            transform = Transform.createFromTransformationsAndRotation(bounds, this.rotation);
        }

        this.transform = transform;
    }

    private calculateResizeRestrictions() {
        this.canResizeX = false;
        this.canResizeY = false;

        for (const item of this.props.selectedItems) {
            if (item.constraint) {
                if (!item.constraint.calculateSizeX()) {
                    this.canResizeX = true;
                }

                if (!item.constraint.calculateSizeY()) {
                    this.canResizeY = true;
                }
            } else {
                this.canResizeX = true;
                this.canResizeY = true;
            }
        }
    }

    public onKeyDown(event: KeyboardEvent, next: (event: KeyboardEvent) => void) {
        if (!isNoInputFocused()) {
            next(event);
            return;
        }

        let xd = 0;
        let yd = 0;

        switch (event.key) {
            case 'ArrowLeft':
                xd = -1;
                break;
            case 'ArrowRight':
                xd = +1;
                break;
            case 'ArrowUp':
                yd = -1;
                break;
            case 'ArrowDown':
                yd = 1;
                break;
        }

        if (xd === 0 && yd === 0) {
            next(event);
            return;
        }

        if (event.shiftKey) {
            xd *= 10;
            yd *= 10;
        }

        const previousTranform = this.transform;

        this.transform = previousTranform.moveBy(new Vec2(xd, yd));

        this.props.onPreviewEnd();
        this.props.onTransformItems(
            this.props.selectedDiagram,
            this.props.selectedItems,
            previousTranform,
            this.transform);

        this.startTransform = this.transform;

        stopEvent(event);
    }

    public onMouseDown(event: SvgEvent, next: (event: SvgEvent) => void) {
        if (event.event.ctrlKey) {
            next(event);
            return;
        }

        let hitItem = this.hitTest(event.position);

        if (!hitItem) {
            next(event);
        }

        hitItem = this.hitTest(event.position);

        if (!hitItem) {
            this.manipulationMode = 0;
            return;
        }

        this.manipulated = false;

        if (hitItem === this.moveShape) {
            this.manipulationMode = MODE_MOVE;
        } else if (hitItem === this.rotateShape) {
            this.manipulationMode = MODE_ROTATE;
        } else {
            this.manipulationMode = MODE_RESIZE;

            this.resizeDragOffset = hitItem['offset'];
        }

        this.dragStart = event.position;

        this.startTransform = this.transform;
    }

    private hitTest(point: Vec2) {
        if (!this.transform) {
            return null;
        }

        const unrotated = Vec2.rotated(point, this.transform.position, this.transform.rotation.negate());

        for (const element of this.allElements) {
            const box = SVGRenderer2.INSTANCE.getLocalBounds(element);

            if (box.contains(unrotated)) {
                return element;
            }
        }

        return null;
    }

    public onMouseDrag(event: SvgEvent, next: (event: SvgEvent) => void) {
        if (this.manipulationMode === 0 || !this.dragStart) {
            next(event);
            return;
        }

        this.overlays.reset();

        const delta = event.position.sub(this.dragStart);

        if (delta.lengtSquared === 0) {
            return;
        }

        if (this.manipulationMode === 0) {
            return;
        }

        this.manipulated = true;

        if (this.manipulationMode === MODE_MOVE) {
            this.move(delta, event.event.shiftKey);
        } else if (this.manipulationMode === MODE_ROTATE) {
            this.rotate(event, event.event.shiftKey);
        } else {
            this.resize(delta, event.event.shiftKey);
        }

        const previews = this.props.selectedItems.map(x => x.transformByBounds(this.startTransform, this.transform));

        this.props.onPreview(previews);

        this.layoutShapes();
    }

    private move(delta: Vec2, shiftKey: boolean) {
        const snapResult = this.snapManager.snapMoving(this.props.selectedDiagram, this.props.viewSize, this.startTransform, delta, shiftKey);

        this.transform = this.startTransform.moveBy(snapResult.delta);

        this.overlays.showSnapAdorners(snapResult);

        const x = Math.floor(this.transform.aabb.x);
        const y = Math.floor(this.transform.aabb.y);

        this.overlays.showInfo(this.transform, `X: ${x}, Y: ${y}`);
    }

    private rotate(event: SvgEvent, shiftKey: boolean) {
        const deltaValue = this.getCummulativeRotation(event);
        const deltaRotation = this.snapManager.snapRotating(this.startTransform, deltaValue, shiftKey);

        this.transform = this.startTransform.rotateBy(Rotation.fromDegree(deltaRotation));

        this.overlays.showInfo(this.transform, `Y: ${this.transform.rotation.degree}°`);
    }

    private getCummulativeRotation(event: SvgEvent): number {
        const center = this.startTransform.position;

        const eventPoint = event.position;
        const eventStart = this.dragStart;

        const cummulativeRotation = Vec2.angleBetween(eventStart.sub(center), eventPoint.sub(center));

        return cummulativeRotation;
    }

    private resize(delta: Vec2, shiftKey: boolean) {
        const startRotation = this.startTransform.rotation;

        const deltaSize = this.getResizeDeltaSize(startRotation, delta, shiftKey);
        const deltaMove = this.getResizeDeltaPos(startRotation, deltaSize);

        this.transform = this.startTransform.resizeAndMoveBy(deltaSize, deltaMove);

        const w = Math.floor(this.transform.size.x);
        const h = Math.floor(this.transform.size.y);

        this.overlays.showInfo(this.transform, `Width: ${w}, Height: ${h}`);
    }

    private getResizeDeltaSize(angle: Rotation, cummulativeTranslation: Vec2, shiftKey: boolean) {
        const delta = Vec2.rotated(cummulativeTranslation.mul(2), Vec2.ZERO, angle.negate()).mul(this.resizeDragOffset);

        const snapResult =
            this.snapManager.snapResizing(this.props.selectedDiagram, this.props.viewSize, this.startTransform, delta, shiftKey,
                this.resizeDragOffset.x,
                this.resizeDragOffset.y);

        this.overlays.showSnapAdorners(snapResult);

        return snapResult.delta;
    }

    private getResizeDeltaPos(angle: Rotation, dSize: Vec2) {
        let x = 0;
        let y = 0;

        if (this.resizeDragOffset.y !== 0) {
            y += this.resizeDragOffset.y * dSize.y * angle.cos;
            x -= this.resizeDragOffset.y * dSize.y * angle.sin;
        }

        if (this.resizeDragOffset.x !== 0) {
            y += this.resizeDragOffset.x * dSize.x * angle.sin;
            x += this.resizeDragOffset.x * dSize.x * angle.cos;
        }

        return new Vec2(x, y);
    }

    public onMouseUp(event: SvgEvent, next: (event: SvgEvent) => void) {
        if (this.manipulationMode === 0) {
            next(event);
            return;
        }

        try {
            this.overlays.reset();

            if (this.manipulationMode === 0 || !this.manipulated) {
                return;
            }

            this.rotation = this.transform.rotation;

            this.props.onTransformItems(
                this.props.selectedDiagram,
                this.props.selectedItems,
                this.startTransform,
                this.transform);
        } finally {
            this.props.onPreviewEnd();

            this.manipulationMode = 0;
            this.manipulated = false;
        }
    }

    private layoutShapes() {
        if (this.resizeShapes === null) {
            return;
        }

        const size = this.transform.size;

        const rotation = this.transform.rotation.degree;
        const position = this.transform.position;

        for (const resizeShape of this.resizeShapes) {
            const offset = resizeShape['offset'];

            SVGHelper.transform(resizeShape, {
                x: position.x - 7 + offset.x * (size.x + 4),
                y: position.y - 7 + offset.y * (size.y + 4),
                rx: position.x,
                ry: position.y,
                rotation,
            }, true, true);

            const visible =
                (offset.x === 0 || this.canResizeX) &&
                (offset.y === 0 || this.canResizeY);

            if (visible) {
                resizeShape.show();
            } else {
                resizeShape.hide();
            }
        }

        this.rotateShape.show();

        SVGHelper.transform(this.rotateShape, {
            x: position.x - 8,
            y: position.y - 8 - size.y * 0.5 - 30,
            rx: position.x,
            ry: position.y,
            rotation,
        }, true, true);

        this.moveShape.show();

        SVGHelper.transform(this.moveShape, {
            x: position.x - 0.5 * size.x - 1,
            y: position.y - 0.5 * size.y - 1,
            w: Math.floor(size.x + 2),
            h: Math.floor(size.y + 2),
            rx: position.x,
            ry: position.y,
            rotation,
        }, true, true);
    }

    private hideShapes() {
        this.allElements.forEach(s => s.hide());
    }

    private createMoveShape() {
        const moveShape =
            this.props.adorners.rect(1)
                .stroke({ color: TRANSFORMER_STROKE_COLOR, width: 1 }).fill('none');

        this.props.interactionService.setCursor(moveShape, 'move');

        this.moveShape = moveShape;
    }

    private createRotateShape() {
        const rotateShape =
            this.props.adorners.ellipse(16, 16)
                .stroke({ color: TRANSFORMER_STROKE_COLOR, width: 1 }).fill(TRANSFORMER_FILL_COLOR);

        this.props.interactionService.setCursor(rotateShape, 'pointer');

        this.rotateShape = rotateShape;
    }

    private createResizeShapes() {
        const ys = [-0.5, -0.5, -0.5, 0.0, 0.0, 0.5, 0.5, 0.5];
        const xs = [-0.5, 0.0, 0.5, -0.5, 0.5, -0.5, 0.0, 0.5];
        const as = [315, 0, 45, 270, 90, 215, 180, 135];

        for (let i = 0; i < xs.length; i++) {
            const resizeShape =
                this.props.adorners.rect(14, 14)
                    .stroke({ color: TRANSFORMER_STROKE_COLOR, width: 1 }).fill(TRANSFORMER_FILL_COLOR);

            resizeShape['offset'] = new Vec2(xs[i], ys[i]);

            this.props.interactionService.setCursorAngle(resizeShape, as[i]);

            this.resizeShapes.push(resizeShape);
        }
    }

    public render(): any {
        return null;
    }
}

function isNoInputFocused() {
    const focusedElement = document.activeElement?.tagName?.toLowerCase();

    return focusedElement !== 'input' && focusedElement !== 'textarea';
}

function stopEvent(event: KeyboardEvent) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
}
