import { Vec2 } from '@app/core';

import { DiagramShape } from '@app/wireframes/model';

export interface Renderer {
    identifier(): string;

    previewOffset(): Vec2;

    showInGallery(): boolean;

    createDefaultShape(id: string): DiagramShape;

    setContext(context: any): void;

    render(shape: DiagramShape, showDebugMarkers: boolean): any;
}