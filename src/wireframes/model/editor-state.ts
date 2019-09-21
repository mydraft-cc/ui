import {
    ImmutableMap,
    Record,
    Vec2
} from '@app/core';

import { Diagram } from './diagram';
import { EditorStateInStore } from './editor-state';
import { UndoableState } from './undoable-state';

type DiagramMap = ImmutableMap<Diagram>;

type EditorProps = { selectedDiagramId: string | null, diagrams: DiagramMap, size: Vec2 };

const DEFAULT_SIZE = new Vec2(1000, 1000);

export class EditorState extends Record<EditorProps> {
    public get diagrams() {
        return this.get('diagrams');
    }

    public get selectedDiagramId() {
        return this.get('selectedDiagramId');
    }

    public get size() {
        return this.get('size') || Vec2.ZERO;
    }

    public static empty(): EditorState {
        return new EditorState({ diagrams: ImmutableMap.empty(), size: DEFAULT_SIZE });
    }

    public changeSize(size: Vec2) {
        return this.set('size', size);
    }

    public addDiagram(diagram: Diagram) {
        return this.mutate(d => d.set(diagram.id, diagram), diagram.id);
    }

    public removeDiagram(diagramId: string) {
        return this.mutate(d => d.remove(diagramId), diagramId === this.selectedDiagramId ? null : this.selectedDiagramId);
    }

    public updateDiagram(diagramId: string, updater: (value: Diagram) => Diagram) {
        return this.mutate(d => d.update(diagramId, updater), this.selectedDiagramId);
    }

    public selectDiagram(diagramId: string | null) {
        if (!this.diagrams.get(diagramId)) {
            return this;
        }

        return this.mutate(m => m, diagramId);
    }

    private mutate(update: (diagrams: DiagramMap) => DiagramMap, selectedDiagramId: string | null): EditorState {
        return this.merge({ diagrams: update(this.diagrams), selectedDiagramId });
    }
}

export interface EditorStateInStore {
    editor: UndoableState<EditorState>;
}