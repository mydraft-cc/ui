import { ConfigProvider, theme } from 'antd';
import * as React from 'react';
import { useEventCallback } from '@app/core';
import { updateSystemPreference, selectEffectiveTheme } from '../model/actions';
import { useAppDispatch, useAppSelector } from '../../store';
import { forceTriggerThemeChange, updateCurrentTheme } from '../shapes/neutral/ThemeShapeUtils';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const effectiveTheme = useAppSelector(selectEffectiveTheme);
    
    // Update body class for theme
    React.useEffect(() => {
        // Remove any existing theme classes
        document.body.classList.remove('dark-theme');
        
        // Add the appropriate class based on effective theme
        if (effectiveTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        
        // Update the theme for shape components
        // The updateCurrentTheme function will return true if theme actually changed
        const themeChanged = updateCurrentTheme(effectiveTheme);
        
        // Force a theme notification 50ms after the theme change to ensure all components are updated
        // This helps with any race conditions in the rendering cycle
        const timeoutId = setTimeout(() => {
            forceTriggerThemeChange();
        }, 50);
        
        return () => clearTimeout(timeoutId);
    }, [effectiveTheme]);
    
    // Listen for system theme changes
    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Initial check
        dispatch(updateSystemPreference(mediaQuery.matches));
        
        // Add listener for changes
        const handleChange = (e: MediaQueryListEvent) => {
            dispatch(updateSystemPreference(e.matches));
        };
        
        // Use the appropriate event listener method based on browser support
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            // @ts-ignore - For older browsers
            mediaQuery.addListener(handleChange);
            return () => {
                // @ts-ignore - For older browsers
                mediaQuery.removeListener(handleChange);
            };
        }
    }, [dispatch]);
    
    // Create theme algorithm based on effective theme
    const isDark = effectiveTheme === 'dark';
    const algorithm = isDark ? theme.darkAlgorithm : theme.defaultAlgorithm;
    
    const tokenOverrides = {
        colorPrimary: isDark ? '#4a9eff' : '#3389ff',
        colorBgBase: isDark ? '#121212' : '#fff',
        colorTextBase: isDark ? '#e0e0e0' : '#373a3c',
        colorBorder: isDark ? '#303030' : '#e8e8e8',
        borderRadius: 2,
    };
    
    return (
        <ConfigProvider
            theme={{
                algorithm: algorithm,
                token: tokenOverrides,
                components: {
                    Menu: {
                        colorItemBgSelected: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    },
                    Layout: {
                        colorBgHeader: isDark ? '#0a0a0a' : '#fff',
                    },
                    Card: {
                        colorBgContainer: isDark ? '#1e1e1e' : '#fff',
                    },
                    Button: {
                        colorBgContainer: isDark ? '#2a2a2a' : '#fff',
                    },
                    Input: {
                        colorBgContainer: isDark ? '#1e1e1e' : '#fff',
                        colorBorder: isDark ? '#404040' : '#d9d9d9',
                    },
                    InputNumber: {
                        colorBgContainer: isDark ? '#1e1e1e' : '#fff',
                        colorBorder: isDark ? '#404040' : '#d9d9d9',
                    },
                    Select: {
                        colorBgContainer: isDark ? '#1e1e1e' : '#fff',
                        colorBorder: isDark ? '#404040' : '#d9d9d9',
                        optionSelectedBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    },
                    Tabs: {
                        itemSelectedColor: isDark ? '#4a9eff' : '#3389ff',
                        itemHoverColor: isDark ? '#e0e0e0' : '#373a3c',
                    },
                    Popover: {
                        colorBgElevated: isDark ? '#1e1e1e' : '#fff',
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
}; 