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
            if (
              id.includes("zod") ||
              id.includes("axios") ||
              id.includes("date-fns") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("class-variance-authority")
            ) {
              return "utils";
            }

            if (id.includes("lucide-react") || id.includes("react-icons")) {
              return "icons";
            }

            if (id.includes("@tanstack")) {
              return "tables";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  }
});
