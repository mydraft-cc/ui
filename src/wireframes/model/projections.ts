import { Diagram } from './diagram';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';
import { EditorStateInStore } from './editor-state';

export function getSelection (state: EditorStateInStore) {
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
}

export interface UniqueValue<TValue> {
    value?: TValue;

    empty: boolean;
}

type Comparer<TComparand> = (lhs: TComparand, rhs: TComparand) => boolean;

type Parser<TInput> = (value: any) => TInput | undefined;

const DEFAULT_COMPARER: Comparer<any> = (lhs, rhs) => lhs === rhs;
const DEFAULT_PARSER = (value: any) => value;

export function uniqueAppearance<T>(set: DiagramItemSet, key: string, parse?: Parser<T>, compare?: Comparer<T>): UniqueValue<T> {
    if (!set) {
        return { empty: true };
    }

    if (!compare) {
        compare = DEFAULT_COMPARER;
    }

    if (!parse) {
        parse = DEFAULT_PARSER;
    }

    let value: T | undefined = undefined;

    let hasValue = false;

    for (let visual of set!.allVisuals) {
        const appearance = visual.appearance.get(key);

        if (appearance) {
            hasValue = true;

            const parsed = parse(appearance);

            if (parsed && value && !compare(value, parsed)) {
                value = undefined;
            } else {
                value = parsed;
            }
        }
    }

    return { value, empty: !hasValue };
}