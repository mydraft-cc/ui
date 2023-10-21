import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { ViteFaviconsPlugin } from 'vite-plugin-favicon';
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
        ...
        (process.env.NODE_ENV === 'production' ?
            [
                ViteFaviconsPlugin({
                    logo: './public/logo-square.svg',
                    favicons: {
                        appName: 'mydraft',
                        appDescription: 'Open Source Wireframing Tool',
                        developerName: 'Sebastian Stehle',
                        developerURL: 'https://suquidex.io',
                        start_url: '/',
                        theme_color: '#fda100',
                    },
                }),
                VitePWA({
                    injectRegister: null,
                }),
            ] : []),
        react({}),
    ],
});
