// ─── PIPELINE ORCHESTRATOR ───────────────────────────────────────────────────

import "dotenv/config";
import { FEEDS }                    from "../config/feeds.js";
import { fetchAllFeeds }            from "./1-rss-fetcher.js";
import { extractAllArticles }       from "./2-article-extractor.js";
import { summariseAllArticles }     from "./3-ai-summariser.js";
import { saveAllArticles }          from "./4-db-writer.js";

export async function runPipeline({ maxPerFeed = 5, categories = null } = {}) {
  const startTime = Date.now();
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║        VIEE PIPELINE STARTING            ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`  Time: ${new Date().toLocaleString("fr-FR")}\n`);

  const feeds = categories
    ? FEEDS.filter(f => categories.includes(f.category))
    : FEEDS;

  // STEP 1 — RSS
  console.log("┌─ STEP 1: RSS FETCH ─────────────────────");
  const rawArticles = await fetchAllFeeds(feeds, maxPerFeed);
  if (!rawArticles.length) {
    console.log("└─ No articles. Aborting.\n");
    return { success: false };
  }
  console.log(`└─ ${rawArticles.length} articles\n`);

  // STEP 2 — Extract
  console.log("┌─ STEP 2: EXTRACT FULL TEXT ─────────────");
  const extracted = await extractAllArticles(rawArticles);
  console.log(`└─ ${extracted.filter(a => a.extracted).length}/${extracted.length} extracted\n`);

  // STEP 3 — AI
  console.log("┌─ STEP 3: AI SUMMARISE ──────────────────");
  const summarised = await summariseAllArticles(extracted);
  console.log(`└─ ${summarised.filter(a => a.ai_processed).length}/${summarised.length} summarised\n`);

  // STEP 4 — Save
  console.log("┌─ STEP 4: SAVE TO DATABASE ──────────────");
  const saved = await saveAllArticles(summarised);
  console.log(`└─ ${saved} saved\n`);

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("╔══════════════════════════════════════════╗");
  console.log(`║  DONE in ${duration}s — ${saved} articles in DB    `);
  console.log("╚══════════════════════════════════════════╝\n");

  return {
    success: true,
    stats: { fetched: rawArticles.length, saved, duration_s: parseFloat(duration) },
  };
}

// Run directly: node pipeline/run.js
if (process.argv[1].includes("run.js")) {
  runPipeline().then(r => process.exit(r.success ? 0 : 1));
}
