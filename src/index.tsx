/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/indent */

import { ConnectedRouter, connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createInitialAssetsState, createInitialLoadingState, createInitialUIState, EditorState, selectDiagram, selectItems } from '@app/wireframes/model';
import * as Reducers from '@app/wireframes/model/actions';
import { registerRenderers } from '@app/wireframes/shapes';
import { App } from './App';
import { registerServiceWorker } from './registerServiceWorker';
import { createClassReducer } from './wireframes/model/actions/utils';
import './index.scss';

registerRenderers();

const editorState = EditorState.create();

const editorReducer = createClassReducer(editorState, builder => {
    Reducers.buildAlignment(builder);
    Reducers.buildAppearance(builder);
    Reducers.buildDiagrams(builder);
    Reducers.buildGrouping(builder);
    Reducers.buildItems(builder);
    Reducers.buildOrdering(builder);
});

const undoableReducer = Reducers.undoable(
    editorReducer,
    editorState, {
        actionMerger: Reducers.mergeAction,
        actionsToIgnore: [
            selectDiagram.name,
            selectItems.name,
        ],
    });

const history = createBrowserHistory();

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const store = createStore(
    combineReducers({
         assets: Reducers.assets(createInitialAssetsState()),
         editor: Reducers.rootLoading(undoableReducer, editorReducer),
        loading: Reducers.loading(createInitialLoadingState()),
         router: connectRouter(history),
             ui: Reducers.ui(createInitialUIState()),
    }),
    composeEnhancers(
        applyMiddleware(
            thunk,
            routerMiddleware(history),
            Reducers.toastMiddleware(),
            Reducers.loadingMiddleware(),
        ),
    ),
);

const Root = (
    <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <Route path='/:token?' component={App} />
            </ConnectedRouter>
        </Provider>
    </DndProvider>
);

registerServiceWorker(store);

ReactDOM.render(Root, document.getElementById('root-layout') as HTMLElement);
