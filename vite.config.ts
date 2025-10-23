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
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
  build: {
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'react-query': ['@tanstack/react-query'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          'motion': ['framer-motion']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
}));
