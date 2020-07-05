/*
 * Notifo.io
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { RendererService, Serializer } from '@app/wireframes/model';
import * as React from 'react';

export const RendererContext = React.createContext<RendererService>(null!);

export const SerializerContext = React.createContext<Serializer>(null!);
