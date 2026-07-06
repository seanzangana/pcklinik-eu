import { defineConfig } from 'astro/config';

// pcklinik.eu — English site (mirror of pcklinik.dk)
export default defineConfig({
  site: 'https://www.pcklinik.eu',
  trailingSlash: 'always',
  build: {
    format: 'directory', // clean URLs: /lenovo-repair/ -> lenovo-repair/index.html
  },
});
