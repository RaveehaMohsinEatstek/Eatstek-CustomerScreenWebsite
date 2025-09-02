import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Optimize rollup options
    rollupOptions: {
      // External dependencies that shouldn't be bundled
      external: ['jspdf', 'html2canvas'],
      
      output: {
        // Manual chunk splitting to reduce bundle size
        manualChunks: {
          // Separate vendor libraries
          vendor: ['react', 'react-dom'],
          // Keep PDF libraries separate if you decide to bundle them
          // pdf: ['jspdf', 'html2canvas']
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        }
      }
    },
    
    // Optimize terser options
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    
    // Reduce the target for better compatibility and smaller bundles
    target: 'es2015',
    
    // Enable source maps for debugging (optional, increases build size)
    sourcemap: false
  },
  
  // Optimize dependencies
  optimizeDeps: {
    exclude: ['jspdf', 'html2canvas'], // Don't pre-bundle these large libs
    include: ['react', 'react-dom'] // Pre-bundle these commonly used libs
  }
})