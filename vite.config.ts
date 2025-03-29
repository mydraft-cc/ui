import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@app': path.resolve(__dirname, './src/'),
        },
    },

    build: {
        chunkSizeWarningLimit: 2000,
    },
    
    plugins: [
        (process.env.NODE_ENV === 'production' ?
            [
                VitePWA({
                    injectRegister: null,
                }),
            ] : []),
        react({}),
    ],
});
