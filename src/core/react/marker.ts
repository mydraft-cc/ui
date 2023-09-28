/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import markerSDK, { MarkerSdk } from '@marker.io/browser';
import * as React from 'react';

export function useMarker() {
    const [widget, setWidget] = React.useState<MarkerSdk>();

    React.useEffect(() => {
        async function loadMarker() {
            const widget = await markerSDK.loadWidget({
                project: '63a086196d73a2e6dfbfbb40',
            });

            widget.hide();
        
            setWidget(widget);
        }

        loadMarker();
    }, []);

    const open = React.useCallback(() => {
        widget?.capture('advanced');
    }, [widget]);

    return { open };
}