/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, ImmutableList, ImmutableMap, MathHelper, Record, Vec2 } from '@app/core/utils';
import { Diagram } from './diagram';

type Diagrams = ImmutableMap<Diagram>;
type DiagramIds = ImmutableList<string>;

type Props = {
    // The id of the state.
    id: string;

    // The id of the selected diagram.
    selectedDiagramIds: ImmutableMap<string | null | undefined>;

    // The actual diagrams.
    diagrams: Diagrams;

    // The list of ordered diagram ids.
    diagramIds: DiagramIds;

    // The size of all diagrams.
    size: Vec2;

    // The color for all diagrams.
    color: Color;
};

export type InitialEditorProps = {
    // The unique id of the editor.
    id?: string;

    // The id of the selected diagram.
    selectedDiagramIds?: { [user: string]: string | null | undefined } | ImmutableMap<string | null | undefined>;

    // The actual diagrams.
    diagrams?: { [id: string]: Diagram } | ImmutableMap<Diagram>;

    // The list of ordered diagram ids.
    diagramIds?: ReadonlyArray<string> | DiagramIds;

    // The size of all diagrams.
    size?: Vec2;

    // The color for all diagrams.
    color?: Color;
};

export class EditorState extends Record<Props> {
    public static TYPE_NAME = 'EditorState';

    public get id() {
        return this.get('id');
    }

    public get selectedDiagramIds() {
        return this.get('selectedDiagramIds');
    }

    public get diagrams() {
        return this.get('diagrams');
    }

    public get diagramIds() {
        return this.get('diagramIds');
    }

    public get color() {
        return this.get('color');
    }

    public get size() {
        return this.get('size');
    }

    public get orderedDiagrams(): ReadonlyArray<Diagram> {
        return this.diagramIds.values.map(x => this.diagrams.get(x)).filter(x => !!x) as Diagram[];
    }

    public static create(setup: InitialEditorProps = {}): EditorState {
        const { color, diagrams, diagramIds, id, selectedDiagramIds, size } = setup;

        const props: Props = {
            id: id || MathHelper.guid(),
            color: color || Color.WHITE,
            diagrams: ImmutableMap.of(diagrams),
            diagramIds: ImmutableList.of(diagramIds),
            selectedDiagramIds: ImmutableMap.of(selectedDiagramIds),
            size: size || new Vec2(1000, 1000),
        };

        return new EditorState(props, EditorState.TYPE_NAME);
    }

    public changeSize(size: Vec2) {
        return this.set('size', size);
    }

    public changeColor(color: Color) {
        return this.set('color', color);
    }

    public moveDiagram(diagramId: string, index: number) {
        return this.set('diagramIds', this.diagramIds.moveTo([diagramId], index));
    }

    public updateDiagram(diagramId: string, updater: (value: Diagram) => Diagram) {
        return this.set('diagrams', this.diagrams.update(diagramId, updater));
    }

    public updateAllDiagrams(updater: (value: Diagram) => Diagram) {
        return this.set('diagrams', this.diagrams.updateAll(updater));
    }

    public selectDiagram(diagramId: string | null | undefined, userId: string) {
        if (!this.diagrams.get(diagramId!)) {
            return this;
        }

        return this.set('selectedDiagramIds', this.selectedDiagramIds.set(userId, diagramId));
    }

    public removeDiagram(diagramId: string) {
        let selectedDiagramIds = this.selectedDiagramIds;

        for (const [key, value] of selectedDiagramIds.entries) {
            if (value === diagramId) {
                selectedDiagramIds = selectedDiagramIds.remove(key);
            }
        }

        return this.merge({
            diagrams: this.diagrams.remove(diagramId),
            diagramIds: this.diagramIds.remove(diagramId),
            selectedDiagramIds,
        });
    }

    public addDiagram(diagram: Diagram) {
        if (!diagram || this.diagrams.get(diagram.id)) {
            return this;
        }

        return this.merge({
            diagrams: this.diagrams.set(diagram.id, diagram),
            diagramIds: this.diagramIds.add(diagram.id),
        });
    }
}

export interface EditorStateInStore {
    editor: EditorState;
}
