import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  base: "/simplevista/",
  server: {
    allowedHosts: ["gasolinic-shannan-untaloned.ngrok-free.dev"],
  },
});