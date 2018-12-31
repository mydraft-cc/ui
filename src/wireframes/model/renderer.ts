import { Vec2 } from '@app/core';

import { DiagramShape } from './diagram-shape';

export interface Renderer {
    identifier(): string;

    defaultAppearance(): { [key: string]: any };

    previewOffset(): Vec2;

    showInGallery(): boolean;

    createDefaultShape(id: string): DiagramShape;

    setContext(context: any): Renderer;

    render(shape: DiagramShape, options?: { debug?: boolean, noOpacity?: boolean, noTransform?: boolean }): any;
}