/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Vec2 } from '@app/core';
import { Configurable, Renderer, RendererService } from '@app/wireframes/model';

class MockupRenderer implements Renderer {
    public previewOffset() {
        return Vec2.ZERO;
    }

    public defaultAppearance() {
        return {};
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
    it('should instantiate', () => {
        const rendererService = new RendererService();

        expect(rendererService).toBeDefined();
    });

    it('should register renderer', () => {
        const rendererService = new RendererService();
        const rendererInstance = new MockupRenderer();

        rendererService.addRendererById('btn', rendererInstance);

        expect(rendererService.get('btn')).toBe(rendererInstance);
    });

    it('should register renderer with identifier', () => {
        const rendererService = new RendererService();
        const rendererInstance = new MockupRenderer();

        rendererService.addRenderer(rendererInstance);

        expect(rendererService.get('identifier')).toBe(rendererInstance);
    });
});
