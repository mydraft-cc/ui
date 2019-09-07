import { Map, Record } from 'immutable';

import { MathHelper, Vec2 } from '@app/core';

import { Diagram } from './diagram';
import { EditorStateInStore } from './editor-state';
import { UndoableState } from './undoable-state';

type DiagramMap = Map<string, Diagram>;

type EditorProps = { selectedDiagramId?: string | null, diagrams: DiagramMap, size: Vec2 };

export class EditorState extends Record<EditorProps>({ diagrams: Map(), size: new Vec2(1200, 1000) }) {
    public static empty(id = MathHelper.guid()): EditorState {
        return new EditorState().addDiagram(Diagram.empty(id));
    }

    public addDiagram(diagram: Diagram) {
        return this.clone(d => d.set(diagram.id, diagram), diagram.id);
    }

    public removeDiagram(diagramId: string) {
        return this.clone(d => d.remove(diagramId), diagramId === this.selectedDiagramId ? null : this.selectedDiagramId);
    }

    public updateDiagram(diagramId: string, updater: (value: Diagram) => Diagram) {
        return this.clone(d => d.update(diagramId, updater), this.selectedDiagramId);
    }

    public selectDiagram(diagramId: string | null) {
        if (diagramId) {
            const diagram = this.diagrams.get(diagramId);

            if (!diagram) {
                return this;
            }
        }

        return this.clone(m => m, diagramId);
    }

    private clone(update: (diagrams: DiagramMap) => DiagramMap, selectedDiagramId: string | null): EditorState {
        return this.withMutations(m => m.set('diagrams', update(this.diagrams)).set('selectedDiagramId', selectedDiagramId));
    }
}

export interface EditorStateInStore {
    editor: UndoableState<EditorState>;
}