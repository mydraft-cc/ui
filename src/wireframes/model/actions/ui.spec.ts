/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { filterDiagrams, selectColorTab, selectTab, showToast, toggleLeftSidebar, toggleRightSidebar, toggleWebGL, ui, UIState } from '@app/wireframes/model';

describe('UIReducer', () => {
    const state: UIState = {} as any;

    const reducer = ui(state);

    it('should toogle left sidebar', () => {
        const state_1 = reducer(state, toggleLeftSidebar());

        expect(state_1.showLeftSidebar).toBeTruthy();
    });

    it('should toogle right sidebar', () => {
        const state_1 = reducer(state, toggleRightSidebar());

        expect(state_1.showRightSidebar).toBeTruthy();
    });

    it('should select color tab', () => {
        const state_1 = reducer(state, selectColorTab('Recent'));

        expect(state_1.selectedColorTab).toEqual('Recent');
    });

    it('should select tab', () => {
        const state_1 = reducer(state, selectTab('Items'));

        expect(state_1.selectedTab).toEqual('Items');
    });

    it('should set diagrams filter', () => {
        const state_1 = reducer(state, filterDiagrams('Filter'));

        expect(state_1.diagramsFilter).toEqual('Filter');
    });

    it('should do nothing for toast', () => {
        const state_1 = reducer(state, showToast('My Toast'));

        expect(state_1).toBe(state);
    });

    it('should toggle webGL', () => {
        const state_1 = reducer(state, toggleWebGL(true));

        expect(state_1.useWebGL).toBeTruthy();
    });
});