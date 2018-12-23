import { Button, Popover } from 'antd';
import * as React from 'react';

import './color-picker.scss';

import {
    Color,
    ColorPalette,
    Types
} from '@app/core';

interface ColorPickerProps {
    // The selected color.
    value?: Color | string | null;

    // The color palette.
    palette?: ColorPalette;

    // If disabled or not.
    disabled?: boolean;

    // Triggered when the color has changed.
    onChange?: (color: Color) => void;
}

interface ColorPickerState {
    visible: boolean;
}

export class ColorPicker extends React.PureComponent<ColorPickerProps, ColorPickerState> {
    constructor(props: ColorPickerProps) {
        super(props);

        this.state = { visible: false };
    }

    private doToggle = () => {
        this.setState(s => { return { visible: !s.visible }; });
    }

    private doSelectColor = (color: Color) => {
        if (this.props.onChange) {
            this.props.onChange(color);
        }

        this.setState({ visible: false });
    }

    public render() {
        let selectedColor = Color.BLACK;

        const value = this.props.value;

        if (Types.is(value, Color)) {
            selectedColor = value;
        } else if (Types.isString(value)) {
            selectedColor = Color.fromString(value);
        } else if (Types.isNumber(value)) {
            selectedColor = Color.fromNumber(value);
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
                        <div className='color-picker-color-inner' onClick={() => this.doSelectColor(c)} style={{background: c.toString()}}></div>
                    </div>
                )}
            </div>
        );

        return (
            <Popover content={content} title='Colors' visible={this.state.visible}>
                <Button disabled={this.props.disabled} className='color-picker-button' onClick={this.doToggle}>
                    <div className='color-picker-color'>
                        <div className='color-picker-color-inner' style={{background: selectedColor.toString()}}></div>
                    </div>
                </Button>
            </Popover>
        );
    }
}