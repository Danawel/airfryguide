// =============================================================
//  CONFIGURATION CENTRALE DU BLOG
//  C'est LE seul fichier à modifier pour personnaliser ton blog.
// =============================================================

export const SITE = {
  // Nom du blog (affiché partout)
  name: 'AirFryGuide',

  // Slogan / description courte
  tagline: 'Guides, comparatifs et astuces pour votre air fryer',

  // Description longue (SEO, balise meta description de l'accueil)
  description:
    'AirFryGuide publie chaque jour des guides complets, des comparatifs et des ' +
    'articles pour bien choisir et utiliser votre friteuse sans huile (air fryer). ' +
    'Conseils testés, recettes et sélections des meilleurs modèles.',

  // URL FINALE du blog (Cloudflare Pages)
  url: 'https://airfryguide.pages.dev',

  // Langue
  lang: 'fr',

  // Auteur affiché
  author: 'La rédaction AirFryGuide',
};

// =============================================================
//  AFFILIATION AMAZON
// =============================================================
export const AMAZON = {
  // TON TAG Amazon Partenaires (Associates).
  // Tant que tu n'as pas ton compte, laisse ce placeholder :
  // les liens fonctionneront mais ne rapporteront rien.
  // Quand tu as ton vrai tag (ex: 'monblog-21'), remplace-le ici : tout se met à jour.
  tag: 'airfryguide-21',

  // Domaine Amazon utilisé (France par défaut)
  domain: 'www.amazon.fr',

  // Mention légale obligatoire imposée par Amazon (affichée en haut de chaque article).
  disclosure:
    "En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant " +
    "les conditions requises. Ce guide contient des liens affiliés : si vous achetez via " +
    "l'un de ces liens, cela ne vous coûte pas plus cher et nous soutient.",
};

// =============================================================
//  STATISTIQUES DE VISITES (Cloudflare Web Analytics — gratuit)
//  Colle ici le "token" fourni par Cloudflare pour activer le compteur.
//  Laisse vide pour désactiver.
// =============================================================
export const ANALYTICS = {
  cloudflareToken: '',

  // Google Analytics 4 (GRATUIT) : compte les visites ET les clics sur les liens Amazon.
  // 1) Crée un compte sur https://analytics.google.com  2) Crée une propriété pour ton site
  // 3) Copie l'identifiant de mesure (format G-XXXXXXXXXX) et colle-le ci-dessous.
  // Laisse vide pour désactiver.
  gaMeasurementId: 'G-94KPJ8ZN2M',
};

// =============================================================
//  NOS AUTRES BLOGS (affichés en bas de chaque page)
//  Ajoute ici tes autres sites : ils se croisent pour envoyer
//  du trafic de l'un à l'autre. emoji = petite vignette.
// =============================================================
export const OTHER_BLOGS = [
  {
    name: 'RobotAspi',
    tagline: 'Robots aspirateurs : comparatifs & guides',
    product: 'Le bon robot aspirateur pour votre maison',
    url: 'https://robotaspi.pages.dev',
    emoji: '🤖',
  },
  {
    name: 'MaisonFraîche',
    tagline: 'Clim, rafraîchisseurs & déshumidificateurs',
    product: 'Garder sa maison au frais tout l\'été',
    url: 'https://maisonfraiche.pages.dev',
    emoji: '❄️',
  },
];

// Construit une URL affiliée propre à partir d'un ASIN (identifiant produit Amazon)
export function amazonLink(asin: string): string {
  return `https://${AMAZON.domain}/dp/${asin}?tag=${AMAZON.tag}`;
}
