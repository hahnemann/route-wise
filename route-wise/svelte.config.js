import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: vitePreprocess(),

	kit: {
    // 1. You must use the static adapter for GitHub Pages
    adapter: adapter({ fallback: '404.html' }), 
    paths: {
      // 2. Replace 'route-wise' with your exact repo name
      base: process.env.NODE_ENV === 'production' ? '/route-wise' : '',
    }
  }
};

export default config;
