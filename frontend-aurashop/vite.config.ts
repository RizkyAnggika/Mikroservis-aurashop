import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tsconfigPaths from "vite-tsconfig-paths"
import path from "node:path"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: {
    rollupOptions: {
      input: {
        shop: path.resolve(__dirname, "html/index.html"),
        admin: path.resolve(__dirname, "html/admin.html"),
        orders: path.resolve(__dirname, "html/orders.html"),
      },
    },
  },
})
