import { Button, Popover, Tabs } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import * as React from 'react';
import { ColorResult, SketchPicker } from 'react-color';

import './ColorPicker.scss';

import { Color } from './../utils/color';
import { ColorPalette } from './../utils/color-palette';

interface ColorPickerProps {
    // The selected color.
    value?: Color | string | null;

    // The color palette.
    palette?: ColorPalette;

    // The active color tab.
    activeColorTab?: string;

    // Where to place the popover
    popoverPlacement?: TooltipPlacement;

    // If disabled or not.
    disabled?: boolean;

    // Triggered when the color has changed.
    onChange?: (color: Color) => void;

    // Triggered when the active color tab has changed.
    onActiveColorTabChanged?: (key: string) => void;
}

interface ColorPickerState {
    visible: boolean;

    color: Color;

    colorHex: string;
}

export class ColorPicker extends React.PureComponent<ColorPickerProps, ColorPickerState> {
    constructor(props: ColorPickerProps) {
        super(props);

        const color = props.value ? Color.fromValue(props.value) : Color.BLACK;

        this.state = { visible: false, color, colorHex: color.toString() };
    }

    public componentWillReceiveProps(newProps: ColorPickerProps) {
        const color = newProps.value ? Color.fromValue(newProps.value) : Color.BLACK;

        this.setState(s => ({ ...s, color, colorHex: color.toString() }));
    }

    private doSetVisibility = (visible: boolean) => {
        this.setState(s => ({ ...s, visible }));
    }

    private doToggle = () => {
        this.setState(s => ({ ...s, visible: !s.visible }));
    }

    private doSelectColorResult = (color: ColorResult) => {
        this.setState({ visible: true, colorHex: color.hex });
    }

    private doSelectTab = (key: string) => {
        if (this.props.onActiveColorTabChanged) {
            this.props.onActiveColorTabChanged(key);
        }
    }

    private doSelectColor = (color: Color) => {
        if (this.props.onChange) {
            this.props.onChange(color);
        }

        this.setState({ visible: false, colorHex: color.toString() });
    }

    private doConfirmCoclor = () => {
        if (this.props.onChange) {
            const color = this.state.colorHex;

            if (color) {
                this.props.onChange(Color.fromValue(this.state.colorHex));
            }
        }

        this.setState({ visible: false });
    }

    public render() {
        const { activeColorTab, disabled } = this.props;

        const selectedPalette = this.props.palette || ColorPalette.colors();

        const colorClassName = (color: Color) => {
            if (color.eq(this.state.color)) {
                return 'color-picker-color selected';
            } else {
                return 'color-picker-color';
            }
        };

        const content = (
            <Tabs size='small' className='color-picker-tabs' animated={false} activeKey={activeColorTab} onChange={this.doSelectTab}>
                <Tabs.TabPane key='palette' tab='Palette'>
                    <div className='color-picker-colors'>
                        {selectedPalette.colors.map(c =>
                            <div className={colorClassName(c)} key={c.toString()}>
                                <div className='color-picker-color-inner' onClick={() => this.doSelectColor(c)} style={{background: c.toString()}}></div>
                            </div>
                        )}
                    </div>
                </Tabs.TabPane>
                <Tabs.TabPane key='advanced' tab='Advanced'>
                    <SketchPicker color={this.state.colorHex} onChange={this.doSelectColorResult} disableAlpha={true} width='210px' />

                    <Button onClick={this.doConfirmCoclor}>Apply</Button>
                </Tabs.TabPane>
            </Tabs>
        );

        const placement = this.props.popoverPlacement || 'left';

        return (
            <Popover content={content} visible={this.state.visible} placement={placement} trigger='click' onVisibleChange={this.doSetVisibility}>
                <Button disabled={disabled} className='color-picker-button' onClick={this.doToggle}>
                    <div className='color-picker-color'>
                        <div className='color-picker-color-inner' style={{ background: this.state.colorHex }}></div>
                    </div>
                </Button>
            </Popover>
        );
    }
}