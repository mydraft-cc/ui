import { Vec2 } from '@app/core';

import {
    Configurable,
    Renderer,
    RendererService
} from '@app/wireframes/model';

class MockupRenderer implements Renderer {
    public previewOffset() { return Vec2.ZERO; }

    public defaultAppearance() { return {}; }

    public identifier(): string { return 'identifier'; }

    public showInGallery(): boolean { return false; }

    public createDefaultShape(): any { return null; }

    public createProperties(): Configurable[] { return []; }

    public setContext(context: any) { return this; }

    public render(shape: any): any { return null; }
}

describe('RendererService', () => {
    it('should instantiate', () => {
        const rendererService = new RendererService();

        expect(rendererService).toBeDefined();
    });

    it('should register renderer', () => {
        const rendererService = new RendererService();
        const renderer = new MockupRenderer();

        rendererService.addRendererById('btn', renderer);

        expect(rendererService.registeredRenderers['btn']).toBe(renderer);
    });

    it('should register renderer with identifier', () => {
        const rendererService = new RendererService();
        const renderer = new MockupRenderer();

        rendererService.addRenderer(renderer);

        expect(rendererService.registeredRenderers['identifier']).toBe(renderer);
    });
});
