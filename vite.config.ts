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
      // Inject version, preconnect hints, and performance optimizations
      const preconnects = `
    <link rel="preconnect" href="https://vxplzgwimqqimkpabvja.supabase.co" crossorigin>
    <link rel="dns-prefetch" href="https://vxplzgwimqqimkpabvja.supabase.co">
    <meta name="app-version" content="${buildTime}" />`;
      return html.replace('</head>', `${preconnects}\n</head>`);
    },
    transform(code: string, id: string) {
      // Replace __BUILD_TIME__ in service worker
      if (id.endsWith('sw.js') || id.includes('service-worker')) {
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

// Preload hints plugin - generates modulepreload for critical chunks
function preloadPlugin(): import('vite').Plugin {
  return {
    name: 'preload-plugin',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;

      // Find critical chunks to preload
      const criticalChunks = ['react-vendor', 'react-router'];
      const preloadLinks: string[] = [];

      for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
        if (chunk.type === 'chunk') {
          const isCritical = criticalChunks.some(name => fileName.includes(name));
          if (isCritical) {
            preloadLinks.push(`<link rel="modulepreload" href="/${fileName}">`);
          }
        }
      }

      return html.replace('</head>', `${preloadLinks.join('\n')}\n</head>`);
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
    preloadPlugin(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force single React instance (prevents Invalid Hook Call)
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "./node_modules/react/jsx-dev-runtime.js"),
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
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          // CRITICAL PATH - Smallest possible initial bundle
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          // LARGE DATA FILES - Load on demand (210KB+ savings)
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

          // World locations data - only needed for location filters
          if (id.includes('data/worldLocations') || id.includes('data/mexicanLocations')) {
            return 'data-locations';
          }
          // Radio stations data - only needed for radio page
          if (id.includes('data/radioStations')) {
            return 'data-radio';
          }

          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          // FEATURE CHUNKS - Lazy loaded per feature
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          // UI COMPONENTS - Split by usage pattern
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
          // Tooltip - very common, keep separate and small
          if (id.includes('node_modules/@radix-ui/react-tooltip')) {
            return 'ui-tooltip';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-radix';
          }

          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          // UTILITIES & LIBRARIES
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
          // Charts - only needed on dashboard analytics
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
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
          // cmdk - command palette, rarely used
          if (id.includes('node_modules/cmdk')) {
            return 'cmdk';
          }
          // Other vendor chunks - catch-all (keep small)
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
