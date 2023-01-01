/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ShapePlugin, Size } from './../interface';
import { DiagramItem, InitialShapeProps } from './diagram-item';

type DefaultProps = Omit<Omit<InitialShapeProps, 'transform'>, 'id'> & { size: Size };

export interface Renderer {
    identifier(): string;

    plugin(): ShapePlugin;

    defaultAppearance(): { [key: string]: any };

    createDefaultShape(): DefaultProps;

    setContext(context: any): Renderer;

    render(shape: DiagramItem, existing: any, options?: { debug?: boolean; noOpacity?: boolean; noTransform?: boolean }): any;
}
