import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import favicons from '@peterek/vite-plugin-favicons';

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
                    workbox: {
                        maximumFileSizeToCacheInBytes: 3_000_000,
                    }
                }),
                favicons('public/logo-square.svg', {
                    appName: 'mydraft',
                    appDescription: 'Open Source Wireframing Tool',
                    developerName: 'Sebastian Stehle',
                    developerURL: 'https://suquidex.io',
                    start_url: '/',
                    theme_color: '#fda100',
                })
            ] : []),
        react({}),
    ],
});
