/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
 */

import { Button, Popover, Tabs } from "antd";
import { TooltipPlacement } from "antd/lib/tooltip";
import classNames from "classnames";
import * as React from "react";
import { ColorResult, SketchPicker } from "react-color";
import { texts } from "@app/texts";
import { Color } from "./../utils/color";
import { ColorPalette } from "./../utils/color-palette";
import "./ColorPicker.scss";
import { useEventCallback } from "./hooks";
// import { useSelector } from "react-redux";
import { getDocumentColors } from "@app/wireframes/model/projections";
import { useSelector } from "react-redux";

type ColorTab = "palette" | "advanced";

interface ColorPickerProps {
  // The selected color.
  value?: Color | string | null;

  // The color palette.
  palette?: ColorPalette;

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
    value,
  } = props;

  const [color, setColor] = React.useState(Color.BLACK);
  const [colorHex, setColorHex] = React.useState(color.toString());
  const [visible, setVisible] = React.useState<boolean>(false);
  const documentColors = useSelector(getDocumentColors);

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
    setVisible((x) => !x);
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
    <Tabs
      size="small"
      className="color-picker-tabs"
      animated={false}
      activeKey={activeColorTab}
      onChange={doSelectTab}
    >
      <Tabs.TabPane key="palette" tab={texts.common.palette}>
        <div className="color-picker-colors">
          {selectedPalette.colors.map((c) => (
            <div
              className={classNames("color-picker-color", {
                selected: c.eq(color),
              })}
              key={c.toString()}
            >
              <div
                className="color-picker-color-inner"
                onClick={() => doSelectColor(c)}
                style={{ background: c.toString() }}
              ></div>
            </div>
          ))}
        </div>

        {documentColors.length > 0 && <div>{texts.common.documentColors}</div>}

        <div className="color-picker-colors">
          {documentColors.map((c: any) => (
            <div
              className={classNames("color-picker-color")}
              key={c.toString()}
            >
              <div
                className="color-picker-color-inner"
                onClick={() => doSelectColor(c)}
                style={{ background: c.toString() }}
              ></div>
            </div>
          ))}
        </div>
      </Tabs.TabPane>

      <Tabs.TabPane key="advanced" tab={texts.common.advanced}>
        <SketchPicker
          color={colorHex}
          onChange={doSelectColorResult}
          disableAlpha={true}
          width="210px"
        />
        <Button onClick={doConfirmColor}>{texts.common.apply}</Button>
      </Tabs.TabPane>
    </Tabs>
  );

  const placement = popoverPlacement || "left";

  return (
    <Popover
      content={content}
      visible={visible && !disabled}
      placement={placement}
      trigger="click"
      onVisibleChange={setVisible}
    >
      <Button
        disabled={disabled}
        className="color-picker-button"
        onClick={doToggle}
      >
        <div className="color-picker-color">
          <div
            className="color-picker-color-inner"
            style={{ background: colorHex }}
          ></div>
        </div>
      </Button>
    </Popover>
  );
});
