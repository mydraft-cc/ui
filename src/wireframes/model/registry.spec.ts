/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { PluginRegistry } from '@app/wireframes/model';

describe('PluginRegistry', () => {
    it('should register renderer with identifier', () => {
        const plugin: any = 42;

        PluginRegistry.addPlugin(plugin);

        expect(PluginRegistry.get('identifier')).toBe(plugin);
    });
});
