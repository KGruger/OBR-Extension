import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
  },

  // build instructions to build a minified JavaSCript bundle called hand-handler.js to the /docs folder. What Owlbear Rodeo needs.
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: './src/main.js',
      output: {
        entryFileNames: 'hand-handler.js',
      },
    },
    emptyOutDir: true,
  },

  base: '/hand-handler-obr-extension/',
});
