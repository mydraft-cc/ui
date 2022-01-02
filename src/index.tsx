/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { ConnectedRouter, connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { createInitialAssetsState, createInitialLoadingState, createInitialUIState, EditorState, selectDiagram, selectItems, Serializer } from '@app/wireframes/model';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { registerRenderers } from '@app/wireframes/shapes';
import { RendererContext, SerializerContext } from '@app/context';
import { Route } from 'react-router';
import { UserReport } from '@app/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Reducers from '@app/wireframes/model/actions';
import thunk from 'redux-thunk';
import { registerServiceWorker } from './registerServiceWorker';
import { createClassReducer, mergeAction } from './wireframes/model/actions/utils';
import { App } from './App';
import './index.scss';

const editorRenderers = registerRenderers();
const editorSerializer = new Serializer(editorRenderers);
const editorState = EditorState.empty();

const editorReducer = createClassReducer(editorState, builder => {
    Reducers.buildAlignment(builder);
    Reducers.buildAppearance(builder, editorRenderers);
    Reducers.buildItems(builder, editorRenderers, editorSerializer);
    Reducers.buildDiagrams(builder);
    Reducers.buildGrouping(builder);
    Reducers.buildOrdering(builder);
});

const undoableReducer = Reducers.undoable(
    editorReducer,
    EditorState.empty(), {
        actionMerger: mergeAction,
        actionsToIgnore: [
            selectDiagram.name,
            selectItems.name,
        ],
    });

const history = createBrowserHistory();

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const store = createStore(
    combineReducers({
        assets: Reducers.assets(createInitialAssetsState(editorRenderers)),
        editor: Reducers.rootLoading(undoableReducer, undoableReducer, editorReducer),
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
            Reducers.itemsMiddleware(editorSerializer),
        ),
    ),
);

const Root = (
    <DndProvider backend={HTML5Backend}>
        <SerializerContext.Provider value={editorSerializer}>
            <RendererContext.Provider value={editorRenderers}>
                <Provider store={store}>
                    <ConnectedRouter history={history}>
                        <Route path='/:token?' component={App} />
                    </ConnectedRouter>
                </Provider>
            </RendererContext.Provider>
        </SerializerContext.Provider>

        <UserReport />
    </DndProvider>
);

registerServiceWorker(store);

ReactDOM.render(Root, document.getElementById('root-layout') as HTMLElement);
