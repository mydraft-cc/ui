import {
    Diagram,
    DiagramItem,
    EditorStateInStore
} from '@app/wireframes/model';

export const getSelection = (state: EditorStateInStore) => {
    const editor = state.editor.present;

    let diagram: Diagram | undefined = undefined;
    let diagramItems: DiagramItem[] = [];

    if (editor.selectedDiagramId) {
        diagram = editor.diagrams.get(editor.selectedDiagramId);

        if (diagram) {
            diagramItems = <DiagramItem[]>diagram.selectedItemIds.map(i => diagram!.items.get(i));
        }
    }

    return { editor, diagram: diagram || null, items: diagramItems };
};