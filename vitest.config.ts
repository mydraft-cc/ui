import path from 'path';
import { defineConfig } from 'vite';

const isCI = !!process.env.CI || process.argv.includes('--coverage');

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
        
        // Use jsdom for CI, browser for local development
        environment: isCI ? 'jsdom' : 'browser',
        
        // Browser configuration for local tests
        browser: {
            enabled: !isCI,
            // Update to use instances array instead of deprecated name field
            instances: [
                { browser: 'chrome' }
            ],
            // Fixes a bug with build errors in browser mode
            slowHijackESM: false,
        },

        coverage: {
            provider: 'istanbul',
        },
        
        // Increase timeouts for tests
        testTimeout: 30000,
        hookTimeout: 30000,
    },
} as any);
