// ─── STEP 1: RSS FETCHER ─────────────────────────────────────────────────────

import RSSParser from "rss-parser";

const parser = new RSSParser({
  timeout: 10000,
  headers: {
    "User-Agent": "Viee News Bot/1.0",
    "Accept": "application/rss+xml, application/xml, text/xml",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
    ],
  },
});

export async function fetchFeed(feed, maxItems = 5) {
  try {
    const parsed = await parser.parseURL(feed.url);
    return parsed.items.slice(0, maxItems).map((item) => ({
      title:       item.title?.trim() || "",
      url:         item.link || item.guid || "",
      pub_date:    item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      source:      feed.source,
      category:    feed.category,
      country:     feed.country,
      rss_snippet: stripHtml(item.contentSnippet || item.content || item.summary || "").slice(0, 500),
      image_url:   extractImage(item),
    }));
  } catch (err) {
    console.error(`[RSS] Failed ${feed.source}: ${err.message}`);
    return [];
  }
}

export async function fetchAllFeeds(feeds, maxItems = 5) {
  console.log(`[RSS] Fetching ${feeds.length} feeds…`);
  const results = await Promise.allSettled(feeds.map(f => fetchFeed(f, maxItems)));
  const all = results.flatMap(r => r.status === "fulfilled" ? r.value : []);

  const seen = new Set();
  const unique = all.filter(item => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  console.log(`[RSS] ${unique.length} unique articles from ${feeds.length} feeds`);
  return unique;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ").trim();
}

function extractImage(item) {
  if (item.mediaContent?.["$"]?.url) return item.mediaContent["$"].url;
  if (item.mediaThumbnail?.["$"]?.url) return item.mediaThumbnail["$"].url;
  if (item.enclosure?.url && /\.(jpg|jpeg|png|webp)/i.test(item.enclosure.url)) return item.enclosure.url;
  const match = (item.content || item.summary || "").match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}
