import { ConfigProvider, theme } from 'antd';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from '@app/store';
import { updateSystemPreference } from '../model/actions';
import { forceTriggerThemeChange, updateCurrentTheme } from '../shapes/neutral/ThemeShapeUtils';
import { selectEffectiveTheme } from '../model/selectors/themeSelectors';
// Debounce helper function
const debounce = (fn: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const effectiveTheme = useAppSelector(selectEffectiveTheme);
    const themeChangeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    
    // Create debounced theme change notifier
    const debouncedThemeChange = React.useCallback(
        debounce(() => {
            forceTriggerThemeChange();
        }, 200),
        []
    );
    
    // Update body class for theme
    React.useEffect(() => {
        // Remove any existing theme classes
        document.body.classList.remove('dark-theme');
        
        // Add the appropriate class based on effective theme
        if (effectiveTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        
        // Directly synchronize theme with ThemeShapeUtils
        updateCurrentTheme(effectiveTheme);
        
        // Use debounced version to prevent multiple cascading updates
        debouncedThemeChange();
        
        return () => {
            if (themeChangeTimeoutRef.current) {
                clearTimeout(themeChangeTimeoutRef.current);
                themeChangeTimeoutRef.current = null;
            }
        };
    }, [effectiveTheme, debouncedThemeChange]);
    
    // Listen for system theme changes
    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Initial check
        dispatch(updateSystemPreference(mediaQuery.matches));
        
        // Add listener for changes
        const handleChange = (e: MediaQueryListEvent) => {
          dispatch(updateSystemPreference(e.matches));
        };
        
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
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