/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Renderer } from './renderer';

export class RendererService {
    private readonly registeredRenderers: { [id: string]: Renderer } = {};

    public get all() {
        return Object.entries(this.registeredRenderers);
    }

    public get(id: string) {
        return this.registeredRenderers[id];
    }

    public addRendererById(id: string, renderer: Renderer): RendererService {
        this.registeredRenderers[id] = renderer;

        return this;
    }

    public addRenderer(renderer: Renderer): RendererService {
        this.registeredRenderers[renderer.identifier()] = renderer;

        return this;
    }
}
