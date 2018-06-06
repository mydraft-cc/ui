import * as React from 'react';

import { RendererService, Serializer } from '@appwireframes/model';

export const RendererContext = React.createContext<RendererService>(null!);

export const SerializerContext = React.createContext<Serializer>(null!);