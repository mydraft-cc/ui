/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { MathHelper, Types, Vec2 } from '@app/core';
import { DiagramItem } from '@app/wireframes/model';
import { Engine, EngineHitEvent, EngineLayer, EngineMouseEvent, Listener } from './../interface';
import { InteractionPipeline } from './../pipeline';
import { ROTATION_CONFIG } from './../shared';
import { SvgItem } from './item';
import { SvgLayer } from './layer';
import { SvgRenderer } from './renderer';
import { getElement, getSource } from './utils';

export class SvgEngine implements Engine {
    private readonly pipeline = new InteractionPipeline();
    private readonly svgRenderer = new SvgRenderer();
    private isDragging = false;

    constructor(
        public readonly doc: svg.Svg,
    ) {
        doc.mousemove((event: MouseEvent) => {
            this.handleMouseMove(event);
            this.pipeline.emitMouseMove(this.buildMouseEvent(event));
        });

        doc.mousedown((event: MouseEvent) => {
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
    
    private handleMouseDown() {
        this.isDragging = true;
    }

    public setClickLayer(layer: EngineLayer) {
        const element = getElement(layer);

        element.dblclick((event: MouseEvent) => {
            this.pipeline.emitDoubleClick(() => this.buildHitEvent(event));
        });

        element.click((event: MouseEvent) => {
            this.pipeline.emitClick(() => this.buildHitEvent(event));
        });
    }

    public layer(id: string): EngineLayer {
        return new SvgLayer(this.svgRenderer, this.doc.group().id(id));
    }

    public subscribe(listener: Listener) {
        this.pipeline.subscribe(listener);
    }

    public unsubscribe(listener: Listener) {
        this.pipeline.unsubscribe(listener);
    }

    private buildMouseEvent = (event: MouseEvent): EngineMouseEvent => {
        const { x, y } = this.doc.point(event.pageX, event.pageY);
        const engineEvent =
            new EngineMouseEvent(
                event,
                new Vec2(Math.round(x), Math.round(y)));

        return engineEvent;
    };

    private buildHitEvent = (event: MouseEvent) => {
        let currentTarget: any = event.target;
        let eventObject: Object | null = null;
        let eventItem: DiagramItem | null = null; 
        
        while (currentTarget) {
            const source = getSource(currentTarget);

            if (!eventObject && !Types.is(source, SvgLayer)) {
                eventObject = source;
            }

            if (!eventItem && Types.is(source, SvgItem)) {
                eventItem = source.shape;
            }

            currentTarget = currentTarget.parentNode;
        }

        const { x, y } = this.doc.point(event.pageX, event.pageY);
        const engineEvent =
            new EngineHitEvent(
                event,
                new Vec2(Math.round(x), Math.round(y)),
                eventObject as any,
                eventItem);

        return engineEvent;
    };

    private handleMouseMove = (event: MouseEvent) => {
        const cursor = findCursor(event.target);

        if (cursor?.cursor) {
            document.body.style.cursor = cursor.cursor;
            return;
        }
        
        if (cursor?.angle) {
            const rotation = cursor.angle;

            const rotationBase = svg.adopt(cursor?.target).transform().rotate;
            const rotationTotal = MathHelper.toPositiveDegree((rotationBase || 0) + rotation);

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
}

function findCursor(element: any) {
    while (element) {
        const cursor = element['cursor'];

        if (cursor) {
            return { cursor };
        }

        const angle = element['cursorAngle'];
        if (Number.isFinite(angle)) {
            return { angle, target: element };
        }

        element = element.parentNode;
    }

    return null;
}