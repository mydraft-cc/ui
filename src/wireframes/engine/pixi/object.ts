/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Container } from 'pixi.js';
import { Types } from '@app/core';
import { EngineObject } from './../interface';

export abstract class PixiObject implements EngineObject {
    protected abstract get root(): Container;
    
    public cursor(value: string | number): void {
        if (Types.isNumber(value)) {
            (this.root as any)['cursorAngle'] = value;
        } else {
            (this.root as any)['cursor'] = value;
        }
    }

    public show() {
        this.root.visible = true;
    }

    public hide() {
        this.root.visible = false;
    }

    public disable() {
        this.root.eventMode = 'none';
    }

    public remove() {
        this.root.removeFromParent();
    }

    public abstract invalidate(): void;
}