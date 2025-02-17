/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { isMiddleMouse, Rotation, Subscription, Timer, Vec2 } from '@app/core';
import { Engine, EngineHitEvent, EngineLayer, EngineMouseEvent, EngineRect, Listener } from '@app/wireframes/engine';
import { Diagram, DiagramItem, DiagramItemSet, SnapManager, SnapMode, Transform } from '@app/wireframes/model';
import { OverlayManager } from './../contexts/OverlayContext';
import { PreviewEvent } from './preview';

enum Mode { None, Resize, Move, Rotate }

const DEBUG_SIDES = false;
const DEBUG_DISTANCES = false;

const TRANSFORMER_STROKE_COLOR = '#080';
const TRANSFORMER_FILL_COLOR = '#0f0';

export interface TransformAdornerProps {
    // The current zoom value.
    zoom: number;

    // The view size of the editor.
    viewSize: Vec2;

    // The current engine.
    engine: Engine;

    // The adorner scope.
    layer: EngineLayer;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectionSet: DiagramItemSet;

    // The snap manager.
    snapManager: SnapManager;

    // The overlay manager.
    overlayManager: OverlayManager;

    // The preview subscription.
    previewStream: Subscription<PreviewEvent>;

    // A function to transform a set of items.
    onTransformItems: (diagram: Diagram, items: ReadonlyArray<DiagramItem>, oldBounds: Transform, newBounds: Transform) => void;
}

const DRAG_SIZE = 12;

export class TransformAdorner extends React.PureComponent<TransformAdornerProps> implements Listener {
    private allElements: EngineRect[];
    private canResizeX = false;
    private canResizeY = false;
    private manipulated = false;
    private manipulationMode = Mode.None;
    private manipulationOffset = Vec2.ZERO;
    private moveShape: EngineRect = null!;
    private moveTimer?: Timer | null;
    private resizeShapes: EngineRect[] = [];
    private rotateShape: EngineRect = null!;
    private rotation = Rotation.ZERO;
    private startPosition = Vec2.ZERO;
    private startTransform = Transform.ZERO;
    private transform = Transform.ZERO;

    constructor(props: TransformAdornerProps) {
        super(props);

        this.createRotateShape();
        this.createMoveShape();
        this.createResizeShapes();
        this.allElements = [...this.resizeShapes, this.moveShape, this.rotateShape];
        this.hideShapes();

        this.props.engine.subscribe(this);
    }

    public componentDidUpdate(prevProps: TransformAdornerProps) {
        if (this.props.engine !== prevProps.engine) {
            if (prevProps.engine) {
                prevProps.engine.unsubscribe(this);
            }
    
            if (this.props.engine) {
                this.props.engine.subscribe(this);
            }
        }

        if (this.props.selectedDiagram.selectedIds !== prevProps.selectedDiagram.selectedIds) {
            this.rotation = Rotation.ZERO;
        }

        this.manipulationMode = Mode.None;
        this.manipulated = false;

        if (this.hasSelection()) {
            this.calculateInitializeTransform();
            this.calculateResizeRestrictions();
            this.renderShapes();
        } else {
            this.hideShapes();
        }
    }

    public componentWillUnmount() {
        if (this.props.engine) {
            this.props.engine.unsubscribe(this);
        }
    }

    private hasSelection(): boolean {
        return this.props.selectionSet.selectedItems.length > 0;
    }

    private calculateInitializeTransform() {
        let transform: Transform;
        if (this.props.selectionSet.selectedItems.length === 0) {
            transform = Transform.ZERO;
        } else if (this.props.selectionSet.selectedItems.length === 1) {
            transform = this.props.selectionSet.selectedItems[0].bounds(this.props.selectedDiagram);
        } else {
            const bounds = this.props.selectionSet.selectedItems.map(x => x.bounds(this.props.selectedDiagram));

            transform = Transform.createFromTransformationsAndRotation(bounds, this.rotation);
        }

        this.transform = transform;
    }

    private calculateResizeRestrictions() {
        this.canResizeX = false;
        this.canResizeY = false;

        for (const item of this.props.selectionSet.selectedItems) {
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
        // If the manipulation with the mouse is still in progress we do not handle the event.
        if (isInputFocused() || !this.hasSelection() || this.manipulationMode != Mode.None) {
            next(event);
            return;
        }

        let xd = 0;
        let yd = 0;

        // Calculate the movement direction from the keys.
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

        // If the wrong keys are pressed, we just stop here.
        if (xd === 0 && yd === 0) {
            next(event);
            return;
        }

        stopEvent(event);

        // If the manipulation with the mouse is still in progress we do not handle the event.
        if (this.moveTimer) {
            next(event);
            return;
        }

        let counter = 1;
        this.startManipulation(null!, this.transform);

        const run = () => {
            const delta = new Vec2(xd * counter, yd * counter);

            // Reset the overlay to show all markers.
            this.props.overlayManager.reset();

            // Show the overlay after a few movements, not the first click.
            this.move(delta, 'None', false);

            this.renderPreview();
            this.renderShapes();

            // We have kept the keyboard pressed and therefore also updated at least one shape.
            this.manipulated = true;
    
            counter++;
        };

        run();

        this.moveTimer = new Timer(() => run(), 200, 1000);
    }

    public onKeyUp(event: KeyboardEvent, next: (event: KeyboardEvent) => void) {
        if (!this.moveTimer) {
            next(event);
            return;
        }

        try {
            this.props.overlayManager.reset();

            // If none the timer has never been triggered we have not moved the shape and we can just stop here.
            if (!this.manipulated) {
                return;
            }

            this.rotation = this.transform.rotation;
            this.props.onTransformItems(
                this.props.selectedDiagram,
                this.props.selectionSet.selectedItems,
                this.startTransform,
                this.transform);
        } finally {
            this.stopTransform();
        }
    }

    public onMouseDown(event: EngineHitEvent, next: (event: EngineHitEvent) => void) {
        // If the manipulation with the keyboard is still in progress we do not handle the event.
        if (event.source.ctrlKey || this.moveTimer || this.manipulationMode != Mode.None) {
            next(event);
            return;
        }

        // The middle mouse button is needed for pan and zoom.
        if (isMiddleMouse(event.source)) {
            next(event);
            return;
        }

        let hitItem = this.hitTest(event.position);
        if (!hitItem) {
            next(event);
        }

        hitItem = this.hitTest(event.position);
        if (!hitItem) {
            return;
        }

        // Reset the flag to indicate whether something has been manipulated.
        this.startManipulation(event.position!, this.transform);

        if (hitItem === this.moveShape) {
            this.manipulationMode = Mode.Move;
        } else if (hitItem === this.rotateShape) {
            this.manipulationMode = Mode.Rotate;
        } else {
            this.manipulationMode = Mode.Resize;
            this.manipulationOffset = (hitItem as any)['offset'] as Vec2;
        }
    }

    private hitTest(point: Vec2) {
        return this.props.layer.hitTest(point.x, point.y)[0];
    }

    public onMouseDrag(event: EngineMouseEvent, next: (event: EngineMouseEvent) => void) {
        if (this.manipulationMode === Mode.None || !this.startPosition) {
            next(event);
            return;
        }

        // Reset the overlay to show all markers.
        this.props.overlayManager.reset();

        const delta = event.position.sub(this.startPosition);
        // If the mouse has not been moved we can just stop here.
        if (delta.lengtSquared === 0) {
            return;
        }

        // We have moved the mouse and therefore also updated at least one shape.
        this.manipulated = true;
        if (this.manipulationMode === Mode.Move) {
            this.move(delta, getSnapMode(event.source));
        } else if (this.manipulationMode === Mode.Rotate) {
            this.rotate(event, getSnapMode(event.source));
        } else {
            this.resize(delta, getSnapMode(event.source));
        }

        this.renderPreview();
        this.renderShapes();
    }

    private renderPreview() {
        const items: Record<string, DiagramItem> = {};

        for (const item of this.props.selectionSet.editableItems) {
            items[item.id] = item.transformByBounds(this.startTransform, this.transform);
        }

        // Use a stream of preview updates to bypass react for performance reasons.
        this.props.previewStream.next({ type: 'Update', items });
    }

    private move(delta: Vec2, snapMode: SnapMode, showOverlay = true) {
        const snapResult = this.props.snapManager.snapMoving(this.startTransform, delta, snapMode, this.props.selectionSet.editableIds);

        this.transform = this.startTransform.moveBy(snapResult.delta);

        if (showOverlay) {
            this.props.overlayManager.showSnapAdorners(snapResult);

            const x = Math.floor(this.transform.aabb.x);
            const y = Math.floor(this.transform.aabb.y);

            this.props.overlayManager.showInfo(this.transform, `X: ${x}, Y: ${y}`);
        }

        this.debug();
    }

    private rotate(event: EngineMouseEvent, snapMode: SnapMode, showOverlay = true) {
        const deltaValue = this.getCummulativeRotation(event);
        const deltaRotation = this.props.snapManager.snapRotating(this.startTransform, deltaValue, snapMode);

        this.transform = this.startTransform.rotateBy(Rotation.fromDegree(deltaRotation));

        if (showOverlay) {
            this.props.overlayManager.showInfo(this.transform, `Y: ${this.transform.rotation.degree}°`);
        }
    }

    private getCummulativeRotation(event: EngineMouseEvent): number {
        const center = this.startTransform.position;

        const eventPoint = event.position;
        const eventStart = this.startPosition;

        const cummulativeRotation = Vec2.angleBetween(eventStart.sub(center), eventPoint.sub(center));

        return cummulativeRotation;
    }

    private resize(delta: Vec2, snapMode: SnapMode, showOverlay = true) {
        const startRotation = this.startTransform.rotation;

        const deltaSize = this.getResizeDeltaSize(startRotation, delta, snapMode);
        const deltaMove = this.getResizeDeltaPosition(startRotation, deltaSize.delta);

        // A resize is very often also a movement, because the center is in the middle.
        this.transform = this.startTransform.resizeAndMoveBy(deltaSize.delta, deltaMove);

        if (showOverlay) {
            this.props.overlayManager.showSnapAdorners(deltaSize);

            const w = this.transform.size.x;
            const h = this.transform.size.y;
            const x = this.transform.aabb.x;

            this.props.overlayManager.showInfo(this.transform, `Width: ${w}, Height: ${h}, X: ${x}`);
        }

        this.debug();
    }

    private getResizeDeltaSize(angle: Rotation, cummulativeTranslation: Vec2, snapMode: SnapMode) {
        const delta = Vec2.rotated(cummulativeTranslation.mul(2), Vec2.ZERO, angle.negate()).mul(this.manipulationOffset);

        const snapResult =
            this.props.snapManager.snapResizing(this.startTransform, delta, snapMode,
                this.manipulationOffset.x,
                this.manipulationOffset.y,
                this.props.selectionSet.editableIds);

        return snapResult;
    }

    private debug() {
        if (DEBUG_SIDES || DEBUG_DISTANCES) {
            const { xLines, yLines } = this.props.snapManager.getDebugLines(this.props.selectionSet.editableIds);
    
            for (const line of xLines) {
                if ((line.positions && DEBUG_DISTANCES) || DEBUG_SIDES) {
                    this.props.overlayManager.renderXLine(line);
                }
            }

            for (const line of yLines) {
                if ((line.positions && DEBUG_DISTANCES) || DEBUG_SIDES) {
                    this.props.overlayManager.renderYLine(line);
                }
            }
        }
    }

    private getResizeDeltaPosition(angle: Rotation, dSize: Vec2) {
        let x = 0;
        let y = 0;

        if (this.manipulationOffset.y !== 0) {
            y += this.manipulationOffset.y * dSize.y * angle.cos;
            x -= this.manipulationOffset.y * dSize.y * angle.sin;
        }

        if (this.manipulationOffset.x !== 0) {
            y += this.manipulationOffset.x * dSize.x * angle.sin;
            x += this.manipulationOffset.x * dSize.x * angle.cos;
        }

        return new Vec2(x, y);
    }

    public onMouseUp(event: EngineMouseEvent, next: (event: EngineMouseEvent) => void) {    
        if (this.manipulationMode === Mode.None) {
            next(event);
            return;
        }

        try {
            this.props.overlayManager.reset();

            if (!this.manipulated) {
                return;
            }

            this.rotation = this.transform.rotation;

            this.props.onTransformItems(
                this.props.selectedDiagram,
                this.props.selectionSet.editableItems,
                this.startTransform,
                this.transform);
        } finally {
            this.stopTransform();
        }
    }

    public onBlur(event: FocusEvent, next: (event: FocusEvent) => void) {
        if (this.manipulationMode === Mode.None && !this.moveTimer) {
            next(event);
            return;
        }

        this.stopTransform();
    }

    private startManipulation(position: Vec2, transform: Transform) {
        // Use a stream of preview updates to bypass react for performance reasons.
        this.props.previewStream.next({ type: 'Start' });

        this.moveTimer?.destroy();
        this.moveTimer = null;

        this.manipulationMode = Mode.None;
        this.manipulated = false;

        this.startPosition = position;
        this.startTransform = transform;
    }

    private stopTransform() {
        // Use a stream of preview updates to bypass react for performance reasons.
        this.props.previewStream.next({ type: 'End' });

        this.moveTimer?.destroy();
        this.moveTimer = null;

        this.manipulationMode = Mode.None;
        this.manipulated = false;
    }

    private renderShapes() {
        if (this.resizeShapes === null) {
            return;
        }

        const stroke = 1 / this.props.zoom;
        const transformSize = this.transform.size;
        const transformRotation = this.transform.rotation.degree;
        const transformPosition = this.transform.position;
        const adornerSize = DRAG_SIZE / this.props.zoom;
        const adornerHalfSize = adornerSize / 2;

        for (const resizeShape of this.resizeShapes) {
            const offset = (resizeShape as any)['offset'] as Vec2;

            const visible =
                (offset.x === 0 || this.canResizeX) &&
                (offset.y === 0 || this.canResizeY);

            if (!visible) {
                resizeShape.hide();
                continue;
            }

            resizeShape.show();
            resizeShape.strokeWidth(stroke);
            resizeShape.plot({
                x: transformPosition.x - adornerHalfSize + offset.x * (transformSize.x + adornerHalfSize),
                y: transformPosition.y - adornerHalfSize + offset.y * (transformSize.y + adornerHalfSize),
                w: adornerSize,
                h: adornerSize,
                rotation: transformRotation,
                rx: transformPosition.x,
                ry: transformPosition.y,
            });
        }

        this.rotateShape.show();
        this.rotateShape.strokeWidth(stroke);
        this.rotateShape.plot({
            x: transformPosition.x - adornerHalfSize,
            y: transformPosition.y - adornerHalfSize - transformSize.y * 0.5 - 30 / this.props.zoom,
            w: adornerSize,
            h: adornerSize,
            rotation: transformRotation,
            rx: transformPosition.x,
            ry: transformPosition.y,
        });

        this.moveShape.show();
        this.moveShape.strokeWidth(stroke);
        this.moveShape.plot({
            x: transformPosition.x - 0.5 * transformSize.x,
            y: transformPosition.y - 0.5 * transformSize.y,
            w: transformSize.x,
            h: transformSize.y,        
            rotation: transformRotation,
            rx: transformPosition.x,
            ry: transformPosition.y,
        });
    }

    private hideShapes() {
        this.allElements.forEach(s => s.hide());
    }

    private createMoveShape() {
        const moveShape = this.props.layer.rect();
        moveShape.cursor('move');
        moveShape.fill('none');
        moveShape.strokeColor(TRANSFORMER_STROKE_COLOR);
        moveShape.strokeWidth(1);
        this.moveShape = moveShape;
    }

    private createRotateShape() {
        const rotateShape = this.props.layer.ellipse();
        rotateShape.cursor('pointer');
        rotateShape.fill(TRANSFORMER_FILL_COLOR);
        rotateShape.strokeColor(TRANSFORMER_STROKE_COLOR);
        rotateShape.strokeWidth(1);
        this.rotateShape = rotateShape;
    }

    private createResizeShapes() {
        const ys = [-0.5, -0.5, -0.5,  0.0, 0.0,  0.5, 0.5, 0.5];
        const xs = [-0.5,  0.0,  0.5, -0.5, 0.5, -0.5, 0.0, 0.5];
        const as = [315, 0, 45, 270, 90, 215, 180, 135];

        for (let i = 0; i < xs.length; i++) {
            const resizeShape = this.props.layer.rect();
            resizeShape.cursor(as[i]);
            resizeShape.fill(TRANSFORMER_FILL_COLOR);
            resizeShape.strokeColor(TRANSFORMER_STROKE_COLOR);
            resizeShape.strokeWidth(1);
            this.resizeShapes.push(resizeShape);

            (resizeShape as any)['offset'] = new Vec2(xs[i], ys[i]);
        }
    }

    public render(): any {
        return null;
    }
}

function isInputFocused() {
    const focusedElement = document.activeElement?.tagName?.toLowerCase();

    return focusedElement === 'input' || focusedElement === 'textarea';
}

function stopEvent(event: Event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
}

function getSnapMode(event: KeyboardEvent | MouseEvent) {
    if (event.shiftKey) {
        return 'Grid';
    } else if (event.ctrlKey) {
        return 'None';
    } else {
        return 'Shapes';
    }
}

