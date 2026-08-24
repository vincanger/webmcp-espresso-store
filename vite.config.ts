import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { wasp } from "wasp/client/vite";

export default defineConfig({
  plugins: [wasp(), tailwindcss()],
  server: {
    open: false,
    // Ports 3000/3001 are used by another local project; this app runs on
    // client 3002 / server 3101 (see .env.server and .env.client).
    port: 3002,
    strictPort: true,
  },
});
