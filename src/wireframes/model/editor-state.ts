import { Map, Record } from 'immutable';

import { updateWhenFound, Vec2 } from '@app/core';

import { Diagram } from './diagram';
import { EditorStateInStore } from './editor-state';
import { UndoableState } from './undoable-state';

type DiagramMap = Map<string, Diagram>;

type EditorProps = { selectedDiagramId: string | null, diagrams: DiagramMap, size: Vec2 };

export class EditorState extends Record<EditorProps>({ selectedDiagramId: null, diagrams: Map(), size: new Vec2(1200, 1000) }) {
    public static empty(): EditorState {
        return new EditorState();
    }

    public addDiagram(diagram: Diagram) {
        return this.mutate(d => d.set(diagram.id, diagram), diagram.id);
    }

    public removeDiagram(diagramId: string) {
        return this.mutate(d => d.remove(diagramId), diagramId === this.selectedDiagramId ? null : this.selectedDiagramId);
    }

    public updateDiagram(diagramId: string, updater: (value: Diagram) => Diagram) {
        return this.mutate(d => updateWhenFound(d, diagramId, updater), this.selectedDiagramId);
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