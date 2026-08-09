import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

const BACKEND_URL = "http://127.0.0.1:5000";
const backendProxy = {
  "/captions": {
    target: BACKEND_URL,
    changeOrigin: true,
  },
  "/health": {
    target: BACKEND_URL,
    changeOrigin: true,
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  server: {
    proxy: backendProxy,
  },
  preview: {
    proxy: backendProxy,
  },
});
