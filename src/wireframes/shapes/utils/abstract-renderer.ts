/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ShapeRenderer, ShapeRenderer2 } from '@app/wireframes/interface';

export interface AbstractRenderer extends ShapeRenderer {
    setTransform(element: any, to: any): AbstractRenderer;
}

export interface AbstractRenderer2 extends ShapeRenderer2 {
    setTransform(element: any, to: any): AbstractRenderer2;
}
