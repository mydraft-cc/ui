/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { MathHelper, Rect2, Types, Vec2 } from '@app/core';
import { DiagramItem } from '@app/wireframes/model';
import { Engine, EngineLayer, EngineObject, HitEvent, Listener } from '../interface';
import { SvgItem } from './item';
import { SvgLayer } from './layer';
import { SvgRenderer } from './renderer';
import { getElement, getSource, SVGHelper } from './utils';

const NOOP_HANDLER: (value: any) => void = () => {};

const ROTATION_CONFIG = [
    { angle: 45, cursor: 'ne-resize' },
    { angle: 90, cursor: 'e-resize' },
    { angle: 135, cursor: 'se-resize' },
    { angle: 180, cursor: 's-resize' },
    { angle: 215, cursor: 'sw-resize' },
    { angle: 270, cursor: 'w-resize' },
    { angle: 315, cursor: 'nw-resize' },
];

export class SvgEngine implements Engine {
    private readonly listeners: Listener[] = [];
    private readonly svgRenderer = new SvgRenderer();
    private isDragging = false;
    private onClick: Function = NOOP_HANDLER;
    private onKeyUp: Function = NOOP_HANDLER;
    private onKeyDown: Function = NOOP_HANDLER;
    private onDoubleClick: Function = NOOP_HANDLER;
    private onMouseDown: Function = NOOP_HANDLER;
    private onMouseDrag: Function = NOOP_HANDLER;
    private onMouseMove: Function = NOOP_HANDLER;
    private onMouseUp: Function = NOOP_HANDLER;
    private onBlur: Function = NOOP_HANDLER;

    constructor(
        private readonly doc: svg.Svg,
    ) {
        doc.mousemove((event: MouseEvent) => {
            this.handleMouseMove(event);
            this.onMouseMove(event);
        });

        doc.mousedown((event: MouseEvent) => {
            this.handleMouseDown();
            this.onMouseDown(event);
        });

        window.addEventListener('blur', (event: FocusEvent) => {
            this.onBlur(event);
        });

        window.document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.onKeyUp(event);
        });

        window.document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.onKeyDown(event);
        });

        window.document.addEventListener('mousemove', (event: MouseEvent) => {
            if (this.isDragging) {
                this.isDragging = true;
                this.onMouseDrag(event);
            }
        });

        window.document.addEventListener('mouseup', (event: MouseEvent) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.onMouseUp(event);
            }
        });
    }
    
    private handleMouseDown() {
        this.isDragging = true;
    }

    public setClickLayer(layer: EngineLayer) {
        const element = getElement(layer);

        element.dblclick((event: MouseEvent) => {
            this.onDoubleClick(event);
        });

        element.click((event: MouseEvent) => {
            this.onClick(event);
        });
    }

    public viewBox(x: number, y: number, w: number, h: number) {
        return this.doc.viewbox(x, y, w, h);
    }

    public layer(id: string): EngineLayer {
        return new SvgLayer(this.svgRenderer, this.doc.group().id(id));
    }   
    
    public getLocalBounds(object: EngineObject): Rect2 {
        const element = getElement(object);

        if (!element.visible()) {
            return Rect2.EMPTY;
        }

        const box: svg.Box = element.bbox();

        return SVGHelper.box2Rect(box);
    }

    public subscribe(listener: Listener) {
        this.listeners.push(listener);
        this.rebuild();
    }

    public unsubscribe(listener: Listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
        this.rebuild();
    }

    private rebuild() {
        this.onBlur = this.buildEvent(h => h?.onBlur?.bind(h));
        this.onClick = this.buildMouseEvent(h => h?.onClick?.bind(h));
        this.onKeyUp = this.buildEvent(h => h.onKeyUp?.bind(h));
        this.onKeyDown = this.buildEvent(h => h.onKeyDown?.bind(h));
        this.onDoubleClick = this.buildMouseEvent(h => h?.onDoubleClick?.bind(h));
        this.onMouseMove = this.buildMouseEvent(h => h?.onMouseMove?.bind(h));
        this.onMouseDown = this.buildMouseEvent(h => h?.onMouseDown?.bind(h));
        this.onMouseDrag = this.buildMouseEvent(h => h?.onMouseDrag?.bind(h));
        this.onMouseUp = this.buildMouseEvent(h => h?.onMouseUp?.bind(h));
    }

    private buildEvent(actionProvider: (listener: Listener) => Function | undefined) {
        let result = NOOP_HANDLER;
        for (let i = this.listeners.length - 1; i >= 0; i--) {
            const handler = actionProvider(this.listeners[i]);

            if (handler) {
                const next = result;

                result = event => handler(event, next);
            }
        }

        return result;
    }

    private buildMouseEvent(actionProvider: (listener: Listener) => Function | undefined) {
        const inner = this.buildEvent(actionProvider);
        
        if (inner === NOOP_HANDLER) {
            return NOOP_HANDLER;
        }

        const result = (event: MouseEvent) => {
            let currentTarget: any = event.target;
            let eventLayer: EngineLayer | null = null;
            let eventObject: Object | null = null;
            let eventItem: DiagramItem | null = null; 
            
            while (currentTarget) {
                const source = getSource(currentTarget);

                if (!eventObject && !Types.is(source, SvgLayer)) {
                    eventObject = source;
                }

                if (!eventLayer && !Types.is(source, SvgLayer)) {
                    eventLayer = source;
                }

                if (!eventItem && Types.is(source, SvgItem)) {
                    eventItem = source.shape;
                }

                currentTarget = currentTarget.parentNode;
            }

            const { x, y } = this.doc.point(event.pageX, event.pageY);

            const svgEvent =
                new HitEvent(
                    event, 
                    new Vec2(Math.round(x), Math.round(y)),
                    eventLayer!,
                    eventObject as any,
                    eventItem);

            inner(svgEvent);
        };

        return result;
    }

    private handleMouseMove = (event: MouseEvent) => {
        const element: any = event.target;

        if (element && element['cursor']) {
            document.body.style.cursor = element['cursor'];
            return;
        } 
        
        if (element && Number.isFinite(element['cursorAngle'])) {
            const rotation = element['cursorAngle'];

            const rotationBase = svg.adopt(element).transform().rotate;
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