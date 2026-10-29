/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Container } from 'pixi.js';
import { Types } from '@app/core';
import { EngineObject } from './../interface';
import { RequestRender } from './utils';

export abstract class PixiObject implements EngineObject {
    protected abstract get root(): Container;

    constructor(
        protected readonly requestRender: RequestRender,
    ) {
    }

    public cursor(value: string | number): void {
        if (Types.isNumber(value)) {
            (this.root as any)['cursorAngle'] = value;
        } else {
            (this.root as any)['cursor'] = value;
        }
    }

    public show() {
        this.root.visible = true;
        this.requestRender();
    }

    public hide() {
        this.root.visible = false;
        this.requestRender();
    }

    public disable() {
        this.root.eventMode = 'none';
    }

    public remove() {
        this.root.removeFromParent();
        this.requestRender();
    }

    public abstract invalidate(): void;
}