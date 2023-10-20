import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@app': path.resolve(__dirname, './src/')
        }
    },

    test: {
        globals: true,

        browser: {
            name: 'chrome', // browser name is required
        },
    }
});
