// ─── STEP 4: DATABASE WRITER ─────────────────────────────────────────────────

import { supabase } from "../config/supabase.js";
import { SOURCES, CATEGORY_ACCENT } from "../config/feeds.js";

export async function saveArticle(article) {
  const source = SOURCES[article.source] || {};

  const record = {
    url:            article.url,
    title:          article.title,
    summary_fr:     article.summary_fr,
    summary_en:     article.summary_en,
    key_points_fr:  article.key_points_fr || [],
    key_points_en:  article.key_points_en || [],
    full_text:      article.full_text?.slice(0, 5000) || null,
    source:         article.source,
    source_domain:  source.domain || null,
    source_url:     source.url    || null,
    category:       article.category,
    country:        article.country || "fr",
    sentiment:      article.sentiment || "neutral",
    accent_color:   CATEGORY_ACCENT[article.category] || "#FF6B00",
    image_url:      article.image_url || null,
    pub_date:       article.pub_date,
    fetched_at:     new Date().toISOString(),
    ai_processed:   article.ai_processed || false,
    extracted:      article.extracted    || false,
    is_active:      true,
  };

  const { error } = await supabase
    .from("articles")
    .upsert(record, { onConflict: "url", ignoreDuplicates: false });

  if (error) {
    console.error(`[DB] ✗ "${article.title.slice(0, 40)}": ${error.message}`);
    return false;
  }
  return true;
}

export async function saveAllArticles(articles) {
  console.log(`[DB] Saving ${articles.length} articles…`);
  const results = await Promise.all(articles.map(a => saveArticle(a)));
  const saved   = results.filter(Boolean).length;
  console.log(`[DB] ${saved}/${articles.length} saved`);
  await pruneOldArticles();
  return saved;
}

async function pruneOldArticles() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from("articles").delete().lt("pub_date", sevenDaysAgo);
  if (error) console.error("[DB] Prune failed:", error.message);
  else console.log("[DB] Pruned articles older than 7 days");
}
