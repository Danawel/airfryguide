// =====================================================================
//  GÉNÉRATEUR D'ARTICLE QUOTIDIEN (via l'API Claude)
//  Produit 1 guide/comparatif/article de ~2500 mots optimisé SEO,
//  intègre les produits Amazon, et enregistre un fichier Markdown.
//
//  Utilisation :
//    node scripts/generate-article.mjs          -> 1 article daté d'aujourd'hui
//    node scripts/generate-article.mjs --batch  -> 5 articles (pour créer un stock)
//
//  Prérequis : une clé API Anthropic dans la variable ANTHROPIC_API_KEY.
// =====================================================================

import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'src', 'content', 'articles');

// Modèle utilisé. claude-opus-5 = qualité maximale.
// Pour réduire fortement le coût par article, remplace par 'claude-sonnet-5'.
const MODEL = 'claude-sonnet-5';

const client = new Anthropic(); // lit automatiquement ANTHROPIC_API_KEY

// ---- Utilitaires -----------------------------------------------------

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // retire les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 70);
}

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function loadJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

// Liste des titres déjà rédigés (pour ne jamais se répéter)
function existingTitlesSet() {
  return new Set(fs.readdirSync(ARTICLES_DIR).map((f) => f.replace(/\.md$/, '')));
}

// Trouve le prochain sujet non encore rédigé dans la liste fixe
function nextTopic(topics) {
  const existing = existingTitlesSet();
  return topics.find((t) => !existing.has(slugify(t.title)));
}

// Quand la liste fixe est épuisée : Claude invente un sujet inédit.
// Il choisit lui-même un titre, un type, des mots-clés SEO et de VRAIS ASIN
// parmi le catalogue produits, en évitant tout ce qui existe déjà.
async function inventTopic() {
  const existing = existingTitlesSet();
  const allProducts = loadJSON('src/data/products.json').products;

  // Liste des sujets déjà couverts (titres lisibles) pour éviter les doublons.
  const done = [...existing].join(', ');
  const catalogue = allProducts
    .map((p) => `${p.asin} = ${p.name} (${p.capacity}, idéal ${p.bestFor})`)
    .join('\n');

  const user = `Tu gères le calendrier éditorial d'un blog français sur les air fryers (friteuses sans huile).
Propose UN SEUL nouveau sujet d'article, inédit et utile pour le SEO, que le lecteur pourrait chercher sur Google.

SUJETS DÉJÀ TRAITÉS (slugs, à NE PAS répéter, même de façon proche) :
${done || '(aucun pour l’instant)'}

CATALOGUE PRODUITS disponibles (choisis 0 à 3 ASIN pertinents pour ce sujet) :
${catalogue}

Réponds UNIQUEMENT avec un objet JSON strict, sans texte autour, au format :
{"title":"...","type":"guide|comparatif|article","keywords":["...","...","..."],"products":["ASIN",...]}

Contraintes :
- "title" en français, accrocheur, différent de tout sujet déjà traité.
- "type" = "comparatif" si on compare des modèles, "guide" si c'est un tuto/recettes/pratique, "article" sinon.
- "keywords" = 3 expressions de recherche Google réalistes.
- "products" = uniquement des ASIN de la liste ci-dessus (ou [] si le sujet ne concerne aucun produit précis).`;

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 500,
    system: "Tu es un stratège SEO. Tu réponds toujours par un JSON valide et rien d'autre.",
    messages: [{ role: 'user', content: user }],
  });
  const message = await stream.finalMessage();
  const raw = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();

  // Extrait le JSON même si le modèle ajoute des retours à la ligne.
  const json = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  const topic = JSON.parse(json);

  // Garde-fous : type valide, ASIN existants, pas de doublon.
  if (!['guide', 'comparatif', 'article'].includes(topic.type)) topic.type = 'article';
  const validAsins = new Set(allProducts.map((p) => p.asin));
  topic.products = (topic.products || []).filter((a) => validAsins.has(a));
  if (existing.has(slugify(topic.title))) {
    topic.title = `${topic.title} (${new Date().getFullYear()})`;
  }
  console.log(`🧠 Sujet inventé par l'IA : « ${topic.title} » [${topic.type}]`);
  return topic;
}

// ---- Génération d'un article ----------------------------------------

async function generateOne(topic, dateISO) {
  const allProducts = loadJSON('src/data/products.json').products;
  const featured = allProducts.filter((p) => (topic.products || []).includes(p.asin));

  const productContext = featured.length
    ? featured
        .map(
          (p) =>
            `- ${p.name} : ${p.capacity}, ${p.power}, idéal ${p.bestFor}, prix indicatif ${p.priceHint}. ${p.highlight}`
        )
        .join('\n')
    : '(aucun produit spécifique à mentionner nommément dans cet article)';

  const system =
    "Tu es un rédacteur web francophone expert en électroménager de cuisine, spécialisé dans les air fryers " +
    "(friteuses sans huile) et le référencement naturel (SEO). Tu écris pour un blog grand public : ton clair, " +
    "concret, utile, sans blabla ni promesses exagérées. Tu ne mens jamais sur les caractéristiques d'un produit " +
    "et tu n'inventes pas de prix précis.";

  const user = `Rédige un article de blog en français d'environ 2500 mots.

TITRE : « ${topic.title} »
TYPE : ${topic.type}
MOTS-CLÉS SEO à intégrer naturellement : ${(topic.keywords || []).join(', ')}

PRODUITS à mentionner par leur nom dans le texte (utilise UNIQUEMENT ces caractéristiques, n'en invente pas d'autres) :
${productContext}

CONSIGNES DE RÉDACTION :
- Commence directement par un paragraphe d'introduction accrocheur (PAS de titre H1, il est déjà géré).
- Structure avec des sous-titres en Markdown : ## pour les grandes sections, ### pour les sous-sections.
- Inclus au moins un tableau comparatif en Markdown si le sujet s'y prête (temps de cuisson, comparaison de modèles, etc.).
- Utilise des listes à puces pour aérer.
- Style pédagogique, phrases claires, paragraphes courts.
- Mentionne les produits ci-dessus par leur nom quand c'est pertinent, MAIS n'écris PAS de section "où acheter" ni de lien : des encarts produits avec liens seront ajoutés automatiquement à la fin.
- Termine par une courte conclusion pratique.
- Vise ~2500 mots, riche et complet.
- Réponds UNIQUEMENT avec le corps de l'article en Markdown (aucune balise de code, aucun commentaire, pas de frontmatter).`;

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high' },
    system,
    messages: [{ role: 'user', content: user }],
  });

  const message = await stream.finalMessage();
  let body = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  // Génère une meta-description courte (< 160 caractères) à partir du 1er paragraphe
  const firstPara = body.split('\n').find((l) => l.trim().length > 40) || topic.title;
  const description = firstPara.replace(/[#*_>`]/g, '').trim().slice(0, 155);

  const slug = slugify(topic.title);
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(topic.title)}`,
    `description: ${JSON.stringify(description)}`,
    `pubDate: ${dateISO}`,
    `type: ${topic.type}`,
    `products: ${JSON.stringify(topic.products || [])}`,
    `keywords: ${JSON.stringify(topic.keywords || [])}`,
    '---',
    '',
  ].join('\n');

  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, frontmatter + body + '\n', 'utf8');
  console.log(`✅ Article créé : ${slug}.md  (${body.split(/\s+/).length} mots, publié le ${dateISO})`);
  return filePath;
}

// ---- Programme principal --------------------------------------------

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ La variable ANTHROPIC_API_KEY n\'est pas définie. Ajoute ta clé API Anthropic.');
    process.exit(1);
  }

  const topics = loadJSON('scripts/topics.json');
  const batch = process.argv.includes('--batch');
  const count = batch ? 5 : 1;

  for (let i = 0; i < count; i++) {
    // 1) On pioche d'abord dans la liste fixe (topics.json).
    // 2) Si elle est épuisée, l'IA invente elle-même un sujet inédit -> jamais de panne.
    let topic = nextTopic(topics);
    if (!topic) {
      console.log('ℹ️  Liste topics.json épuisée → génération automatique d\'un sujet.');
      topic = await inventTopic();
    }
    // En mode batch, on échelonne les dates pour publier 1 par jour.
    await generateOne(topic, todayISO(batch ? i : 0));
  }
}

main().catch((err) => {
  console.error('Erreur :', err);
  process.exit(1);
});
