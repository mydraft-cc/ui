

/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Canvas } from './Canvas';

const meta: Meta<typeof Canvas> = {
    component: Canvas,
    render: () => {
        return (
            <div style={{ height: '800px', border: '1px solid #e0e0e0', background: '#efefef' }}>
                <Canvas contentWidth={500} contentHeight={500} padding={10} onRender={viewBox =>
                    <div>
                        <div style={{ background: 'white', position: 'absolute', padding: '2px 4px' }}>
                            {JSON.stringify(viewBox)}
                        </div> 

                        <svg height='800' viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.maxX} ${viewBox.maxY}`}>
                            <g style={{ background: '#fff' }}>
                                <rect fill='#fff' width='500' height='500' />
                                <image xlinkHref='https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg' width='500' height='500'/>  
                            </g>    
                        </svg>
                    </div>
                } />
            </div>
        );
    },
};

export default meta;
type Story = StoryObj<typeof Canvas>;

export const Default: Story = {};
