/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { RendererContext, SerializerContext } from '@app/context';
import { UserReport } from '@app/core';
import { createInitialAssetsState, createInitialLoadingState, createInitialUIState, EditorState, selectDiagram, selectItems, Serializer } from '@app/wireframes/model';
import * as Reducers from '@app/wireframes/model/actions';
import { registerRenderers } from '@app/wireframes/shapes';
import { createBrowserHistory } from 'history';
import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { ConnectedRouter, connectRouter } from 'connected-react-router';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { App } from './App';
import './index.scss';
import { registerServiceWorker } from './registerServiceWorker';
import { createClassReducer } from './wireframes/model/actions/utils';

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

const undoableReducer = Reducers.undoable(editorReducer,
    EditorState.empty(),
    [
        selectDiagram.name,
        selectItems.name,
    ],
);

const history = createBrowserHistory();

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const store = createStore(
    Reducers.rootLoading(
        combineReducers({
            assets: Reducers.assets(createInitialAssetsState(editorRenderers)),
            editor: undoableReducer,
            loading: Reducers.loading(createInitialLoadingState()),
            router: connectRouter(history),
            routing: routerReducer,
            ui: Reducers.ui(createInitialUIState()),
        }), undoableReducer, editorReducer),
    composeEnhancers(applyMiddleware(thunk, Reducers.toastMiddleware(), routerMiddleware(history), Reducers.itemsMiddleware(editorSerializer))),
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

registerServiceWorker();

ReactDOM.render(Root, document.getElementById('root') as HTMLElement);
