/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { sizeInPx } from './react';

export interface TextMeasurer {
    getTextWidth(text: string, fontSize: number, fontFamily: string): number;
}

class DefaultTextMeasurer {
    private readonly measureDiv: HTMLDivElement;

    constructor() {
        this.measureDiv = document.createElement('div');
        this.measureDiv.style.height = 'auto';
        this.measureDiv.style.position = 'absolute';
        this.measureDiv.style.visibility = 'hidden';
        this.measureDiv.style.width = 'auto';
        this.measureDiv.style.whiteSpace = 'nowrap';
        document.body.appendChild(this.measureDiv);
    }

    public getTextWidth(text: string, fontSize: number, fontFamily: string) {
        this.measureDiv.textContent = text;
        this.measureDiv.style.fontSize = sizeInPx(fontSize);
        this.measureDiv.style.fontFamily = fontFamily;

        return this.measureDiv.clientWidth + 1;
    }
}

export namespace TextMeasurer {
    export const DEFAULT = new DefaultTextMeasurer();
}