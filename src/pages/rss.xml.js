import rss from '@astrojs/rss';
import { SITE } from '../config.ts';
import { publishedArticles } from '../lib/articles.ts';

export async function GET(context) {
  const site = context.site ?? SITE.url;
  const articles = await publishedArticles();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site,
    // Espace de noms media (aide Pinterest à récupérer l'image de l'épingle)
    xmlns: { media: 'http://search.yahoo.com/mrss/' },
    items: articles.map((a) => {
      const img = new URL(`/pins/${a.id}.png`, site).toString();
      return {
        title: a.data.title,
        description: a.data.description,
        pubDate: a.data.pubDate,
        link: `/${a.id}/`,
        // Image de l'épingle : Pinterest la lit via <enclosure> et <media:content>
        enclosure: { url: img, length: 0, type: 'image/png' },
        customData: `<media:content medium="image" url="${img}" />`,
      };
    }),
  });
}
