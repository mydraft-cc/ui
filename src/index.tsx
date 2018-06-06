// Paperjs for canvas rendering.
require('paper/dist/paper-full');

// Area text extension for paper.js
require('./libs/paper-area-text');

// Import our stylesheets
import './index.scss';

import { createBrowserHistory } from 'history';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Route, Router } from 'react-router';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import { applyMiddleware, combineReducers, compose, createStore, Reducer } from 'redux';
import thunk from 'redux-thunk';

const history = createBrowserHistory();

import { Provider } from 'react-redux';

import { MathHelper, UserReport, Vec2 } from '@app/core';

import * as Reducers from '@app/wireframes/model/actions';

import {
    addDiagram,
    createInitialAssetsState,
    createInitialLoadingState,
    createInitialUIState,
    Diagram,
    EditorState,
    SELECT_DIAGRAM,
    SELECT_ITEMS,
    Serializer,
    undoable
} from '@app/wireframes/model';

import { UserMessageContainer } from '@app/wireframes/components';

import { SerializerContext } from '@app/context';
import { registerRenderers } from '@app/wireframes/shapes';

const rendererService = registerRenderers();

let initialAction = addDiagram();
let initialDiagram = Diagram.empty(initialAction.diagramId);

if (process.env.NODE_ENV !== 'production') {
    let index = 0;

    for (let identifier in rendererService.registeredRenderers) {
        if (rendererService.registeredRenderers.hasOwnProperty(identifier)) {
            const renderer = rendererService.registeredRenderers[identifier];

            if (renderer.showInGallery()) {
                const x = 150 + Math.floor(index % 5) * 200;
                const y = 150 + Math.floor(index / 5) * 200;

                initialDiagram = initialDiagram.addVisual(renderer.createDefaultShape(MathHelper.guid()).transformWith(t => t.moveBy(new Vec2(x, y))));

                index++;
            }
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

const editorReducer: Reducer<EditorState> = (state: EditorState, action: any) => {
    for (const nested of reducers) {
        const newState = nested(state, action);

        if (newState !== state) {
            return newState;
        }
    }

    return state;
};

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const store = createStore(
    Reducers.rootLoading(
        combineReducers({
            assets: Reducers.assets(createInitialAssetsState(rendererService)),
            loading: Reducers.loading(createInitialLoadingState()),
            routing: routerReducer,
            editor:
                undoable(editorReducer,
                    EditorState.empty().addDiagram(initialDiagram),
                    [
                        SELECT_DIAGRAM,
                        SELECT_ITEMS
                    ],
                    initialAction
                ),
            ui: Reducers.ui(createInitialUIState())
    }), editorReducer),
    composeEnhancers(applyMiddleware(thunk, routerMiddleware(history)))
);

import { AppContainer } from './App';

const Root = (
    <SerializerContext.Provider value={serializer}>
        <Provider store={store}>
            <Router history={history}>
                <Route path='/:token?' render={props => (
                    <>
                        <AppContainer token={props.match.params.token} rendererService={rendererService} />
                        <UserMessageContainer />
                        <UserReport />
                    </>
                )} />
            </Router>
        </Provider>
    </SerializerContext.Provider>
);

ReactDOM.render(Root, document.getElementById('root') as HTMLElement);
