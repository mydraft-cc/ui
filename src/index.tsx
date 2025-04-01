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
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { registerServiceWorker } from './registerServiceWorker';
import './index.scss';
import { store } from './store';

const Root = (
    <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route path='/:token?' element={<App />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    </DndProvider>
);

registerServiceWorker(store);

const container = document.getElementById('root-layout');
if (container) {
    const root = createRoot(container);
    root.render(Root);
}
