import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config.ts';

// https://astro.build/config
export default defineConfig({
  // IMPORTANT : remplace cette URL par l'adresse finale de ton blog
  // (ex: https://airfryguide.netlify.app ou https://ton-domaine.fr)
  site: SITE.url,
  integrations: [sitemap()],
});
