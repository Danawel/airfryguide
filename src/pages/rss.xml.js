import rss from '@astrojs/rss';
import { SITE } from '../config.ts';
import { publishedArticles } from '../lib/articles.ts';

export async function GET(context) {
  const articles = await publishedArticles();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.pubDate,
      link: `/${a.id}/`,
    })),
  });
}
