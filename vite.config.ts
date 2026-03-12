import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: "/SECTMC/",
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: true,
    },
  },
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "node:async_hooks": path.resolve(__dirname, "./src/lib/agent/polyfills.ts"),
      "async_hooks": path.resolve(__dirname, "./src/lib/agent/polyfills.ts"),
    },
  },
  define: {
    global: "window",
    "process.env": {},
    process: {
      env: {},
      version: "\"v18.0.0\"", // Some libs check this
    },
  },
  optimizeDeps: {
    // Force dependency discovery to include common problematic packages
    include: [
      "camelcase", 
      "uuid", 
      "decamelize", 
      "p-queue", 
      "p-retry", 
      "semver", 
      "ansi-styles", 
      "brace-expansion", 
      "is-plain-obj"
    ],
  },
}));
