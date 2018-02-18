import { DiagramShape } from '@app/wireframes/model';

export interface Renderer {
    identifier(): string;

    showInGallery(): boolean;

    createDefaultShape(id: string): DiagramShape;

    render(shape: DiagramShape, showAdorners: boolean): any;
}