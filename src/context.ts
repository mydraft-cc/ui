import * as React from 'react';

import { RendererService, Serializer } from '@app/wireframes/model';

export const RendererContext = React.createContext<RendererService>(null!);

export const SerializerContext = React.createContext<Serializer>(null!);