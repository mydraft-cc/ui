/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable no-console */

import { Store } from 'redux';
import { texts } from '@app/texts';
import { showToast } from '@app/wireframes/model';

export function registerServiceWorker(store: Store) {
    if (!import.meta.env.PROD) {
        return;
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const url = '/sw.js';

            navigator.serviceWorker.register(url)
                .then(registration => {
                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;

                        if (!installingWorker) {
                            return;
                        }

                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    store.dispatch(showToast(texts.common.newVersion));

                                    console.log('New content is available; please refresh.');
                                } else {
                                    console.log('Content is cached for offline use.');
                                }
                            }
                        };
                    };
                })
                .catch(error => {
                    console.error('Error during service worker registration:', error);
                });
        });
    }
}

export function unregister() {
    if (!import.meta.env.PROD) {
        return;
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.unregister();
        });
    }
}
