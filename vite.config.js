import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: "./",
    plugins: [react()],
    build: {
        outDir: 'dist', // Output directory for Electron
    },
    server: {
        port: 5173, // Default Vite dev server port
    },
});
