/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/indent */

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router';
import { App } from './App';
import { registerServiceWorker } from './registerServiceWorker';
import './index.scss';
import { history, store } from './store';

const Root = (
    <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
            <Router history={history}>
                <Route path='/:token?' component={App} />
            </Router>
        </Provider>
    </DndProvider>
);

registerServiceWorker(store);

const container = document.getElementById('root-layout');
if (container) { // Ensure container is not null
    const root = createRoot(container);
    root.render(Root);
}
