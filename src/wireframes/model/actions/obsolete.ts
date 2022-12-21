/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/no-loop-func */

import { AnyAction, createAction } from '@reduxjs/toolkit';
import { MathHelper } from '@app/core';
import { DefaultAppearance } from '@app/wireframes/interface';
import { addShape } from './items';
import { createDiagramAction, DiagramRef } from './utils';

/**
 * @deprecated Replaced with addShape
 */
export const addImage =
    createAction('items/addImage', (diagram: DiagramRef, source: string, x: number, y: number, w: number, h: number, shapeId?: string) => {
        return { payload: createDiagramAction(diagram, { shapeId: shapeId || MathHelper.nextId(), source, position: { x, y }, size: { w, h } }) };
    });

/**
 * @deprecated Replaced with addShape
 */
export const addIcon =
    createAction('items/addIcon', (diagram: DiagramRef, text: string, fontFamily: string, x: number, y: number, shapeId?: string) => {
        return { payload: createDiagramAction(diagram, { shapeId: shapeId || MathHelper.nextId(), text, fontFamily, position: { x, y } }) };
    });

/**
 * @deprecated Replaced with addShape
 */
export const addVisual =
    createAction('items/addVisual', (diagram: DiagramRef, renderer: string, x: number, y: number, appearance?: object, shapeId?: string, width?: number, height?: number) => {
        return { payload: createDiagramAction(diagram, { shapeId: shapeId || MathHelper.nextId(), renderer, position: { x, y }, appearance, width, height }) };
    });
    
const MAX_IMAGE_SIZE = 300;

export function migrateOldAction(action: AnyAction) {
    if (addVisual.match(action)) {
        const payload = action.payload;

        return { type: addShape.type, payload };
    } if (addIcon.match(action)) {
        const payload = action.payload;

        return addShape(payload.diagramId,
            'Icon',
            payload.position.x,
            payload.position.y,
            {
                [DefaultAppearance.TEXT]: payload.text,
                [DefaultAppearance.FONT_FAMILY]: payload.fontFamily,
            },
            payload.shapeId);
    } else if (addImage.match(action)) {
        const payload = action.payload;

        let w = payload.size.w;
        let h = payload.size.h;

        if (w > MAX_IMAGE_SIZE || h > MAX_IMAGE_SIZE) {
            const ratio = w / h;

            if (ratio > 1) {
                w = MAX_IMAGE_SIZE;
                h = MAX_IMAGE_SIZE / ratio;
            } else {
                w = MAX_IMAGE_SIZE * ratio;
                h = MAX_IMAGE_SIZE;
            }
        }

        return addShape(payload.diagramId,
            'Raster',
            payload.position.x,
            payload.position.y,
            {
                SOURCE: payload.source,
            },
            payload.shapeId,
            w,
            h);
    } else {
        return action;
    }
}