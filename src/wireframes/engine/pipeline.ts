/**
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { EngineHitEvent, EngineMouseEvent, Listener, NextListener } from './interface';

type HandlerFunc<T> = (event: T, next: NextListener<T>) => void;
type HandlerRoot<T> = NextListener<T>;

export const NOOP_HANDLER = () => {};

export class InteractionPipeline {
    private readonly listeners: Listener[] = [];
    private onBlur: HandlerRoot<FocusEvent> = () => NOOP_HANDLER;
    private onClick: HandlerRoot<EngineHitEvent> = () => NOOP_HANDLER;
    private onDoubleClick: HandlerRoot<EngineHitEvent> = () => NOOP_HANDLER;
    private onKeyDown: HandlerRoot<KeyboardEvent> = () => NOOP_HANDLER;
    private onKeyUp: HandlerRoot<KeyboardEvent> = () => NOOP_HANDLER;
    private onMouseDown: HandlerRoot<EngineHitEvent> = () => NOOP_HANDLER;
    private onMouseDrag: HandlerRoot<EngineMouseEvent> = () => NOOP_HANDLER;
    private onMouseMove: HandlerRoot<EngineMouseEvent> = () => NOOP_HANDLER;
    private onMouseUp: HandlerRoot<EngineMouseEvent> = () => NOOP_HANDLER;

    public subscribe(listener: Listener) {
        this.listeners.push(listener);
        this.rebuild();
    }

    public unsubscribe(listener: Listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
        this.rebuild();
    }
    
    public emitBlur(event: FocusEvent) {
        this.onBlur(event);
    }
    
    public emitClick(event: () => EngineHitEvent) {
        if (this.onClick !== NOOP_HANDLER) {
            this.onClick(event());
        }
    }
    
    public emitDoubleClick(event: () => EngineHitEvent) {
        if (this.onDoubleClick !== NOOP_HANDLER) {
            this.onDoubleClick(event());
        }
    }
    
    public emitMouseDown(event: () => EngineHitEvent) {
        if (this.onMouseDown !== NOOP_HANDLER) {
            this.onMouseDown(event());
        }
    }
    
    public emitKeyDown(event: KeyboardEvent) {
        this.onKeyDown(event);
    }
    
    public emitKeyUp(event: KeyboardEvent) {
        this.onKeyUp(event);
    }
    
    public emitMouseDrag(event: EngineMouseEvent) {
        this.onMouseDrag(event);
    }
    
    public emitMouseMove(event: EngineMouseEvent) {
        this.onMouseMove(event);
    }
    
    public emitMouseUp(event: EngineMouseEvent) {
        this.onMouseUp(event);
    }

    private rebuild() {
        this.onBlur = this.buildEvent(h => h?.onBlur?.bind(h));
        this.onClick = this.buildEvent<EngineHitEvent>(h => h?.onClick?.bind(h));
        this.onKeyUp = this.buildEvent<KeyboardEvent>(h => h.onKeyUp?.bind(h));
        this.onKeyDown = this.buildEvent<KeyboardEvent>(h => h.onKeyDown?.bind(h));
        this.onDoubleClick = this.buildEvent<EngineHitEvent>(h => h?.onDoubleClick?.bind(h));
        this.onMouseMove = this.buildEvent<EngineMouseEvent>(h => h?.onMouseMove?.bind(h));
        this.onMouseDown = this.buildEvent<EngineHitEvent>(h => h?.onMouseDown?.bind(h));
        this.onMouseDrag = this.buildEvent<EngineMouseEvent>(h => h?.onMouseDrag?.bind(h));
        this.onMouseUp = this.buildEvent<EngineMouseEvent>(h => h?.onMouseUp?.bind(h));
    }

    private buildEvent<T>(actionProvider: (listener: Listener) => HandlerFunc<T> | undefined): HandlerRoot<T> {
        let result: NextListener<T> = NOOP_HANDLER;
        for (let i = this.listeners.length - 1; i >= 0; i--) {
            const handler = actionProvider(this.listeners[i]);

            if (handler) {
                const next = result;

                result = event => handler(event, next);
            }
        }

        return result;
    }    
}
