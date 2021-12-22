/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { texts } from '@app/texts';
import { Button, Popover, Tabs } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import classNames from 'classnames';
import * as React from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import { Color } from './../utils/color';
import { ColorPalette } from './../utils/color-palette';
import './ColorPicker.scss';

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
        value,
    } = props;

    const [color, setColor] = React.useState(Color.BLACK);
    const [colorHex, setColorHex] = React.useState(color.toString());
    const [visible, setVisible] = React.useState<boolean>(false);

    const selectedPalette = palette || ColorPalette.colors();

    React.useEffect(() => {
        setColorHex(color.toString());
    }, [color]);

    React.useEffect(() => {
        setColor(value ? Color.fromValue(value) : Color.BLACK);
    }, [value]);

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
        setColorHex(result.toString());
    }, [onChange]);

    const doConfirmColor = React.useCallback(() => {
        if (onChange && colorHex) {
            onChange(Color.fromValue(colorHex));
        }

        setVisible(false);
        setColorHex(colorHex);
    }, [colorHex, onChange]);

    const content = (
        <Tabs size='small' className='color-picker-tabs' animated={false} activeKey={activeColorTab} onChange={doSelectTab}>
            <Tabs.TabPane key='palette' tab={texts.common.palette}>
                <div className='color-picker-colors'>
                    {selectedPalette.colors.map(c =>
                        <div className={classNames('color-picker-color', { selected: c.eq(color) })} key={c.toString()}>
                            <div className='color-picker-color-inner' onClick={() => doSelectColor(c)} style={{ background: c.toString() }}></div>
                        </div>,
                    )}
                </div>
            </Tabs.TabPane>
            <Tabs.TabPane key='advanced' tab={texts.common.advanced}>
                <SketchPicker color={colorHex} onChange={doSelectColorResult} disableAlpha={true} width='210px' />

                <Button onClick={doConfirmColor}>
                    {texts.common.apply}
                </Button>
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
