/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SmileOutlined } from '@ant-design/icons';
import markerSDK, { MarkerSdk } from '@marker.io/browser';
import { Button, ButtonProps } from 'antd';
import * as React from 'react';

// Custom hook to manage marker SDK
export const useMarkerSDK = () => {
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

    const captureMarker = React.useCallback(() => {
        widget?.capture('advanced');
    }, [widget]);

    return { captureMarker };
};

export interface MarkerButtonProps extends ButtonProps {
    // Any additional props specific to MarkerButton
    children?: React.ReactNode;
}

export const MarkerButton = ({ children, ...buttonProps }: MarkerButtonProps) => {
    const { captureMarker } = useMarkerSDK();
    
    return (
        <Button 
            className='menu-item' 
            onClick={captureMarker} 
            icon={!children && <SmileOutlined style={{ fontSize: '24px' }} />}
            {...buttonProps}
        >
            {children}
        </Button>
    );
};