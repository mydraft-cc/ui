/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Application, Container, EventBoundary, HTMLText } from 'pixi.js';
import { MathHelper, Types, Vec2 } from '@app/core';
import { DiagramItem } from '@app/wireframes/model';
import { Engine, EngineHitEvent, EngineLayer, EngineMouseEvent, EngineObject, Listener } from './../interface';
import { InteractionPipeline } from './../pipeline';
import { ROTATION_CONFIG } from './../shared';
import { PixiItem } from './item';
import { PixiLayer } from './layer';
import { PixiRenderer } from './renderer';
import { getSource } from './utils';

const RENDER_SETTLE_TIME_MS = 1000;

export class PixiEngine implements Engine {
    // Declared before the renderer, because it is passed to it.
    public readonly requestRender = () => {
        const ticker = this.application.ticker;

        // The ticker is gone when the application has already been destroyed.
        if (!ticker) {
            return;
        }

        this.isRenderRequested = true;

        if (!ticker.started) {
            ticker.start();
        }
    };

    private readonly pipeline = new InteractionPipeline();
    private readonly renderer = new PixiRenderer(this.requestRender);
    private readonly listeners = new AbortController();
    private readonly boundary: EventBoundary;
    private zoomTimer: any;
    private renderUntil = 0;
    private isRenderRequested = false;
    private isDragging = false;

    constructor(
        public readonly application: Application,
    ) {
        application.stage.eventMode = 'static';

        // Replace the default loop, which renders every frame, even when nothing has changed.
        application.ticker.remove(application.render, application);
        application.ticker.add(this.renderFrame);

        this.requestRender();

        // Text that was rendered with a fallback font must be rendered again.
        document.fonts?.addEventListener('loadingdone', this.requestRender, { signal: this.listeners.signal });

        // Hidden pages get no frames, so asynchronous text and images might have been missed in the meantime.
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.requestRender();
            }
        }, { signal: this.listeners.signal });

        this.boundary = new EventBoundary(application.stage);

        application.canvas.addEventListener('mousemove', event => {
            const hitEvent = this.buildHitEvent(event);

            this.handleMouseMove(hitEvent);
            this.pipeline.emitMouseMove(hitEvent);
        });

        application.canvas.addEventListener('mousedown', event => {
            this.handleMouseDown();
            this.pipeline.emitMouseDown(() => this.buildHitEvent(event));
        });

        window.addEventListener('blur', (event: FocusEvent) => {
            this.pipeline.emitBlur(event);
        }, { signal: this.listeners.signal });

        window.document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.pipeline.emitKeyUp(event);
        }, { signal: this.listeners.signal });

        window.document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.pipeline.emitKeyDown(event);
        }, { signal: this.listeners.signal });

        window.document.addEventListener('mousemove', (event: MouseEvent) => {
            if (this.isDragging) {
                this.isDragging = true;
                this.pipeline.emitMouseDrag(this.buildMouseEvent(event));
            }
        }, { signal: this.listeners.signal });

        window.document.addEventListener('mouseup', (event: MouseEvent) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.pipeline.emitMouseUp(this.buildMouseEvent(event));
            }
        }, { signal: this.listeners.signal });
    }

    public destroy() {
        this.listeners.abort();
    }

    private renderFrame = () => {
        const application = this.application;
        const now = performance.now();

        // Start the time window with the first frame, because frames can be delayed, e.g. for hidden pages.
        if (this.isRenderRequested) {
            this.isRenderRequested = false;

            // Keep rendering for a while, because text and images are rendered asynchronously.
            this.renderUntil = now + RENDER_SETTLE_TIME_MS;
        } else if (now > this.renderUntil) {
            application.ticker.stop();
            return;
        }

        for (const child of application.stage.children) {
            const source = getSource(child);

            if (Types.is(source, PixiLayer)) {
                source.invalidate();
            }
        }

        application.render();
    };

    public layer(label: string): EngineLayer {
        return new PixiLayer(this.application, this.renderer, this.requestRender, label);
    }

    public subscribe(listener: Listener) {
        this.pipeline.subscribe(listener);
    }

    public unsubscribe(listener: Listener) {
        this.pipeline.unsubscribe(listener);
    }

    public adjustToZoom(zoom: number) {
        clearInterval(this.zoomTimer);

        this.zoomTimer = setTimeout(() => {
            const resolution = 2 * Math.max(1, Math.round(zoom));

            function setZoom(container: Container) {
                if (!container?.children) {
                    return;
                }
        
                for (const element of container.children) {
                    // Changing the resolution renders the text again, even when it is the same value.
                    if (Types.is(element, HTMLText) && element.resolution !== resolution) {
                        element.resolution = resolution;
                    }

                    setZoom(element);
                }
            }

            setZoom(this.application.stage);
            this.requestRender();
        }, 500);
    }

    public setClickLayer(layer: PixiLayer): void {
        // Only hit the click layer, because unlike SVG, Pixi also hits unfilled adorners on top, like the move rectangle.
        const boundary = new EventBoundary(layer.container);

        this.application.canvas.addEventListener('click', event => {
            if (boundary.hitTest(event.offsetX, event.offsetY)) {
                this.pipeline.emitClick(() => this.buildHitEvent(event, boundary));
            }
        });

        // Pixi has no double click event.
        this.application.canvas.addEventListener('dblclick', event => {
            if (boundary.hitTest(event.offsetX, event.offsetY)) {
                this.pipeline.emitDoubleClick(() => this.buildHitEvent(event, boundary));
            }
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

    private buildHitEvent = (event: MouseEvent, boundary = this.boundary): EngineHitEvent => {
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