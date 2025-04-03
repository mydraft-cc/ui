import React from 'react';
import { Segmented } from 'antd';
import { texts } from '@app/texts';

interface DesignThemeSelectorProps {
    value: 'light' | 'dark';
    onChange: (value: 'light' | 'dark') => void;
}

export const DesignThemeSelector: React.FC<DesignThemeSelectorProps> = ({ value, onChange }) => {
    // Prepare options for the Segmented control
    const options = [
        { label: texts.common.lightTheme, value: 'light' },
        { label: texts.common.darkTheme, value: 'dark' },
    ];

    const handleChange = (newValue: string | number) => {
        onChange(newValue as 'light' | 'dark');
    };

    return (
        <Segmented
            options={options}
            value={value}
            onChange={handleChange}
            aria-label="Select Design Theme"
        />
    );
}; 