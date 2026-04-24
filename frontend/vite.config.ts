import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // 将 /api/* 代理到后端，开发时无需硬编码后端地址
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      // 认证路由也代理到后端
      "/auth": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
