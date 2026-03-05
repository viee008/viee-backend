// ─── STEP 3: AI SUMMARISER (OpenAI) ──────────────────────────────────────────

import OpenAI from "openai";
import pLimit from "p-limit";
import "dotenv/config";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const limit  = pLimit(5);

const SYSTEM_PROMPT = `Tu es un journaliste expert qui résume des articles de presse française pour de jeunes professionnels.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans backticks, sans explication.
Format exact :
{
  "summary_fr": "Résumé en français de 70-90 mots, style direct et factuel, commence par les faits clés.",
  "summary_en": "Summary in English of 70-90 words, direct factual style, starts with key facts.",
  "key_points_fr": ["Point 1 court", "Point 2 court", "Point 3 court"],
  "key_points_en": ["Short point 1", "Short point 2", "Short point 3"],
  "sentiment": "positive|neutral|negative",
  "category": "headlines|politique|economie|tech|culture|social"
}`;

export async function summariseArticle(article) {
  const wordTarget = parseInt(process.env.SUMMARY_WORD_TARGET || "80");

  const userPrompt = `Titre : ${article.title}
Source : ${article.source}
Catégorie attendue : ${article.category}

Texte de l'article :
${article.full_text.slice(0, 4000)}

Résume cet article en ${wordTarget} mots en français et en anglais. Donne 3 points clés.`;

  try {
    const response = await client.chat.completions.create({
      model:           process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens:      600,
      temperature:     0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: userPrompt    },
      ],
    });

    const parsed = JSON.parse(response.choices[0].message.content.trim());
    if (!parsed.summary_fr || !parsed.summary_en) throw new Error("Missing summary fields");

    console.log(`[AI] ✓ ${article.source} — "${article.title.slice(0, 50)}"`);

    return {
      ...article,
      summary_fr:    parsed.summary_fr,
      summary_en:    parsed.summary_en,
      key_points_fr: parsed.key_points_fr || [],
      key_points_en: parsed.key_points_en || [],
      sentiment:     parsed.sentiment     || "neutral",
      category:      parsed.category      || article.category,
      ai_processed:  true,
    };
  } catch (err) {
    console.error(`[AI] ✗ ${article.source} — "${article.title.slice(0, 40)}": ${err.message}`);
    return {
      ...article,
      summary_fr:    article.rss_snippet || article.title,
      summary_en:    article.rss_snippet || article.title,
      key_points_fr: [],
      key_points_en: [],
      sentiment:     "neutral",
      ai_processed:  false,
    };
  }
}

export async function summariseAllArticles(articles) {
  console.log(`[AI] Summarising ${articles.length} articles with ${process.env.OPENAI_MODEL || "gpt-4o-mini"}…`);
  const results = await Promise.all(articles.map(a => limit(() => summariseArticle(a))));
  const ok = results.filter(r => r.ai_processed).length;
  console.log(`[AI] ${ok}/${results.length} summaries generated`);
  return results;
}
