/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Appearance, VisualSource } from './../interface';
import { Renderer } from './renderer';

type CreatedVisual = { id: string; width?: number; height?: number; appearance: Appearance };

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

    public createVisuals(sources: ReadonlyArray<VisualSource>): CreatedVisual[] {
        const result: CreatedVisual[] = [];

        for (const source of sources) {
            for (const [id, renderer] of this.all) {
                const plugin = renderer.plugin();

                if (plugin.create) {
                    const shape = plugin.create(source);

                    if (shape) {
                        result.push({ id, ...shape });
                        break;
                    }
                }
            }
        }

        return result;
    }
}
