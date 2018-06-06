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

import { UserReport } from '@app/core';

import * as Reducers from '@app/wireframes/model/actions';

import {
    createInitialAssetsState,
    createInitialLoadingState,
    createInitialUIState,
    EditorState,
    SELECT_DIAGRAM,
    SELECT_ITEMS,
    Serializer,
    undoable
} from '@app/wireframes/model';

import { UserMessageContainer } from '@app/wireframes/components';

import { RendererContext, SerializerContext } from '@app/context';
import { registerRenderers } from '@app/wireframes/shapes';

const rendererService = registerRenderers();

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

const undoableReducer = undoable(editorReducer,
    EditorState.empty(),
    [
        SELECT_DIAGRAM,
        SELECT_ITEMS
    ]
);

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const store = createStore(
    Reducers.rootLoading(
        combineReducers({
            assets: Reducers.assets(createInitialAssetsState(rendererService)),
            editor: undoableReducer,
            loading: Reducers.loading(createInitialLoadingState()),
            routing: routerReducer,
            ui: Reducers.ui(createInitialUIState())
    }), undoableReducer, editorReducer),
    composeEnhancers(applyMiddleware(thunk, routerMiddleware(history)))
);

import { AppContainer } from './app';

const Root = (
    <SerializerContext.Provider value={serializer}>
        <RendererContext.Provider value={rendererService}>
            <Provider store={store}>
                <Router history={history}>
                    <Route path='/:token?' render={props => (
                        <>
                            <AppContainer token={props.match.params.token} />
                            <UserMessageContainer />
                            <UserReport />
                        </>
                    )} />
                </Router>
            </Provider>
        </RendererContext.Provider>
    </SerializerContext.Provider>
);

ReactDOM.render(Root, document.getElementById('root') as HTMLElement);
