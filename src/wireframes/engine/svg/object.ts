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
    
    public cursor(value: string | number): void {
        if (Types.isNumber(value)) {
            (this.root.node as any)['cursorAngle'] = value;
        } else {
            (this.root.node as any)['cursor'] = value;
        }
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
}