import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

/**
 * Retourne les articles réellement PUBLIÉS :
 *  - non "draft"
 *  - dont la date de publication est passée (pubDate <= maintenant)
 * Triés du plus récent au plus ancien.
 *
 * C'est ce filtre qui fait qu'un article programmé pour demain
 * n'apparaît sur le site qu'à partir de demain -> "1 article par jour".
 */
export async function publishedArticles(): Promise<Article[]> {
  const now = Date.now();
  const all = await getCollection('articles');
  return all
    .filter((a) => !a.data.draft && a.data.pubDate.getTime() <= now)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export async function articlesByType(type: 'guide' | 'comparatif' | 'article'): Promise<Article[]> {
  const all = await publishedArticles();
  return all.filter((a) => a.data.type === type);
}

export function typeLabel(type: string): string {
  switch (type) {
    case 'comparatif': return 'Comparatif';
    case 'article': return 'Article';
    default: return 'Guide complet';
  }
}
