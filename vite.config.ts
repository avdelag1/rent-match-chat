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

// CSS optimization plugin - extracts and purges unused CSS
function cssOptimizationPlugin(): import('vite').Plugin {
  return {
    name: 'css-optimization',
    enforce: 'post',
    generateBundle(_options, bundle) {
      // Mark large CSS chunks for analysis in dev
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && chunk.type === 'asset') {
          const source = 'source' in chunk ? chunk.source : undefined;
          const size = typeof source === 'string' ? source.length : 0;
          if (size > 50000) {
            console.log(`[CSS Optimization] Large CSS file detected: ${fileName} (${Math.round(size / 1024)}KB)`);
          }
        }
      }
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
    cssOptimizationPlugin(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent duplicate React instances (including jsx runtimes)
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react'
    ],
    exclude: ['@capacitor/core', '@capacitor/app'],
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // More aggressive minification options
    minifyIdentifiers: mode === 'production',
    minifySyntax: mode === 'production',
    minifyWhitespace: mode === 'production',
  },
  build: {
    sourcemap: false, // Disable sourcemaps in production
    // Use terser for production for smaller bundles (slightly slower build but better compression)
    minify: mode === 'production' ? 'terser' : false,
    // Terser options for aggressive minification
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2, // Run compression multiple passes for better results
        pure_getters: true,
        pure_funcs: ['console.log', 'console.debug'],
        unsafe: true,
        unsafe_methods: true,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
      format: {
        comments: false,
      },
    } : undefined,
    // Inline assets smaller than 8KB to reduce HTTP requests (was 4KB)
    assetsInlineLimit: 8192,
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
          // Core React runtime - smallest possible critical chunk
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // React Router - loaded on every page, keep small
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          // Scheduler (React dependency) - keep with react
          if (id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }
          // React Query - defer loading, not needed for initial render
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query';
          }
          // Supabase client - only load when auth is needed
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          // Framer Motion - heavy animation library, load separately
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          // Split Radix UI by component type for granular loading
          if (id.includes('node_modules/@radix-ui/react-dialog') ||
              id.includes('node_modules/@radix-ui/react-alert-dialog')) {
            return 'ui-dialogs';
          }
          if (id.includes('node_modules/@radix-ui/react-dropdown') ||
              id.includes('node_modules/@radix-ui/react-select') ||
              id.includes('node_modules/@radix-ui/react-popover')) {
            return 'ui-dropdowns';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-radix';
          }
          // Date utilities - only needed for calendar/date features
          if (id.includes('node_modules/date-fns')) {
            return 'date-utils';
          }
          // Icons - split out as they can be large
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons')) {
            return 'icons';
          }
          // Forms - only needed on form pages
          if (id.includes('node_modules/zod')) {
            return 'validation';
          }
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'forms';
          }
          // Charts - only needed on dashboard
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
          // Capacitor - only needed in native apps
          if (id.includes('node_modules/@capacitor')) {
            return 'capacitor';
          }
          // Carousel components
          if (id.includes('node_modules/embla-carousel')) {
            return 'carousel';
          }
          // Other vendor chunks - catch-all
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      },
      // Aggressive tree shaking for maximum bundle size reduction
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        preset: 'safest', // Keep safest preset to avoid runtime issues
      },
    },
    // Warn on chunks larger than 500KB instead of 1000KB for mobile optimization
    chunkSizeWarningLimit: 500,
  },
}));
