import { ConfigProvider, theme } from 'antd';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from '@app/store';
import { updateSystemPreference } from '../model/actions';
import { selectEffectiveAppTheme } from '../model/selectors/themeSelectors';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const effectiveTheme = useAppSelector(selectEffectiveAppTheme);
    const themeChangeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    
    // Update body class for theme
    React.useEffect(() => {
        document.body.classList.remove('dark-theme');
        
        if (effectiveTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        
        return () => {
            if (themeChangeTimeoutRef.current) {
                clearTimeout(themeChangeTimeoutRef.current);
                themeChangeTimeoutRef.current = null;
            }
        };
    }, [effectiveTheme]);
    
    // Listen for system theme changes
    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        dispatch(updateSystemPreference(mediaQuery.matches));
        
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
                        headerBg: isDark ? '#0a0a0a' : '#fff',
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