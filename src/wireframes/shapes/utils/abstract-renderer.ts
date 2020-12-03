/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ShapeRenderer } from '@app/wireframes/interface';

export interface AbstractRenderer extends ShapeRenderer {
    setTransform(element: any, to: any): AbstractRenderer;
}
