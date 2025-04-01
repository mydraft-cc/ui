import React from 'react';
import { Segmented } from 'antd';
import { useAppDispatch, useAppSelector } from '@app/store';
import { selectDesignThemeMode, setDesignThemeMode } from '../model/actions/designThemeSlice';
import { texts } from '@app/texts'; // Assuming texts are setup for localization

export const DesignThemeSelector: React.FC = () => {
    const dispatch = useAppDispatch();
    const currentMode = useAppSelector(selectDesignThemeMode);

    const handleChange = (value: string | number) => {
        // Type assertion as Segmented value can be string | number
        const mode = value as 'light' | 'dark';
        dispatch(setDesignThemeMode(mode));
    };

    // Prepare options for the Segmented control
    const options = [
        { label: texts.common.lightTheme, value: 'light' }, // Use correct key
        { label: texts.common.darkTheme, value: 'dark' },   // Use correct key
    ];

    // Add labels or tooltips later for clarity as per the todo
    return (
        <Segmented
            options={options}
            value={currentMode}
            onChange={handleChange}
            aria-label="Select Design Theme" // Accessibility
        />
    );
}; 