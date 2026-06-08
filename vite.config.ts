import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  // For Vercel deployment, use root path; for GitHub Pages, use /rd-parfums/
  const isVercel = process.env.VERCEL === "1";
  const base = isVercel ? "/" : "/rd-parfums/";

  return {
    base: base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Optimize for production
      minify: "terser" as const,
      sourcemap: process.env.NODE_ENV === "development", // Source maps only in dev
      rollupOptions: {
        output: {
          // Split chunks for better caching
          manualChunks: {
            firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
            react: ["react", "react-dom"],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
    define: {
      // Prevent exposing sensitive info in client bundles
      __SENTRY_DEBUG__: false,
    },
  };
});
