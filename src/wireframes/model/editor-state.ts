/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, ImmutableList, ImmutableMap, Record, Vec2 } from '@app/core';
import { Diagram } from './diagram';
import { UndoableState } from './undoable-state';

type Diagrams = ImmutableMap<Diagram>;
type DiagramIds = ImmutableList<string>;

type Props = {
    // The id of the selected diagram.
    selectedDiagramId?: string | null;

    // The actual diagrams.
    diagrams: Diagrams;

    // The list of ordered items.
    diagramIds: DiagramIds;

    // The size of all diagrams.
    size: Vec2;

    // The color for all diagrams.
    color: Color;
};

export class EditorState extends Record<Props> {
    public get selectedDiagramId() {
        return this.get('selectedDiagramId');
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
        return this.diagramIds.values.map(x => this.diagrams.get(x));
    }

    public static empty(): EditorState {
        const props: Props = {
            color: Color.WHITE,
            diagrams: ImmutableMap.empty(),
            diagramIds: ImmutableList.empty(),
            size: new Vec2(1000, 1000),
        };

        return new EditorState(props);
    }

    public changeSize(size: Vec2) {
        return this.set('size', size);
    }

    public changeColor(color: Color | undefined) {
        return this.set('color', color);
    }

    public addDiagram(diagram: Diagram) {
        if (!diagram || this.diagrams.get(diagram.id)) {
            return this;
        }

        return this.mutate(
            d => d.set(diagram.id, diagram),
            d => d.add(diagram.id),
            this.selectedDiagramId);
    }

    public removeDiagram(diagramId: string) {
        return this.mutate(
            d => d.remove(diagramId),
            d => d.remove(diagramId),
            diagramId === this.selectedDiagramId ? null : this.selectedDiagramId);
    }

    public moveDiagram(diagramId: string, index: number) {
        return this.mutate(
            d => d,
            d => d.moveTo([diagramId], index),
            this.selectedDiagramId);
    }

    public updateDiagram(diagramId: string, updater: (value: Diagram) => Diagram) {
        return this.mutate(
            d => d.update(diagramId, updater),
            d => d,
            this.selectedDiagramId);
    }

    public selectDiagram(diagramId: string | null) {
        if (!this.diagrams.get(diagramId)) {
            return this;
        }

        return this.set('selectedDiagramId', diagramId);
    }

    private mutate(update: (diagrams: Diagrams) => Diagrams, updateIds: (diagrams: DiagramIds) => DiagramIds, selectedDiagramId: string | null): EditorState {
        return this.merge({
            diagrams: update(this.diagrams),
            diagramIds: updateIds(this.diagramIds),
            selectedDiagramId,
        });
    }
}

export interface EditorStateInStore {
    editor: UndoableState<EditorState>;
}
