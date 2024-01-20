import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@app': path.resolve(__dirname, './src/'),
        },
    },

    define: {
        __REACT_DEVTOOLS_GLOBAL_HOOK__: { isDisabled: true },
    },

    test: {
        globals: true,

        browser: {
            // Browser name is required,
            name: 'chrome', 
            
            // Fixes a bug with build errors in browser mode.
            slowHijackESM: false,
        },

        coverage: {
            provider: 'istanbul',
        },
    },
} as any);
