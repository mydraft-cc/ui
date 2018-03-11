import * as React from 'react';
import { Button, Popover } from 'antd';

import './color-picker.scss';

import { Color, ColorPalette } from '@app/core';

interface ColorPickerProps {
    // The selected color.
    value?: Color | string | null | undefined;

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

    private toggle() {
        this.setState(s => { return { visible: !s.visible }; });
    }

    private selectColor(color: Color) {
        if (this.props.onChange) {
            this.props.onChange(color);
        }

        this.setState({ visible: false });
    }

    public render() {
        let selectedColor = Color.BLACK;

        if (this.props.value instanceof Color) {
            selectedColor = this.props.value;
        } else if (typeof this.props.value === 'string') {
            selectedColor = Color.fromString(this.props.value);
        } else if (typeof this.props.value === 'number') {
            selectedColor = Color.fromNumber(this.props.value);
        }

        const selectedPalette = this.props.palette || ColorPalette.colors();

        const colorClassName = (color: Color) => {
            if (color.eq(selectedColor)) {
                return 'color-picker-color selected';
            } else {
                return 'color-picker-color';
            }
        };

        const content = (
            <div className='color-picker-colors'>
                {selectedPalette.colors.map(c =>
                    <div className={colorClassName(c)} key={c.toString()}>
                        <div className='color-picker-color-inner' onClick={() => this.selectColor(c)} style={{background: c.toString()}}></div>
                    </div>
                )}
            </div>
        );

        return (
            <Popover content={content} title='Colors' visible={this.state.visible}>
                <Button className='color-picker-button' onClick={() => this.toggle()}>
                    <div className='color-picker-color'>
                        <div className='color-picker-color-inner' style={{background: selectedColor.toString()}}></div>
                    </div>
                </Button>
            </Popover>
        );
    }
}