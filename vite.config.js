import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import path from "path";

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080", // Spring Boot 서버 주소
        changeOrigin: true,
      },
    },
  },
});
// export default defineConfig({
//   plugins: [vue()],
// server: {
//   proxy: {
//     "/api": {
//       target: "http://localhost:8080", // Spring Boot 서버 주소
//       changeOrigin: true,
//     },
//   },
//   },
// });
