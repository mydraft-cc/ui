/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Application, Container, EventBoundary } from 'pixi.js';
import { MathHelper, Types, Vec2 } from '@app/core';
import { DiagramItem } from '@app/wireframes/model';
import { Engine, EngineHitEvent, EngineLayer, EngineMouseEvent, EngineObject, Listener } from './../interface';
import { InteractionPipeline } from './../pipeline';
import { ROTATION_CONFIG } from './../shared';
import { PixiItem } from './item';
import { PixiLayer } from './layer';
import { PixiRenderer } from './renderer';
import { getSource } from './utils';

export class PixiEngine implements Engine {
    private readonly pipeline = new InteractionPipeline();
    private readonly renderer = new PixiRenderer();
    private isDragging = false;

    constructor(
        public readonly application: Application,
    ) {
        application.stage.eventMode = 'static';

        application.ticker.add(() => {
            for (const child of application.stage.children) {
                const source = getSource(child);

                if (Types.is(source, PixiLayer)) {
                    source.invalidate();
                }
            }
        });

        application.canvas.addEventListener('mousemove', event => {
            const hitEvent = this.buildHitEvent(event);

            this.handleMouseMove(hitEvent);
            this.pipeline.emitMouseMove(this.buildHitEvent(event));
        });

        application.canvas.addEventListener('mousedown', event => {
            this.handleMouseDown();
            this.pipeline.emitMouseDown(() => this.buildHitEvent(event));
        });

        window.addEventListener('blur', (event: FocusEvent) => {
            this.pipeline.emitBlur(event);
        });

        window.document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.pipeline.emitKeyUp(event);
        });

        window.document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.pipeline.emitKeyDown(event);
        });

        window.document.addEventListener('mousemove', (event: MouseEvent) => {
            if (this.isDragging) {
                this.isDragging = true;
                this.pipeline.emitMouseDrag(this.buildMouseEvent(event));
            }
        });

        window.document.addEventListener('mouseup', (event: MouseEvent) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.pipeline.emitMouseUp(this.buildMouseEvent(event));
            }
        });
    }

    public layer(label: string): EngineLayer {
        return new PixiLayer(this.application, this.renderer, label);  
    }

    public subscribe(listener: Listener) {
        this.pipeline.subscribe(listener);
    }

    public unsubscribe(listener: Listener) {
        this.pipeline.unsubscribe(listener);
    }

    public setClickLayer(layer: PixiLayer): void {
        layer.container.on('click', event => {
            this.pipeline.emitClick(() => this.buildHitEvent(event));
        });

        layer.container.on('doubleclick', event => {
            this.pipeline.emitDoubleClick(() => this.buildHitEvent(event));
        });
    }

    private buildMouseEvent = (event: MouseEvent): EngineMouseEvent => {
        const { x, y } = this.getPosition(event);

        const engineEvent =
            new EngineMouseEvent(
                event,
                new Vec2(Math.round(x), Math.round(y)));

        return engineEvent;
    };

    private buildHitEvent = (event: MouseEvent): EngineHitEvent => {
        const boundary = new EventBoundary(this.application.stage);

        const { x, y } = this.getPosition(event);
        const hit = boundary.hitTest(event.offsetX, event.offsetY);
        
        let currentTarget: Container = hit;
        let eventObject: EngineObject | null = null;
        let eventItem: DiagramItem | null = null; 
        
        while (currentTarget) {
            const source = getSource(currentTarget);

            if (source && !Types.is(source, PixiLayer)) {
                eventObject = source;
            }

            if (!eventItem && Types.is(source, PixiItem)) {
                eventItem = source.shape;
            }

            currentTarget = currentTarget.parent;
        }

        const engineEvent =
            new EngineHitEvent(
                event,
                new Vec2(Math.round(x), Math.round(y)),
                eventObject,
                eventItem,
                hit);

        return engineEvent;
    };

    private handleMouseMove = (event: EngineHitEvent) => {
        if (!event.target) {
            document.body.style.cursor = 'default';
            return;
        }
    
        const cursor = findCursor(event.target);

        if (cursor?.cursor) {
            document.body.style.cursor = cursor.cursor;
            return;
        }
        
        if (cursor?.angle) {
            const defaultTransform = {
                pivot: { x: 0, y: 0 },
                position: { x: 0, y: 0 },
                rotation: 0,
                scale: { x: 0, y: 0 },
                skew: { x: 0, y: 0 },
            };

            const rotationBase = cursor.target!.worldTransform.decompose(defaultTransform);
            const rotationDegree = MathHelper.toDegree(rotationBase.rotation);
            const rotationTotal = MathHelper.toPositiveDegree(rotationDegree + cursor.angle);

            for (const config of ROTATION_CONFIG) {
                if (rotationTotal > config.angle - 22.5 &&
                    rotationTotal < config.angle + 22.5) {
                    document.body.style.cursor = config.cursor;
                    return;
                }
            }

            document.body.style.cursor = 'n-resize';
            return;
        } 

        document.body.style.cursor = 'default';
    };
    
    private getPosition(event: MouseEvent) {
        const bounds = this.application.canvas.getBoundingClientRect();
        const x = event.clientX - bounds.x;
        const y = event.clientY - bounds.y;
        
        return this.application.stage.worldTransform.applyInverse({ x, y });
    }

    private handleMouseDown() {
        this.isDragging = true;
    }
}

function findCursor(element: Container) {
    while (element) {
        const cursor = element.cursor;

        if (cursor) {
            return { cursor };
        }

        const angle = (element as any)['cursorAngle'];
        if (Number.isFinite(angle)) {
            return { angle, target: element };
        }

        element = element.parent;
    }

    return null;
}