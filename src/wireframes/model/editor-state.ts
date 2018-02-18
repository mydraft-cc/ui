import { ImmutableIdMap, Vec2 } from '@app/core'

import { Diagram } from '@app/wireframes/model';

export class EditorState {
    constructor(
        public readonly diagrams: ImmutableIdMap<Diagram>,
        public readonly selectedDiagramId: string | null,
        public readonly size: Vec2
    ) {
        Object.freeze(this);
    }

    public static createInitial(): EditorState {
        return new EditorState(new ImmutableIdMap<Diagram>(), null, new Vec2(1000, 1000));
    }

    public addDiagram(diagram: Diagram): EditorState {
        return this.clone(this.diagrams.add(diagram), this.selectedDiagramId);
    }

    public removeDiagram(diagramId: string): EditorState {
        return this.clone(this.diagrams.remove(diagramId), diagramId === this.selectedDiagramId ? null : this.selectedDiagramId);
    }

    public updateDiagram(diagramId: string, updater: (value: Diagram) => Diagram): EditorState {
        return this.clone(this.diagrams.update(diagramId, updater), this.selectedDiagramId);
    }

    public moveDiagram(diagramId: string, position: number): EditorState {
        return this.clone(this.diagrams.moveTo([diagramId], position), this.selectedDiagramId);
    }

    public selectDiagram(diagramId: string | null): EditorState {
        if (diagramId) {
            const diagram = this.diagrams.get(diagramId);

            if (!diagram) {
                return this;
            }
        }

        return this.clone(this.diagrams, diagramId);
    }

    private clone(diagrams: ImmutableIdMap<Diagram>, selectedDiagramId: string | null): EditorState {
        if (diagrams !== this.diagrams || selectedDiagramId !== this.selectedDiagramId) {
            return new EditorState(diagrams, selectedDiagramId, this.size);
        } else {
            return this;
        }
    }
}