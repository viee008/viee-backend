// ─── STEP 2: ARTICLE EXTRACTOR ───────────────────────────────────────────────

import { extract } from "@extractus/article-extractor";
import pLimit from "p-limit";

const limit = pLimit(3);

export async function extractArticle(rawArticle) {
  try {
    const extracted = await extract(rawArticle.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
    });

    if (!extracted?.content) throw new Error("No content extracted");

    const fullText = cleanText(extracted.content);
    const wordCount = fullText.split(/\s+/).length;

    console.log(`[EXTRACT] ✓ ${rawArticle.source} — "${rawArticle.title.slice(0, 50)}" (${wordCount} words)`);

    return {
      ...rawArticle,
      full_text:  fullText.slice(0, 8000),
      image_url:  extracted.image || rawArticle.image_url || null,
      author:     extracted.author || null,
      word_count: wordCount,
      extracted:  true,
    };
  } catch (err) {
    console.warn(`[EXTRACT] ✗ ${rawArticle.source} — fallback to snippet: ${err.message}`);
    return {
      ...rawArticle,
      full_text:  rawArticle.rss_snippet || rawArticle.title,
      word_count: (rawArticle.rss_snippet || "").split(/\s+/).length,
      extracted:  false,
    };
  }
}

export async function extractAllArticles(rawArticles) {
  console.log(`[EXTRACT] Extracting ${rawArticles.length} articles…`);
  const results = await Promise.all(rawArticles.map(a => limit(() => extractArticle(a))));
  const ok = results.filter(r => r.extracted).length;
  console.log(`[EXTRACT] ${ok}/${results.length} fully extracted`);
  return results;
}

function cleanText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/\s{3,}/g, "\n\n").replace(/ {2,}/g, " ")
    .trim();
}
