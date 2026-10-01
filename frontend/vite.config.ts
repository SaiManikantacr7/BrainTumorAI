import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "next/link": fileURLToPath(new URL("./src/compat/Link.tsx", import.meta.url)),
      "next/navigation": fileURLToPath(new URL("./src/compat/navigation.ts", import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
});
