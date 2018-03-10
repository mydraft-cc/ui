import { Popover, Button } from 'antd';
import * as React from 'react'

import './color-picker.css';

import { Color, ColorPalette } from '@app/core';

interface ColorPickerProps {
    // The selected color.
    color?: Color | string | null | undefined;

    // The color palette.
    palette?: ColorPalette;

    // Triggered when the color has changed.
    onChange?: (color: Color) => void;
}

interface ColorPickerState {
    visible: boolean;
}

export class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {
    constructor(props: ColorPickerProps) {
        super(props);

        this.state = { visible: false };
    }

    private show() {
        this.setState({ visible: true });
    }

    private selectColor(color: Color) {
        if (this.props.onChange) {
            this.props.onChange(color);
        }

        this.setState({ visible: false });
    }

    public render() {
        let selectedColor = Color.BLACK;

        if (this.props.color instanceof Color) {
            selectedColor = this.props.color;
        } else if (typeof this.props.color === 'string') {
            selectedColor = Color.fromString(this.props.color);
        }

        const selectedPalette = this.props.palette || ColorPalette.colors();

        const content = (
            <div>
                {selectedPalette.colors.map(c =>
                    <div className='color' key={c.toString()}>
                        <div className='color-inner' onChange={() => this.selectColor(c)} style={{background: c.toString()}}></div>
                    </div>
                )}
            </div>
        );

        return (
            <Popover overlayClassName='colors' content={content} title='Colors' visible={this.state.visible}>
                <Button onClick={() => this.show()}>
                    <div className='color'>
                        <div className='color-inner' style={{background: selectedColor.toString()}}></div>
                    </div>
                </Button>
            </Popover>
        );
    }
}