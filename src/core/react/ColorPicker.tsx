/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import Icon from '@ant-design/icons';
import { Button, Popover, Tabs } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import * as React from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import { Color, ColorPalette } from '@app/core/utils';
import { texts } from '@app/texts';
import { ColorList } from './ColorList';
import { useEventCallback } from './hooks';
import './ColorPicker.scss';

type ColorTab = 'palette' | 'advanced';

export interface ColorPickerProps {
    // The selected color.
    value?: Color | string | null;

    // The color palette.
    palette?: ColorPalette;

    // The color palette.
    recentColors?: ColorPalette;

    // The active color tab.
    activeColorTab?: ColorTab;

    // Where to place the popover
    popoverPlacement?: TooltipPlacement;

    // If disabled or not.
    disabled?: boolean;

    // Triggered when the color has changed.
    onChange?: (color: Color) => void;

    // Triggered when the active color tab has changed.
    onActiveColorTabChanged?: (key: ColorTab) => void;
}

export const ColorPicker = React.memo((props: ColorPickerProps) => {
    const {
        activeColorTab,
        disabled,
        onActiveColorTabChanged,
        onChange,
        palette,
        popoverPlacement,
        recentColors,
        value,
    } = props;

    const [color, setColor] = React.useState(Color.BLACK);
    const [colorHex, setColorHex] = React.useState(color.toString());
    const [visible, setVisible] = React.useState<boolean>(false);

    const selectedPalette = React.useMemo(() => {
        return palette || ColorPalette.colors();
    }, [palette]);

    React.useEffect(() => {
        setColorHex(color.toString());
    }, [color]);

    React.useEffect(() => {
        setColor(value ? Color.fromValue(value) : Color.BLACK);
    }, [value]);

    const doToggle = useEventCallback(() => {
        setVisible(x => !x);
    });

    const doSelectColorResult = useEventCallback((result: ColorResult) => {
        setColorHex(result.hex);
    });

    const doSelectTab = useEventCallback((key: string) => {
        onActiveColorTabChanged && onActiveColorTabChanged(key as ColorTab);
    });

    const doSelectColor = useEventCallback((result: Color) => {
        onChange && onChange(result);
        setVisible(false);
        setColorHex(result.toString());
    });

    const doConfirmColor = useEventCallback(() => {
        onChange && onChange(Color.fromValue(colorHex));
        setVisible(false);
        setColorHex(colorHex);
    });

    const content = (
        <Tabs size='small' className='color-picker-tabs' animated={false} activeKey={activeColorTab} onChange={doSelectTab}>
            <Tabs.TabPane key='palette' tab={texts.common.palette}>
                <ColorList color={color} colors={selectedPalette} onClick={doSelectColor} />

                {recentColors &&
                    <div>
                        <h4>{texts.common.recent}</h4>

                        <ColorList color={color} colors={recentColors} onClick={doSelectColor} />
                    </div>
                }
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
        <Popover content={content} open={visible && !disabled} placement={placement} trigger='click' onOpenChange={setVisible}>
            <Button disabled={disabled} className='color-picker-button' onClick={doToggle}
                icon={
                    <Icon component={() => 
                        <div className='color-picker-color'>
                            <div className='color-picker-color-inner' style={{ background: colorHex }}></div>
                        </div>
                    } />
                }>
            </Button>
        </Popover>
    );
});
