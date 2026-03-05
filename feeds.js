// ─── VIEE RSS FEED REGISTRY ──────────────────────────────────────────────────

export const FEEDS = [
  // À LA UNE
  { url: "https://www.lemonde.fr/rss/une.xml",                  source: "Le Monde",    category: "headlines", country: "fr" },
  { url: "https://www.lefigaro.fr/rss/figaro_actualites.xml",   source: "Le Figaro",   category: "headlines", country: "fr" },
  { url: "https://www.francetvinfo.fr/titres.rss",              source: "France Info", category: "headlines", country: "fr" },
  { url: "https://www.liberation.fr/arc/outboundfeeds/rss/",    source: "Libération",  category: "headlines", country: "fr" },

  // POLITIQUE
  { url: "https://www.lemonde.fr/politique/rss_full.xml",       source: "Le Monde",    category: "politique", country: "fr" },
  { url: "https://www.lefigaro.fr/rss/figaro_politique.xml",    source: "Le Figaro",   category: "politique", country: "fr" },

  // ÉCONOMIE
  { url: "https://www.lemonde.fr/economie/rss_full.xml",        source: "Le Monde",    category: "economie",  country: "fr" },
  { url: "https://www.lefigaro.fr/rss/figaro_economie.xml",     source: "Le Figaro",   category: "economie",  country: "fr" },
  { url: "https://feeds.lesechos.fr/lesechos-economie.xml",     source: "Les Échos",   category: "economie",  country: "fr" },

  // TECH
  { url: "https://www.lemonde.fr/pixels/rss_full.xml",          source: "Le Monde",    category: "tech",      country: "fr" },
  { url: "https://www.01net.com/feed/",                         source: "01Net",       category: "tech",      country: "fr" },

  // CULTURE
  { url: "https://www.lemonde.fr/culture/rss_full.xml",         source: "Le Monde",    category: "culture",   country: "fr" },
  { url: "https://www.telerama.fr/rss.xml",                     source: "Télérama",    category: "culture",   country: "fr" },
  { url: "https://www.lequipe.fr/rss/actu_rss.xml",             source: "L'Équipe",    category: "culture",   country: "fr" },
];

export const SOURCES = {
  "Le Monde":    { domain: "lemonde.fr",      url: "https://www.lemonde.fr"      },
  "Le Figaro":   { domain: "lefigaro.fr",     url: "https://www.lefigaro.fr"     },
  "France Info": { domain: "francetvinfo.fr", url: "https://www.francetvinfo.fr" },
  "Libération":  { domain: "liberation.fr",   url: "https://www.liberation.fr"   },
  "Les Échos":   { domain: "lesechos.fr",     url: "https://www.lesechos.fr"     },
  "01Net":       { domain: "01net.com",       url: "https://www.01net.com"       },
  "Télérama":    { domain: "telerama.fr",     url: "https://www.telerama.fr"     },
  "L'Équipe":    { domain: "lequipe.fr",      url: "https://www.lequipe.fr"      },
};

export const CATEGORY_ACCENT = {
  headlines: "#FF4D4D",
  politique: "#EAB308",
  tech:      "#7C3AED",
  economie:  "#10B981",
  culture:   "#EC4899",
  social:    "#F97316",
};
