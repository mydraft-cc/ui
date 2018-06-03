require('paper/dist/paper-full');

// Area text extension for paper.js
require('./libs/paper-area-text');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore, Reducer } from 'redux';

import { MathHelper, Vec2 } from '@app/core';

import * as Reducers from '@app/wireframes/model/actions';

import {
    createInitialAssetsState,
    createInitialUIState,
    Diagram,
    EditorState,
    SELECT_DIAGRAM,
    SELECT_ITEMS,
    Serializer,
    undoable
} from '@app/wireframes/model';

import { SerializerContext } from '@app/context';
import { registerRenderers } from '@app/wireframes/shapes';

const rendererService = registerRenderers();

let diagram = Diagram.empty();
let index = 0;

for (let identifier in rendererService.registeredRenderers) {
    if (rendererService.registeredRenderers.hasOwnProperty(identifier)) {
        const renderer = rendererService.registeredRenderers[identifier];

        if (renderer.showInGallery()) {
            const x = 150 + Math.floor(index % 5) * 200;
            const y = 150 + Math.floor(index / 5) * 200;

            diagram = diagram.addVisual(renderer.createDefaultShape(MathHelper.guid()).transformWith(t => t.moveBy(new Vec2(x, y))));

            index++;
        }
    }
}

const serializer = new Serializer(rendererService);

const reducers: Reducer<EditorState>[] = [
    Reducers.alignment(),
    Reducers.appearance(),
    Reducers.items(rendererService, serializer),
    Reducers.diagrams(),
    Reducers.grouping(),
    Reducers.ordering()
];

const reducer: Reducer<EditorState> = (state: EditorState, action: any) => {
    for (const nested of reducers) {
        const newState = nested(state, action);

        if (newState !== state) {
            return newState;
        }
    }

    return state;
};

const store = createStore(
    combineReducers({
        assets: Reducers.assets(createInitialAssetsState(rendererService)),
        editor:
            undoable(reducer,
                20,
                EditorState.empty()
                    .addDiagram(diagram).selectDiagram(diagram.id), [
                SELECT_DIAGRAM,
                SELECT_ITEMS
            ]),
        ui: Reducers.ui(createInitialUIState())
    }),
    window['__REDUX_DEVTOOLS_EXTENSION__'] && window['__REDUX_DEVTOOLS_EXTENSION__']()
);

import { AppContainer } from './App';

import './index.scss';

const Root = (
    <SerializerContext.Provider value={serializer}>
        <Provider store={store}>
            <AppContainer rendererService={rendererService} />
        </Provider>
    </SerializerContext.Provider>
);

ReactDOM.render(Root, document.getElementById('root') as HTMLElement);
