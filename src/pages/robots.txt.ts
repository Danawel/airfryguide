import type { APIRoute } from 'astro';
import { SITE } from '../config.ts';

// Génère /robots.txt avec le lien vers le sitemap (bon pour le référencement Google).
export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('sitemap-index.xml', SITE.url).toString()}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
