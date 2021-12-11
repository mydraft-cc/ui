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

type EditorProps = {
    // The id of the selected diagram.
    selectedDiagramId?: string | null;

    // The actual diagrams.
    diagrams?: Diagrams;

    // The list of ordered items.
    diagramIds?: DiagramIds;

    // The size of all diagrams.
    size?: Vec2;

    // The color for all diagrams.
    color?: Color;
};

const DEFAULT_SIZE = new Vec2(1000, 1000);
const DEFAULT_COLOR = Color.WHITE;

export class EditorState extends Record<EditorProps> {
    public get selectedDiagramId() {
        return this.get('selectedDiagramId');
    }

    public get diagrams() {
        return this.get('diagrams') || ImmutableMap.empty();
    }

    public get diagramIds() {
        return this.get('diagramIds') || ImmutableList.empty();
    }

    public get color() {
        return this.get('color') || DEFAULT_COLOR;
    }

    public get size() {
        return this.get('size') || DEFAULT_SIZE;
    }

    public get orderedDiagrams(): ReadonlyArray<Diagram> {
        return this.diagramIds.values.map(x => this.diagrams.get(x));
    }

    public static empty(): EditorState {
        return new EditorState();
    }

    public changeSize(size: Vec2) {
        return this.set('size', size);
    }

    public changeColor(color: Color | undefined) {
        return this.set('color', color);
    }

    public addDiagram(diagram: Diagram) {
        return this.mutate(
            d => d.set(diagram.id, diagram),
            d => d.add(diagram.id),
            diagram.id);
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
