
import { EditorState, UndoableState } from '@app/wireframes/model';

export const getSelection = (state: { editor: UndoableState<EditorState> }) => {
    const editor = state.editor.present;

    const diagram =
        editor.selectedDiagramId ?
        editor.diagrams.get(editor.selectedDiagramId) || null :
        null;

    const items =
        diagram ?
        diagram.selectedItemIds.map(i => diagram.items.get(i)).filter(i => !!i) :
        [];

    return { editor, diagram, items };
};