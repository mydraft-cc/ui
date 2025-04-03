/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, ImmutableList, ImmutableMap, MathHelper, Record, Vec2 } from '@app/core/utils';
import { Diagram, DiagramTheme } from './diagram';
import { DiagramItem } from './diagram-item';
import { UndoableState } from './undoable-state';

type Diagrams = ImmutableMap<Diagram>;
type DiagramIds = ImmutableList<string>;

type Props = {
    // The id of the selected diagram.
    selectedDiagramId?: string | null;

    // The actual diagrams.
    diagrams: Diagrams;

    // The list of ordered diagram ids.
    diagramIds: DiagramIds;

    // The size of all diagrams.
    size: Vec2;

    // The id of the state.
    id: string;
};

export type InitialEditorProps = {
    // The actual diagrams.
    diagrams?: { [id: string]: Diagram } | ImmutableMap<Diagram>;

    // The list of ordered diagram ids.
    diagramIds?: ReadonlyArray<string> | DiagramIds;

    // The size of all diagrams.
    size?: Vec2;
};

export class EditorState extends Record<Props> {
    public get id() {
        return this.get('id');
    }

    public get selectedDiagramId() {
        return this.get('selectedDiagramId');
    }

    public get diagrams() {
        return this.get('diagrams');
    }

    public get diagramIds() {
        return this.get('diagramIds');
    }

    public get size() {
        return this.get('size');
    }

    public get selectedDiagram(): Diagram | null {
        const diagramId = this.selectedDiagramId;
        return diagramId ? this.diagrams.get(diagramId) || null : null;
    }

    public get orderedDiagrams(): ReadonlyArray<Diagram> {
        return this.findDiagrams(this.diagramIds.values);
    }

    public static create(setup: InitialEditorProps = {}): EditorState {
        const { diagrams, diagramIds, size } = setup;

        const props: Props = {
            id: MathHelper.guid(),
            diagrams: ImmutableMap.of(diagrams),
            diagramIds: ImmutableList.of(diagramIds),
            size: size || new Vec2(1000, 1000),
        };

        return new EditorState(props);
    }

    public findDiagrams(ids: ReadonlyArray<string>) {
        const result: Diagram[] = [];

        for (const id of ids) {
            const item = this.diagrams.get(id);

            if (item) {
                result.push(item);
            }
        }
        
        return result;
    }

    public changeSize(size: Vec2) {
        return this.set('size', size);
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

    public selectDiagram(diagramId: string | null | undefined) {
        if (!this.diagrams.get(diagramId!)) {
            return this;
        }

        return this.set('selectedDiagramId', diagramId);
    }

    public removeDiagram(diagramId: string) {
        return this.merge({
            diagrams: this.diagrams.remove(diagramId),
            diagramIds: this.diagramIds.remove(diagramId),
            selectedDiagramId: this.selectedDiagramId === diagramId ? null : this.selectedDiagramId,
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

    // Theme helper methods
    public getDiagramTheme(diagramId: string): DiagramTheme | null {
        const diagram = this.diagrams.get(diagramId);
        return diagram?.theme || null;
    }

    public getEffectiveTheme(diagramId: string): DiagramTheme {
        const diagram = this.diagrams.get(diagramId);
        return diagram?.getThemeSettings() || Diagram.createDefaultTheme();
    }

    public getEffectiveBackgroundColor(diagramId: string): Color | null {
        const diagram = this.diagrams.get(diagramId);
        return diagram?.getBackgroundColor() || null;
    }

    public getEffectiveDesignTheme(diagramId: string): 'light' | 'dark' {
        return this.getDiagramTheme(diagramId)?.designTheme || 'light';
    }

    public changeColors(oldColor: Color, newColor: Color): EditorState {
        const selectedDiagramId = this.selectedDiagramId;
        if (!selectedDiagramId) {
            return this;
        }

        return this.updateDiagram(selectedDiagramId, diagram => {
            let updatedDiagram = diagram;

            // Check and update background color
            if (diagram.theme?.backgroundColor && diagram.theme.backgroundColor.eq(oldColor)) {
                updatedDiagram = updatedDiagram.setBackgroundColor(newColor);
            }

            // Check and update theme settings colors
            const themeSettings = diagram.theme?.themeSettings;
            if (themeSettings) {
                const updatedSettings = { ...themeSettings };
                let settingsChanged = false;

                if (themeSettings.borderColor.eq(oldColor)) {
                    updatedSettings.borderColor = newColor;
                    settingsChanged = true;
                }

                if (themeSettings.gridColor.eq(oldColor)) {
                    updatedSettings.gridColor = newColor;
                    settingsChanged = true;
                }

                if (settingsChanged) {
                    updatedDiagram = updatedDiagram.updateThemeSettings({
                        themeSettings: updatedSettings
                    });
                }
            }

            // Check and update shape appearances
            const items = diagram.items;
            const itemIds = items.keys;
            const updatedItems = new Map<string, DiagramItem>();

            for (const itemId of itemIds) {
                const item = items.get(itemId);
                if (!item) continue;

                const appearance = item.appearance;
                if (!appearance) {
                    updatedItems.set(itemId, item);
                    continue;
                }

                let appearanceChanged = false;
                const updatedAppearanceMap = new Map<string, any>();

                // Check all color properties in appearance
                for (const [key, value] of appearance.entries) {
                    if (key.endsWith('_COLOR') && value instanceof Color && value.eq(oldColor)) {
                        updatedAppearanceMap.set(key, newColor);
                        appearanceChanged = true;
                    } else {
                        updatedAppearanceMap.set(key, value);
                    }
                }

                if (appearanceChanged) {
                    updatedItems.set(itemId, item.replaceAppearance(ImmutableMap.of(Object.fromEntries(updatedAppearanceMap))));
                } else {
                    updatedItems.set(itemId, item);
                }
            }

            if (updatedItems.size > 0) {
                updatedDiagram = updatedDiagram.updateItems(
                    Array.from(updatedItems.keys()),
                    item => updatedItems.get(item.id) || item
                );
            }

            return updatedDiagram;
        });
    }
}

export interface EditorStateInStore {
    editor: UndoableState<EditorState>;
}
