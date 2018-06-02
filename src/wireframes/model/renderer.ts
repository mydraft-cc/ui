import { DiagramShape } from '@app/wireframes/model';

export interface Renderer {
    identifier(): string;

    showInGallery(): boolean;

    createDefaultShape(id: string): DiagramShape;

    setContext(context: any): void;

    render(shape: DiagramShape, showDebugMarkers: boolean): any;
}