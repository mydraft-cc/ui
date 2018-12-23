import { Renderer } from './renderer';

export class RendererService {
    public registeredRenderers: { [id: string]: Renderer } = {};

    public addRendererById(id: string, renderer: Renderer): RendererService {
        this.registeredRenderers[id] = renderer;

        return this;
    }

    public addRenderer(renderer: Renderer): RendererService {
        this.registeredRenderers[renderer.identifier()] = renderer;

        return this;
    }
}