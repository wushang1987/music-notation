import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
