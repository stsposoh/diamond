import { defineConfig } from 'vite';

// Relative base: the build works at any path, so GitHub Pages serves it from /<repo>/ whatever the repo is called.
export default defineConfig({
  base: './',
});
