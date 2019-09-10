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

export const ColorPicker = React.memo((props: ColorPickerProps) => {
    const {
        activeColorTab,
        disabled,
        onActiveColorTabChanged,
        onChange,
        palette,
        popoverPlacement,
        value
    } = props;

    const valueColor = value ? Color.fromValue(props.value) : Color.BLACK;

    const [color] = React.useState<Color>(valueColor);
    const [colorHex, setColorHex] = React.useState(valueColor.toString());
    const [visible, setVisible] = React.useState<boolean>(false);

    const selectedPalette = palette || ColorPalette.colors();

    React.useEffect(() => {
        setColorHex(valueColor.toString());
    }, [valueColor]);

    const doToggle = React.useCallback(() => {
        setVisible(!visible);
    }, [visible]);

    const doSelectColorResult = React.useCallback((result: ColorResult) => {
        setColorHex(result.hex);
    }, []);

    const doSelectTab = React.useCallback((key: string) => {
        if (onActiveColorTabChanged) {
            onActiveColorTabChanged(key);
        }
    }, [onActiveColorTabChanged]);

    const doSelectColor = React.useCallback((result: Color) => {
        if (onChange) {
            onChange(result);
        }

        setVisible(false);
        setColorHex(color.toString());
    }, [onChange]);

    const doConfirmColor = React.useCallback(() => {
        if (onChange && colorHex) {
            onChange(Color.fromValue(colorHex));
        }

        setVisible(false);
        setColorHex(colorHex);
    }, [colorHex, onChange]);

    const colorClassName = (c: Color) => {
        if (c.eq(color)) {
            return 'color-picker-color selected';
        } else {
            return 'color-picker-color';
        }
    };

    const content = (
        <Tabs size='small' className='color-picker-tabs' animated={false} activeKey={activeColorTab} onChange={doSelectTab}>
            <Tabs.TabPane key='palette' tab='Palette'>
                <div className='color-picker-colors'>
                    {selectedPalette.colors.map(c =>
                        <div className={colorClassName(c)} key={c.toString()}>
                            <div className='color-picker-color-inner' onClick={() => doSelectColor(c)} style={{background: c.toString()}}></div>
                        </div>
                    )}
                </div>
            </Tabs.TabPane>
            <Tabs.TabPane key='advanced' tab='Advanced'>
                <SketchPicker color={colorHex} onChange={doSelectColorResult} disableAlpha={true} width='210px' />

                <Button onClick={doConfirmColor}>Apply</Button>
            </Tabs.TabPane>
        </Tabs>
    );

    const placement = popoverPlacement || 'left';

    return (
        <Popover content={content} visible={visible} placement={placement} trigger='click' onVisibleChange={setVisible}>
            <Button disabled={disabled} className='color-picker-button' onClick={doToggle}>
                <div className='color-picker-color'>
                    <div className='color-picker-color-inner' style={{ background: colorHex }}></div>
                </div>
            </Button>
        </Popover>
    );
});