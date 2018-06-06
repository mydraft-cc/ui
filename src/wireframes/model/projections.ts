import { DiagramItem, EditorStateInStore } from '@app/wireframes/model';

export const getSelection = (state: EditorStateInStore) => {
    const editor = state.editor.present;

    const diagram = editor.diagrams.get(editor.selectedDiagramId!)!;

    const selectedIds = diagram.selectedItemIds;
    const selectedItems = <DiagramItem[]>selectedIds.map(i => diagram.items.get(i));

    return { editor, diagram, items: selectedItems };
};