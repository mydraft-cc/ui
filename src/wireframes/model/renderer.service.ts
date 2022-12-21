/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Appearance, ShapeSource } from './../interface';
import { Renderer } from './renderer';

type CreatedShape = { id: string; width?: number; height?: number; appearance: Appearance };

export module RendererService {
    const REGISTERED_RENDERER: { [id: string]: Renderer } = {};

    export function all() {
        return Object.entries(REGISTERED_RENDERER);
    }

    export function get(id: string) {
        return REGISTERED_RENDERER[id];
    }

    export function addRenderer(renderer: Renderer) {
        REGISTERED_RENDERER[renderer.identifier()] = renderer;
    }

    export function createShapes(sources: ReadonlyArray<ShapeSource>): CreatedShape[] {
        const result: CreatedShape[] = [];

        for (const source of sources) {
            for (const [id, renderer] of all()) {
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
