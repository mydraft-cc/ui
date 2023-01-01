/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Configurable, Renderer, RendererService } from '@app/wireframes/model';

class MockupRenderer implements Renderer {
    public defaultAppearance() {
        return {};
    }

    public plugin() {
        return null!;
    }

    public identifier(): string {
        return 'identifier';
    }

    public showInGallery(): boolean {
        return false;
    }

    public createDefaultShape(): any {
        return null;
    }

    public createProperties(): Configurable[] {
        return [];
    }

    public setContext() {
        return this;
    }

    public render(): any {
        return null;
    }
}

describe('RendererService', () => {
    it('should register renderer with identifier', () => {
        const renderer = new MockupRenderer();

        RendererService.addRenderer(renderer);

        expect(RendererService.get('identifier')).toBe(renderer);
    });
});
