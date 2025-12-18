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
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react'
    ],
    exclude: ['@capacitor/core', '@capacitor/app'],
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    sourcemap: false, // Disable sourcemaps in production
    // esbuild is ~2x faster than terser; terser produces slightly smaller bundles but slower builds
    // Using esbuild for production for faster CI; switch to 'terser' if bundle size is critical
    minify: mode === 'production' ? 'esbuild' : 'terser',
    // Inline assets smaller than 4KB to reduce HTTP requests
    assetsInlineLimit: 4096,
    // Report compressed (gzip) sizes in build output
    reportCompressedSize: true,
    // Explicit cssCodeSplit for clarity (defaults to true)
    cssCodeSplit: true,
    // Target modern browsers for smaller bundles (removes polyfills)
    target: 'es2020',
    // Optimize CSS for production
    cssMinify: mode === 'production' ? 'esbuild' : false,
    rollupOptions: {
      output: {
        // Use content hashes for long-term caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          // Core React runtime - loaded on every page
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // React Router - loaded on every page
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          // React Query - loaded for data fetching pages
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query';
          }
          // Supabase client - loaded for authenticated pages
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          // Framer Motion - loaded for animated pages
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          // Radix UI components - split by component for better tree-shaking
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-radix';
          }
          // Zod validation - loaded for form pages
          if (id.includes('node_modules/zod')) {
            return 'validation';
          }
          // React Hook Form - loaded for form pages
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'forms';
          }
          // Other vendor chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      },
      // Enable tree shaking
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false
      }
    },
    chunkSizeWarningLimit: 1000,
  },
}));
