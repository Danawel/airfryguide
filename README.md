# AirFryGuide 🍟 — Blog d'affiliation air fryer (auto-publication)

Un blog SEO en français qui publie **automatiquement chaque jour** un guide, comparatif ou
article sur les air fryers, avec **liens affiliés Amazon** intégrés.

- ⚡ Site statique ultra-rapide (Astro) → excellent pour Google
- 🤖 Génération d'articles de ~2500 mots via l'API Claude
- 🛒 Encarts produits Amazon avec ton tag affilié (auto)
- 🗓️ Publication automatique quotidienne (GitHub Actions)
- 💸 Hébergement gratuit (Netlify)

---

## 🚀 Démarrage rapide (en local, sur ton PC)

```bash
npm install
npm run dev
```

Ouvre ensuite http://localhost:4321 — le blog s'affiche avec les 2 articles de démarrage.

Pour construire la version finale du site :

```bash
npm run build
```

---

## ✏️ Personnaliser (1 seul fichier)

Tout se règle dans **`src/config.ts`** :

- `SITE.name`, `SITE.tagline`, `SITE.description` → identité du blog
- `SITE.url` → l'adresse finale (à remplir après le déploiement)
- `AMAZON.tag` → **ton tag Amazon Partenaires** (remplace `airfryguide-21`)

Les produits mis en avant sont dans **`src/data/products.json`** (nom, ASIN, prix indicatif…).
L'`ASIN` est l'identifiant Amazon visible dans l'URL d'un produit : `amazon.fr/dp/ASIN`.

---

## 🤖 Génération d'articles (API Claude)

1. Crée une clé API sur https://console.anthropic.com
2. Définis-la comme variable d'environnement :

   ```bash
   # Windows (PowerShell)
   $env:ANTHROPIC_API_KEY = "sk-ant-..."
   # Mac / Linux
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```

3. Génère un article :

   ```bash
   npm run generate          # 1 article (daté d'aujourd'hui)
   npm run generate:batch    # 5 articles d'un coup (pour créer un stock)
   ```

Les sujets sont dans **`scripts/topics.json`** — ajoute autant de titres que tu veux.
Le modèle utilisé est `claude-opus-5` (qualité max). Pour réduire le coût par article,
change `MODEL` en `'claude-sonnet-5'` dans `scripts/generate-article.mjs`.

> 💡 **« 1 article par jour »** : un article n'apparaît sur le site que si sa date
> (`pubDate`) est passée. Tu peux donc pré-générer un stock daté sur plusieurs jours,
> le site les dévoilera un par jour.

---

## 🌍 Mettre le blog en ligne gratuitement (une fois)

### Étape 1 — Compte GitHub
Crée un compte sur https://github.com (gratuit) et un nouveau dépôt (repository) vide,
par exemple `airfryguide`.

### Étape 2 — Envoyer le code
Dans le dossier du projet :

```bash
git init
git add .
git commit -m "Premier commit"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/airfryguide.git
git push -u origin main
```

### Étape 3 — Déployer sur Netlify
1. Va sur https://netlify.com → connecte-toi avec GitHub
2. « Add new site » → « Import an existing project » → choisis ton dépôt
3. Netlify détecte tout seul la config (`netlify.toml`). Clique sur **Deploy**.
4. Ton blog est en ligne à une adresse type `https://xxxx.netlify.app`.
5. **Recopie cette adresse dans `src/config.ts` (`SITE.url`)**, puis commit → le site se met à jour.

### Étape 4 — Publication automatique quotidienne
1. Sur GitHub, dans ton dépôt : **Settings → Secrets and variables → Actions → New repository secret**
2. Nom : `ANTHROPIC_API_KEY`, valeur : ta clé API.
3. C'est tout. Chaque jour à 7h, GitHub génère un article, le commit, et Netlify
   reconstruit le site automatiquement. (Tu peux aussi le lancer à la main :
   onglet **Actions → Publication quotidienne → Run workflow**.)

---

## 🛒 Activer l'affiliation Amazon
1. Crée ton compte sur https://partenaires.amazon.fr (gratuit).
2. À l'étape « site internet », **donne l'adresse Netlify de ton blog** (il doit déjà avoir
   du contenu — c'est pourquoi on a des articles de démarrage + le stock généré).
3. Récupère ton **tag** (ex. `monblog-21`) et mets-le dans `src/config.ts` (`AMAZON.tag`).
4. Tous les liens deviennent affiliés automatiquement.

> ⚠️ Amazon demande généralement **au moins 3 ventes dans les 180 jours** pour valider
> définitivement le compte. L'affiliation fonctionne donc mieux avec un minimum de trafic.

---

## 📁 Structure du projet

```
src/
  config.ts            ← réglages (nom, URL, tag Amazon) — À MODIFIER
  data/products.json   ← catalogue produits Amazon
  content/articles/    ← les articles (Markdown), générés ou écrits à la main
  components/          ← encart produit affilié
  layouts/             ← gabarit + SEO (meta, JSON-LD, Open Graph)
  pages/               ← accueil, guides, comparatifs, article, RSS
scripts/
  topics.json          ← liste des sujets à rédiger
  generate-article.mjs ← générateur via l'API Claude
.github/workflows/     ← automatisation quotidienne
```
