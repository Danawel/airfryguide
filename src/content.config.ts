import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Collection d'articles. Chaque article est un fichier Markdown dans src/content/articles/
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Date de publication. L'article n'apparaît sur le site QUE si pubDate <= aujourd'hui.
    // C'est ce qui permet de "publier 1 article par jour" automatiquement.
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Type de contenu : guide complet, comparatif, ou article
    type: z.enum(['guide', 'comparatif', 'article']).default('guide'),
    // Liste d'ASIN Amazon à mettre en avant dans l'article (encadrés produits)
    products: z.array(z.string()).default([]),
    // Mots-clés SEO
    keywords: z.array(z.string()).default([]),
    // Image de couverture (optionnel)
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
