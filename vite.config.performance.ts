import { defineConfig } from 'vite';

/**
 * Performance Optimization Configuration for Vite
 * These settings dramatically improve build and runtime performance
 */
export const performanceConfig = {
  build: {
    // Enable minification for smaller bundles
    minify: 'esbuild',

    // Split vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],

          // Query and state management
          'query-vendor': ['@tanstack/react-query'],

          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],

          // Icons and utilities
          'utils-vendor': ['lucide-react', 'date-fns', 'clsx'],
        },
      },
    },

    // Increase chunk size warning limit (default is 500KB)
    chunkSizeWarningLimit: 1000,

    // Enable source maps for production debugging (optional - can disable for smaller builds)
    sourcemap: false,

    // Target modern browsers for smaller output
    target: 'es2020',

    // CSS code splitting
    cssCodeSplit: true,
  },

  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server startup
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
    ],
  },

  server: {
    // Enable HTTP/2 for faster parallel requests
    https: false, // Set to true in production with certificates

    // Optimize HMR (Hot Module Replacement)
    hmr: {
      overlay: true,
    },
  },
};

export default performanceConfig;
