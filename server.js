// ─── VIEE API SERVER ─────────────────────────────────────────────────────────

import "dotenv/config";
import express         from "express";
import cors            from "cors";
import cron            from "node-cron";
import { supabase }    from "./config/supabase.js";
import { runPipeline } from "./pipeline/run.js";

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://viee.app",
    "https://www.viee.app",
  ],
}));
app.use(express.json());

// ── GET /api/articles ─────────────────────────────────────────────────────────
// Query params: category, country (default fr), limit (default 20), offset (default 0)
app.get("/api/articles", async (req, res) => {
  try {
    const { category, country = "fr", limit = 20, offset = 0 } = req.query;
    const safeLimit = Math.min(parseInt(limit), 50);

    let query = supabase
      .from("articles")
      .select("id, title, summary_fr, summary_en, key_points_fr, key_points_en, source, source_domain, source_url, category, accent_color, sentiment, image_url, url, pub_date, country")
      .eq("is_active", true)
      .eq("country", country)
      .order("pub_date", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + safeLimit - 1);

    if (category && category !== "all") query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, count: data.length, articles: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/articles/:id ─────────────────────────────────────────────────────
app.get("/api/articles/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("articles").select("*").eq("id", req.params.id).single();
    if (error || !data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, article: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/health ───────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  const { count } = await supabase
    .from("articles").select("*", { count: "exact", head: true }).eq("is_active", true);
  res.json({ status: "ok", articles: count, time: new Date().toISOString() });
});

// ── POST /api/pipeline/run ────────────────────────────────────────────────────
app.post("/api/pipeline/run", async (req, res) => {
  if (req.headers["x-pipeline-secret"] !== process.env.PIPELINE_SECRET) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  runPipeline().catch(console.error);
  res.json({ success: true, message: "Pipeline triggered" });
});

// ── Cron: 6am, 12pm, 6pm Paris time ─────────────────────────────────────────
cron.schedule(process.env.PIPELINE_CRON || "0 6,12,18 * * *", () => {
  console.log(`[CRON] Running pipeline at ${new Date().toLocaleString("fr-FR")}`);
  runPipeline().catch(console.error);
}, { timezone: "Europe/Paris" });

app.listen(PORT, () => {
  console.log(`\n🚀 Viee API → http://localhost:${PORT}/api/health\n`);
});

export default app;
