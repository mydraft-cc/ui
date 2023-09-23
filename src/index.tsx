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
import { createYjsReduxBinder, YjsReduxBinderProvider } from 'yjs-redux';
import { Color, ImmutableList, ImmutableMap, Rect2, Rotation, Vec2 } from '@app/core';
import { ColorResolver, ImmutableListResolver, ImmutableMapResolver, MinSizeConstraintResolver, RecordResolver, Rect2Resolver, RotationResolver, SizeConstraintResolver, TextHeightConstraintResolver, TransformResolver, Vec2Resolver } from '@app/wireframes/collaboration';
import { CollaborationProvider } from '@app/wireframes/collaboration/components/Provider';
import { createInitialAssetsState, createInitialLoadingState, createInitialUIState, Diagram, DiagramItem, EditorState, MinSizeConstraint, SizeConstraint, TextHeightConstraint, Transform } from '@app/wireframes/model';
import * as Reducers from '@app/wireframes/model/actions';
import { createClassReducer } from '@app/wireframes/model/actions/utils';
import { registerRenderers } from '@app/wireframes/shapes';
import { TextSizeConstraint, TextSizeConstraintResolver } from '@app/wireframes/shapes/utils/text-size-contraint';
import { user } from '@app/wireframes/user';
import { App } from './App';
import { registerServiceWorker } from './registerServiceWorker';
import { SVGRenderer2 } from './wireframes/shapes/utils/svg-renderer2';
import './index.scss';

registerRenderers();

const editorState = EditorState.create();

const editorReducer = createClassReducer(editorState, builder => {
    Reducers.buildAlignment(builder);
    Reducers.buildAppearance(builder);
    Reducers.buildDiagrams(builder, user.id);
    Reducers.buildGrouping(builder, user.id);
    Reducers.buildItems(builder, user.id);
    Reducers.buildOrdering(builder);
});

const binder = createYjsReduxBinder({
    typeResolvers: {
        [Diagram.TYPE_NAME]: new RecordResolver(Diagram.create),
        [DiagramItem.TYPE_NAME_GROUP]: new RecordResolver(DiagramItem.createGroup),
        [DiagramItem.TYPE_NAME_SHAPE]: new RecordResolver(DiagramItem.createShape),
        [EditorState.TYPE_NAME]: new RecordResolver(EditorState.create),
        [ImmutableList.TYPE_NAME]: new ImmutableListResolver(),
        [ImmutableMap.TYPE_NAME]: new ImmutableMapResolver(),
    },
    valueResolvers: {
        [Color.TYPE_NAME]: new ColorResolver(),
        [MinSizeConstraint.TYPE_NAME]: new MinSizeConstraintResolver(),
        [Rect2.TYPE_NAME]: new Rect2Resolver(),
        [Rotation.TYPE_NAME]: new RotationResolver(),
        [SizeConstraint.TYPE_NAME]: new SizeConstraintResolver(),
        [TextHeightConstraint.TYPE_NAME]: new TextHeightConstraintResolver(),
        [TextSizeConstraint.TYPE_NAME]: new TextSizeConstraintResolver(SVGRenderer2.INSTANCE),
        [Transform.TYPE_NAME]: new TransformResolver(),
        [Vec2.TYPE_NAME]: new Vec2Resolver(),
    },
    syncAlways: false,
});

const history = createBrowserHistory();

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const store = createStore(
    binder.enhanceReducer(
        combineReducers({
            assets: Reducers.assets(createInitialAssetsState()),
            editor: Reducers.rootLoading(editorReducer, user.id),
            loading: Reducers.loading(createInitialLoadingState()),
            router: connectRouter(history),
            ui: Reducers.ui(createInitialUIState()),
        }),
    ),
    composeEnhancers(
        applyMiddleware(
            thunk,
            routerMiddleware(history),
            Reducers.toastMiddleware(),
            Reducers.loadingMiddleware(),
            binder.middleware,
        ),
    ),
);


const Root = () => {
    return (
        <DndProvider backend={HTML5Backend}>
            <Provider store={store}>
                <YjsReduxBinderProvider binder={binder}>
                    <CollaborationProvider>
                        <ConnectedRouter history={history}>
                            <Route path='/:token?' component={App} />
                        </ConnectedRouter>
                    </CollaborationProvider>
                </YjsReduxBinderProvider>
            </Provider>
        </DndProvider>
    );
};

registerServiceWorker(store);

ReactDOM.render(<Root />, document.getElementById('root-layout') as HTMLElement);
