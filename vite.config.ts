import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Build version injector plugin for automatic cache busting
function buildVersionPlugin() {
  const buildTime = Date.now().toString();
  return {
    name: 'build-version-injector',
    transformIndexHtml(html: string) {
      // Inject version into HTML meta tag for reference
      return html.replace(
        '</head>',
        `<meta name="app-version" content="${buildTime}" />\n</head>`
      );
    },
    transform(code: string, id: string) {
      // Replace __BUILD_TIME__ in service worker
      if (id.endsWith('sw.js')) {
        return code.replace(/__BUILD_TIME__/g, buildTime);
      }
      return code;
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    buildVersionPlugin(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'], // Prevent duplicate React instances
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      'date-fns',
      'clsx',
    ],
    // Force optimization of these dependencies
    force: false,
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // Faster minification with esbuild
    legalComments: 'none',
  },
  build: {
    sourcemap: false, // Disable sourcemaps in production
    minify: 'esbuild', // Use esbuild for faster minification (was 'terser')
    target: 'es2020', // Target modern browsers for smaller bundle
    cssCodeSplit: true, // Split CSS for better caching
    rollupOptions: {
      output: {
        // Improved chunk splitting for better caching
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          // React Query
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query';
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-radix';
          }
          // Icons
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons')) {
            return 'icons';
          }
          // Framer Motion
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-utils';
          }
          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Enable compression
    reportCompressedSize: false, // Faster builds
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
  },
}));
