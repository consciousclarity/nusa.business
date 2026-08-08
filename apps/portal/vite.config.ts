import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const API_TARGET = process.env.NUSA_API_TARGET || "http://localhost:8787";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Codespaces/devcontainers serve the app from a forwarded hostname.
    allowedHosts: [".app.github.dev", ".githubpreview.dev"],
    // Proxy the API through this dev server so the browser only ever talks to
    // one origin. Without it, a remote dev environment would have to expose the
    // API port publicly — which would put the seeded demo accounts on the
    // internet. Dev-server only: `vite build` output is unaffected, and
    // production still uses VITE_API_URL.
    proxy: {
      "/v1": { target: API_TARGET, changeOrigin: true },
      "/health": { target: API_TARGET, changeOrigin: true },
    },
  },
});
