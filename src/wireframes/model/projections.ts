import {
    DiagramItem,
    EditorState,
    UndoableState
} from '@app/wireframes/model';

export const getSelection = (state: { editor: UndoableState<EditorState> }) => {
    const editor = state.editor.present;

    const diagram = editor.diagrams.get(editor.selectedDiagramId!)!;

    const selectedIds = diagram.selectedItemIds;
    const selectedItems = <DiagramItem[]>selectedIds.map(i => diagram.items.get(i));

    return { editor, diagram, items: selectedItems };
};