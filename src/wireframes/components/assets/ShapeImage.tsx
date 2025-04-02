/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { ShapeInfo } from '@app/wireframes/model';
import { ShapeRenderer } from '@app/wireframes/shapes/ShapeRenderer';
import { AppTheme } from '@app/wireframes/interface';

interface ShapeImageProps {
    // The shape data.
    shape: ShapeInfo;

    appTheme: AppTheme;
}

const DESIRED_WIDTH = 120;
const DESIRED_HEIGHT = 72;

export const ShapeImage = React.memo((props: ShapeImageProps) => {
    const { appTheme, shape } = props;

    return (
        <div className='asset-shape-image'>
            <ShapeRenderer
                appTheme={appTheme}
                desiredHeight={DESIRED_HEIGHT} 
                desiredWidth={DESIRED_WIDTH} 
                plugin={shape.plugin}
                usePreviewOffset
                usePreviewSize 
            />
        </div>
    );
});