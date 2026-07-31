# Prompt de reproduction — Blog d'affiliation auto + Pinterest auto

Copie tout le bloc ci-dessous dans une nouvelle session Claude Code (dossier vide).

---

Tu vas me créer un blog d'affiliation Amazon **entièrement automatisé**, en français, et le mettre en ligne. Je débute en code : explique simplement, guide-moi clic par clic pour les étapes que je dois faire moi-même (comptes, mots de passe, paiements — tu ne dois JAMAIS taper mes mots de passe/clés/carte). Fais toi-même tout le côté technique (code, git, build).

## Objectif final
Un blog qui, CHAQUE JOUR et sans que je fasse rien :
1. écrit un article SEO de ~2500 mots (guide / comparatif / article) via l'API Claude ;
2. y intègre mes liens affiliés Amazon ;
3. génère une image verticale "épingle" par article ;
4. publie l'article (le site se reconstruit tout seul) ;
5. publie une épingle Pinterest vers l'article via le flux RSS.

## Niche & réglages (demande-les-moi si non fournis)
- Niche : [À REMPLIR, ex : "air fryer / friteuse sans huile"]
- Nom du blog : [À REMPLIR]
- Langue : français
- 6 produits Amazon de la niche (nom, ASIN, specs, prix indicatif, points forts/faibles)

## Stack technique (à respecter)
- **Astro** (site statique, ultra rapide, bon pour le SEO). Intégrations : `@astrojs/sitemap`, `@astrojs/rss`.
- Hébergement **Netlify** (gratuit, rebuild auto à chaque push GitHub).
- Code sur **GitHub** (utilise le CLI `gh` ; installe-le via winget si absent ; connexion par device-code pour ne jamais voir mon mot de passe ; il faut le scope `workflow`).
- Génération d'articles : SDK `@anthropic-ai/sdk`, modèle **`claude-sonnet-5`** (bon rapport qualité/prix), `max_tokens: 16000`.
- **GitHub Actions** cron quotidien : génère l'article, commit, push → Netlify rebuild.
- Images d'épingles : **`satori` + `@resvg/resvg-js`** + police **Poppins** (Bold + SemiBold, TTF committées dans le repo). Format **1000×1500**, badge couleur selon le type, titre, branding, illustration de la niche en filigrane. Générées au build (`"build": "node scripts/gen-pins.mjs && astro build"`) dans `public/pins/<slug>.png`.

## Structure à créer
```
src/config.ts            → SITE (nom, url, lang) + AMAZON (tag, domaine, mention légale) + amazonLink(asin)
src/data/products.json   → catalogue produits (asin, name, capacity, power, priceHint, bestFor, pros[], cons[])
src/content.config.ts    → collection "articles" (glob md) : title, description, pubDate, type, products[], keywords[], draft
src/lib/articles.ts      → publishedArticles() = filtre draft==false ET pubDate<=maintenant, trié desc  (= "1 article/jour" par drip)
src/layouts/BaseLayout.astro → SEO complet : meta description, canonical, Open Graph, twitter, og:image, JSON-LD, RSS link, meta p:domain_verify (Pinterest)
src/components/ProductCard.astro → encart produit + lien affilié rel="nofollow sponsored noopener"
src/pages/[slug].astro   → article + disclosure Amazon + encarts produits + JSON-LD Article + og:image = /pins/<slug>.png
src/pages/index.astro, guides.astro, comparatifs.astro, a-propos.astro
src/pages/rss.xml.js      → RSS avec, pour CHAQUE item, <enclosure image/png> + <media:content> = /pins/<slug>.png  (indispensable pour Pinterest)
scripts/topics.json       → ~15 sujets {title, type, keywords, products[]}
scripts/generate-article.mjs → article du jour (nextTopic = 1er sujet sans fichier), --batch pour un stock daté échelonné
scripts/gen-pins.mjs      → génère les images épingles
.github/workflows/daily-publish.yml → cron '0 5 * * *' + workflow_dispatch, permissions contents:write, npm run generate, commit+push
netlify.toml (build "npm run build", publish "dist"), public/robots.txt, README.md
```
- Point clé "1 article/jour" : un article n'apparaît que si `pubDate <= aujourd'hui`. On pré-génère un stock daté, le site en dévoile 1 par jour.
- Seed : crée 2 articles de démarrage pour que le site ait du contenu tout de suite.

## Déroulé (guide-moi étape par étape, teste au fur et à mesure)
1. Scaffold complet + `npm install` + `npm run build` OK + aperçu local pour vérifier le rendu.
2. **GitHub** : compte + `gh` login (device code) + `gh repo create <nom> --public --source=. --push` (scope `workflow` requis).
3. **Netlify** : m'inscrire via GitHub, importer le repo, déployer. Récupère l'URL `*.netlify.app`, mets-la dans `src/config.ts` (SITE.url), commit/push. Si le projet est "privé par défaut", guide-moi pour le passer **public** ("Go live").
4. **Clé API** : je crée une clé sur console.anthropic.com et je l'ajoute moi-même en secret GitHub `ANTHROPIC_API_KEY` (Settings → Secrets → Actions). Il me faut un petit crédit prépayé Anthropic.
5. Lance le workflow à la main (`gh workflow run`) pour vérifier qu'un article se génère, se commit et s'affiche en ligne.
6. **Amazon Partenaires** : je crée le compte sur partenaires.amazon.fr en donnant l'URL Netlify. Choix de l'ID Partenaire = idéalement le même que le tag placeholder du code pour éviter tout changement (sinon tu mets mon vrai tag dans config.ts).
7. **Pinterest** : je crée un compte Entreprise + un tableau. Revendication du site via balise `<meta name="p:domain_verify" ...>` que tu ajoutes au `<head>` et pousses. Puis Paramètres → Créer des épingles en masse → **Publication automatique** : coller l'URL `/rss.xml` et choisir le tableau. (Premières épingles sous 24h.)

## Règles importantes
- Automatiser des posts dans des GROUPES Facebook = interdit (ban) : ne propose jamais ça. Pinterest via RSS et une Page FB via Meta Business Suite sont OK.
- Toujours partager le lien du BLOG, pas des liens Amazon bruts.
- Vérifie chaque étape (build, RSS contient bien les enclosures d'images, images accessibles en ligne) avant de dire que c'est bon.

Commence par me demander la niche, le nom du blog et mes 6 produits, puis lance-toi.
