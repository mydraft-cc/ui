/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { SnapLine, SnapManager, SnapResult, Transform } from './../model';

export interface OverlayManager {
    // Renders the snap result.
    showSnapAdorners(snapResult: SnapResult): void;

    // Renders a vertical line.
    renderXLine(line: SnapLine): void;

    // Renders a horizontal line.
    renderYLine(line: SnapLine): void;

    // Renders a line next to a transform.
    showInfo(transform: Transform, text: string): void;

    // Hides all markers.
    reset(): void;
}

interface OverlayContextType {
    // The snap manager.
    snapManager: SnapManager;

    // Gets the overlay manager.
    overlayManager: OverlayManager;

    // Gets the element. 
    element?: HTMLElement | null;
}

const DEFAULT_VALUE: OverlayContextType = {
    snapManager: new SnapManager(),

    overlayManager: {
        showSnapAdorners() {
            return;
        },

        renderXLine() {
            return;
        },

        renderYLine() {
            return;
        },

        showInfo() {
            return;
        },

        reset() {
            return;
        },
    },
};

export const OverlayContext = React.createContext<OverlayContextType>(DEFAULT_VALUE);

export function useOverlayContext() {
    return React.useContext(OverlayContext);
}

export const OverlayContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <OverlayContext.Provider value={DEFAULT_VALUE}>
            {children}
        </OverlayContext.Provider>
    );
};