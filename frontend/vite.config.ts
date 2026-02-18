import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router")) return "core-vendor";
            if (id.includes("lucide-react")) return "icons-lucide";
            if (id.includes("react-icons")) return "icons-react";
            if (id.includes("recharts")) return "recharts";
            if (id.includes("framer-motion")) return "framer";
            if (id.includes("@radix-ui")) return "radix";
            if (id.includes("date-fns")) return "date-fns";
            if (id.includes("zod")) return "validation";
            if (id.includes("@tanstack")) return "tables";
            if (id.includes("axios")) return "axios";
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  }
});
