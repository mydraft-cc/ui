/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Types } from '@app/core';
import { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { Action, Reducer } from 'redux';
import { Diagram, DiagramItem } from './../internal';

export type DiagramRef = string | Diagram;
export type ItemRef = string | DiagramItem;
export type ItemsRef = ItemRef[];

interface DiagramAction {
    readonly diagramId: string;
}

interface ItemsAction extends DiagramAction {
    readonly itemIds: ReadonlyArray<string>;
}

export function createItemsAction<T extends {}>(diagram: DiagramRef, items: ItemsRef, action?: T): T & Action & ItemsAction {
    const result: any = createDiagramAction(diagram, action);

    result.itemIds = [];

    for (const itemOrId of items) {
        if (Types.isString(itemOrId)) {
            result.itemIds.push(itemOrId);
        } else {
            result.itemIds.push(itemOrId.id);
        }
    }

    return result;
}

export function createDiagramAction<T extends {}>(diagram: DiagramRef, action?: T): T & DiagramAction {
    const result: any = {};

    if (Types.is(diagram, Diagram)) {
        result.diagramId = diagram.id;
    } else {
        result.diagramId = diagram;
    }

    if (action) {
        Object.assign(result, action);
    }

    return result;
}

export function createClassReducer<S>(initialState: S, builderCallback: (builder: ActionReducerMapBuilder<S>) => void): Reducer<S> {
    const builder = new Builder(initialState);

    builderCallback(builder);

    return builder.buildReducer();
}

class Builder<S> {
    private readonly reducers: { [name: string]: Reducer<S> } = {};
    private defaultReducer?: Reducer<S>;

    constructor(
        private readonly initialState: S,
    ) {
    }

    public addCase(action: any, method: any) {
        this.reducers[action.name] = method;

        return this;
    }

    public addDefaultCase(action: any) {
        this.defaultReducer = action;

        return this;
    }

    public addMatcher() {
        return this;
    }

    public buildReducer(): Reducer<S> {
        return (state: any, action: any) => {
            if (!state) {
                return this.initialState;
            }

            const handler = this.reducers[state];

            if (handler) {
                return handler(state, action);
            } else if (this.defaultReducer) {
                return this.defaultReducer(state, action);
            } else {
                return state;
            }
        };
    }
}
