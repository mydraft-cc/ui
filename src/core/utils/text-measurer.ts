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

const MAX_CACHE_SIZE = 2000;

class DefaultTextMeasurer {
    private readonly measureDiv: HTMLDivElement;
    private readonly cache = new Map<string, number>();

    constructor() {
        this.measureDiv = document.createElement('div');
        this.measureDiv.style.height = 'auto';
        this.measureDiv.style.position = 'absolute';
        this.measureDiv.style.visibility = 'hidden';
        this.measureDiv.style.width = 'auto';
        this.measureDiv.style.whiteSpace = 'nowrap';
        document.body.appendChild(this.measureDiv);

        // Widths that were measured with a fallback font are wrong once the actual font has been loaded.
        document.fonts?.addEventListener('loadingdone', () => {
            this.cache.clear();
        });
    }

    public getTextWidth(text: string, fontSize: number, fontFamily: string) {
        const key = `${fontSize}|${fontFamily}|${text}`;

        let width = this.cache.get(key);
        if (width === undefined) {
            width = this.measure(text, fontSize, fontFamily);

            if (this.cache.size >= MAX_CACHE_SIZE) {
                this.cache.clear();
            }

            this.cache.set(key, width);
        }

        return width;
    }

    // Reading the size forces a synchronous layout, therefore it is cached.
    private measure(text: string, fontSize: number, fontFamily: string) {
        this.measureDiv.textContent = text;
        this.measureDiv.style.fontSize = sizeInPx(fontSize);
        this.measureDiv.style.fontFamily = fontFamily;

        return this.measureDiv.clientWidth + 1;
    }
}

export namespace TextMeasurer {
    export const DEFAULT = new DefaultTextMeasurer();
}