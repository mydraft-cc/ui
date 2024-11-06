/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { CreatedShape, ShapePlugin, ShapeSource, Size } from '@app/wireframes/interface';
import { InitialShapeProps } from './diagram-item';
import { DefaultConfigurableFactory, DefaultConstraintFactory } from './factories';

type DefaultProps = Omit<Omit<InitialShapeProps, 'transform'>, 'id'> & { size: Size };

export class Registration {
    constructor(
        public readonly plugin: ShapePlugin,
    ) {
    }

    public createDefaultShape(): DefaultProps {
        const appearance = this.plugin.defaultAppearance();
        const constraint = this.plugin.constraint?.(DefaultConstraintFactory.INSTANCE);
        const configurables = this.plugin.configurables?.(DefaultConfigurableFactory.INSTANCE);
        const renderer = this.plugin.identifier();
        const size = this.plugin.defaultSize();

        return { renderer, size, appearance, configurables, constraint };
    }
}

export module PluginRegistry {
    const REGISTRATIONS: { [id: string]: Registration } = {};

    export function all() {
        return Object.entries(REGISTRATIONS);
    }

    export function get(id: string): Registration | undefined {
        return REGISTRATIONS[id];
    }

    export function addPlugin(plugin: ShapePlugin) {
        REGISTRATIONS[plugin.identifier()] = new Registration(plugin);
    }

    export function createShapes(sources: ReadonlyArray<ShapeSource>): CreatedShape[] {
        const result: CreatedShape[] = [];

        for (const source of sources) {
            for (const [, renderer] of all()) {
                const plugin = renderer.plugin;

                if (plugin.create) {
                    const shape = plugin.create(source);

                    if (shape) {
                        result.push(shape);
                        break;
                    }
                }
            }
        }

        return result;
    }
}
