import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@app': path.resolve(__dirname, './src/')
        }
    },

    define: {
        __REACT_DEVTOOLS_GLOBAL_HOOK__: { isDisabled: true }
    },

    test: {
        globals: true,

        browser: {
            name: 'chrome', // browser name is required,
            
            slowHijackESM: false
        },
    },
});
