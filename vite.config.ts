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

    build: {
        chunkSizeWarningLimit: 2000,
    },

    test: {
        globals: true,

        browser: {
            name: 'chrome', // browser name is required,
            
            slowHijackESM: false
        },
    },
    
    plugins: [react({})],
});
