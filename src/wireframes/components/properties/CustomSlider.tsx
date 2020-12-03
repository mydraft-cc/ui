import { Slider } from 'antd';
import * as React from 'react';

interface CustomSliderProps {
    // The slider value.
    value: number;

    // The minimum slider value.
    min: number;

    // The maximum slider value.
    max: number;

    // Change the items appearance..
    onChange: (value: number) => void;
}

export const CustomSlider = React.memo(({ max, min, onChange, value }: CustomSliderProps) => {
    const [sliderValue, setSliderValue] = React.useState<number>(value);

    React.useEffect(() => {
        setSliderValue(value);
    }, [value]);

    const doChangeValue = React.useCallback((v: number) => {
        setSliderValue(v);
    }, []);

    return (
        <Slider
            value={sliderValue}
            min={min}
            max={max}
            onChange={doChangeValue}
            onAfterChange={onChange} />
    );
});