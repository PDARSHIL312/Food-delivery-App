import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase the chunk size limit to 1000 KB
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Example: If you have large dependencies like 'react-dom', you can split them into their own chunk
          if (id.includes("node_modules/react-dom")) {
            return "react-dom"; // Split into a chunk named 'react-dom'
          }
          if (id.includes("node_modules/some-large-library")) {
            return "some-large-library"; // You can specify other libraries for separate chunks
          }
        },
      },
    },
  },
});
