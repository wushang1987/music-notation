import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {

    allowedHosts: ["scorecanvas.com", ".scorecanvas.com"],
    port: 5317,
    strictPort: true,
  },
  preview: {
    port: 80,
    strictPort: true,
    host: true,
  },
});
