/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { assets, AssetsState, filterIcons, filterShapes, selectIcons } from '@app/wireframes/model';

describe('AssetsReducer', () => {
    const state: AssetsState = {} as any;

    const reducer = assets(state);

    it('should select icon set', () => {
        const state_1 = reducer(state, selectIcons('Material'));

        expect(state_1.iconSet).toEqual('Material');
    });

    it('should set icons filter', () => {
        const state_1 = reducer(state, filterIcons('Filter'));

        expect(state_1.iconsFilter).toEqual('Filter');
    });

    it('should set shapes filter', () => {
        const state_1 = reducer(state, filterShapes('Filter'));

        expect(state_1.shapesFilter).toEqual('Filter');
    });
});