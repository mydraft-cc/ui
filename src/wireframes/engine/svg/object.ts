/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { Types } from '@app/core';
import { EngineObject } from './../interface';

export abstract class SvgObject implements EngineObject {
    protected abstract get root(): svg.Element;
    
    public cursor(value: string): void {
        (this.root.node as any)['cursor'] = value;
    }

    public cursorAngle(value: number): void {
        (this.root.node as any)['cursorAngle'] = value;
    }

    public show() {
        this.root.show();
    }

    public hide() {
        this.root.hide();
    }

    public disable() {
        this.root.node.style.pointerEvents = 'none';
    }

    public remove() {
        this.root.remove();
    }

    public tag<T>(key: string, value?: T): T {
        const tagKey = `tag_${key}`;

        if (Types.isUndefined(value)) {
            return (this as any)[tagKey] as T;
        } else {
            (this as any)[tagKey] = value;
            return value;            
        }
    }

    public label(value?: string): string {
        if (value) {
            this.root.id(value);
        }
        
        return this.root.id();
    }
}