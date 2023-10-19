import { fileURLToPath, URL } from "url";
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: [
            { find: '@app/', replacement: fileURLToPath(new URL('./src/', import.meta.url)) },
        ]
    },
    
    plugins: [react()],
});
