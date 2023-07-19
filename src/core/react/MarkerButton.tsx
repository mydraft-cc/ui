/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SmileOutlined } from '@ant-design/icons';
import markerSDK, { MarkerSdk } from '@marker.io/browser';
import { Button } from 'antd';
import * as React from 'react';

export const MarkerButton = () => {
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
    
    return (
        <Button className='menu-item' onClick={() => widget?.capture('advanced')}>
            <SmileOutlined />
        </Button>
    );
};