/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { PluginRegistry } from '@app/wireframes/model';

describe('PluginRegistry', () => {
    it('should register renderer with identifier', () => {
        const plugin = {
            identifier: () => 'MyPlugin',
        } as any;

        PluginRegistry.addPlugin(plugin);

        expect(PluginRegistry.get('MyPlugin')?.plugin).toBe(plugin);
    });

    it('should create shape with first plugin that accepts the source', () => {
        const created = { renderer: 'Image' } as any;

        PluginRegistry.addPlugin({ identifier: () => 'Rejecting', create: () => null } as any);
        PluginRegistry.addPlugin({ identifier: () => 'Accepting', create: () => created } as any);

        const shapes = PluginRegistry.createShapes([{ type: 'Url', url: 'https://example.com' } as any]);

        expect(shapes).toEqual([created]);
    });
});
