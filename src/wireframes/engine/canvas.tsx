/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { ViewBox } from '@app/core';
import { Engine } from './interface';

export interface CanvasProps<T = Engine> {
    // The optional viewbox.
    viewBox?: ViewBox;

    // The class name.
    className?: string;

    // The CSS properties.
    style?: React.CSSProperties;

    // The callback when the canvas has been initialized.
    onInit: (engine: T) => any;
}