import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/SorrisoAgiotagem/",
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    // Garantir que arquivos PWA sejam copiados corretamente
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
