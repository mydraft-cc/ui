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

interface CustomSliderState {
    // The slider value.
    value: number;
}

export class CustomSlider extends React.Component<CustomSliderProps, CustomSliderState> {
    constructor(props: CustomSliderProps) {
        super(props);

        this.state = { value: props.value };
    }

    public componentWillReceiveProps(nextProps: CustomSliderProps) {
        this.setValue(nextProps.value);
    }

    private setValue(value: number) {
        this.setState({ value });
    }

    public render() {
        return (
            <Slider
                value={this.state.value}
                min={this.props.min}
                max={this.props.max}
                onChange={(ev: number) =>  this.setValue(ev)}
                onAfterChange={(ev: number) => this.props.onChange(ev)} />
        );
    }
}