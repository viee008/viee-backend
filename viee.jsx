import { useState, useRef, useEffect } from "react";

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  fr: {
    today: () => new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" }),
    skip:"PASSER", save:"SAUVER", swipeHint:"← Passer  ·  Sauver →",
    allDone:"Tout lu !", allDoneMsg:"Vous êtes à jour 🇫🇷", reload:"Recharger ↺",
    aiTitle:"ANALYSE IA", analyzing:"Analyse en cours…",
    aiSystem:"Analyste actu française. Réponds en français, style direct, incisif, pour jeunes cadres. 2-3 phrases max.",
    aiPrompt:(h)=>`Titres : ${h}. En 2-3 phrases percutantes, quelle tendance de fond ressort ?`,
    summarySystem:"Tu es journaliste français. Écris un résumé de 70-90 mots, style direct, factuel. Commence par les faits. Réponds uniquement avec le résumé.",
    summaryPrompt:(title,desc)=>`Titre : ${title}\nExtrait : ${desc}\n\nRésumé 70-90 mots :`,
    loadingNews:"Chargement de l'actu…", loadingSources:"Le Monde · Le Figaro · BFM",
    liveIndicator:"Actu en direct", fallbackNotice:"Mode démo — flux RSS indisponibles",
    undo:"↩ Annuler", articles:"articles",
    levelNames:["Novice","Lecteur","Chroniqueur","Rédacteur","Éditorialiste","Grand Reporter"],
    xpToNext:(n)=>`${n} XP pour le prochain niveau`,
    streakLabel:"Série", xpLabel:"XP", savedLabel:"Sauvés",
    challengeTitle:"Défi du jour", challengeDesc:"Lis 5 articles aujourd'hui",
    tabs:["Feed","Profil","Défis","Classement"],
    badgeLabels:["Série 3 jours","10 articles lus","Bilingue","1er défi","Top 10","Expert Tech"],
    leagueTitle:"Classement de la semaine", leagueSubtitle:"Top 10 qualifiés · Reset lundi",
    readOn:"Lire sur", aiSummaryLabel:(n)=>`Résumé IA · ${n} mots`,
    aiSummaryLoading:"✦ Résumé IA en cours…",
    ob_welcome:"Bienvenue sur viee.",
    ob_tagline:"L'actu française en 30 secondes,\nchaque matin.",
    ob_lang:"Choisissez votre langue",
    ob_topics:"Quels sujets vous intéressent ?",
    ob_topics_sub:"Choisissez au moins 2",
    ob_name:"Comment vous appelez-vous ?",
    ob_name_placeholder:"Votre prénom…",
    ob_name_skip:"Passer",
    ob_finish:"C'est parti ! 🚀",
    ob_finish_sub:"Votre feed personnalisé est prêt",
    ob_step_lang:"Langue",
    ob_step_topics:"Sujets",
    ob_step_name:"Profil",
    ob_topics_list:[
      {id:"headlines", emoji:"🗞️", label:"À la Une"},
      {id:"politique", emoji:"🏛️", label:"Politique"},
      {id:"tech",      emoji:"💡", label:"Tech"},
      {id:"economie",  emoji:"📈", label:"Économie"},
      {id:"culture",   emoji:"🎬", label:"Culture"},
      {id:"social",    emoji:"🔥", label:"Buzz Social"},
    ],
    cat:{ all:"Tout", headlines:"À la Une", politique:"Politique", tech:"Tech", economie:"Économie", culture:"Culture", social:"Buzz" },
    catEmoji:{ all:"⚡", headlines:"🗞️", politique:"🏛️", tech:"💡", economie:"📈", culture:"🎬", social:"🔥" },
  },
  en: {
    today: () => new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" }),
    skip:"SKIP", save:"SAVE", swipeHint:"← Skip  ·  Save →",
    allDone:"All caught up!", allDoneMsg:"You're up to date 🇫🇷", reload:"Reload ↺",
    aiTitle:"AI INSIGHT", analyzing:"Analysing…",
    aiSystem:"French news analyst. Reply in English, direct style, for young professionals. Max 2-3 sentences.",
    aiPrompt:(h)=>`Headlines: ${h}. In 2-3 sharp sentences, what underlying trend stands out?`,
    summarySystem:"You are a journalist. Write a 70-90 word summary, direct factual style. Start with the facts. Respond only with the summary.",
    summaryPrompt:(title,desc)=>`Headline: ${title}\nExcerpt: ${desc}\n\nSummary in 70-90 words:`,
    loadingNews:"Loading news…", loadingSources:"Le Monde · Le Figaro · BFM",
    liveIndicator:"Live news", fallbackNotice:"Demo mode — RSS feeds unavailable",
    undo:"↩ Undo", articles:"articles",
    levelNames:["Novice","Reader","Reporter","Editor","Columnist","Chief Editor"],
    xpToNext:(n)=>`${n} XP to next level`,
    streakLabel:"Streak", xpLabel:"XP", savedLabel:"Saved",
    challengeTitle:"Daily Challenge", challengeDesc:"Read 5 articles today",
    tabs:["Feed","Profile","Challenges","Leaderboard"],
    badgeLabels:["3-day streak","10 articles read","Bilingual","First challenge","Top 10","Tech Expert"],
    leagueTitle:"Weekly Leaderboard", leagueSubtitle:"Top 10 qualify · Resets Monday",
    readOn:"Read on", aiSummaryLabel:(n)=>`AI summary · ${n} words`,
    aiSummaryLoading:"✦ AI summary loading…",
    ob_welcome:"Welcome to viee.",
    ob_tagline:"French news in 30 seconds,\nevery morning.",
    ob_lang:"Choose your language",
    ob_topics:"What topics interest you?",
    ob_topics_sub:"Pick at least 2",
    ob_name:"What's your name?",
    ob_name_placeholder:"Your first name…",
    ob_name_skip:"Skip",
    ob_finish:"Let's go! 🚀",
    ob_finish_sub:"Your personalised feed is ready",
    ob_step_lang:"Language",
    ob_step_topics:"Topics",
    ob_step_name:"Profile",
    ob_topics_list:[
      {id:"headlines", emoji:"🗞️", label:"Headlines"},
      {id:"politique", emoji:"🏛️", label:"Politics"},
      {id:"tech",      emoji:"💡", label:"Tech"},
      {id:"economie",  emoji:"📈", label:"Economy"},
      {id:"culture",   emoji:"🎬", label:"Culture"},
      {id:"social",    emoji:"🔥", label:"Social Buzz"},
    ],
    cat:{ all:"All", headlines:"Headlines", politique:"Politics", tech:"Tech", economie:"Economy", culture:"Culture", social:"Buzz" },
    catEmoji:{ all:"⚡", headlines:"🗞️", politique:"🏛️", tech:"💡", economie:"📈", culture:"🎬", social:"🔥" },
  },
};

// ─── SOURCES ────────────────────────────────────────────────────────────────
const SOURCES = {
  "Le Monde":    { domain:"lemonde.fr",      url:"https://www.lemonde.fr" },
  "Le Figaro":   { domain:"lefigaro.fr",     url:"https://www.lefigaro.fr" },
  "BFM Business":{ domain:"bfmtv.com",       url:"https://www.bfmtv.com" },
  "Libération":  { domain:"liberation.fr",   url:"https://www.liberation.fr" },
  "Télérama":    { domain:"telerama.fr",     url:"https://www.telerama.fr" },
  "France Info": { domain:"francetvinfo.fr", url:"https://www.francetvinfo.fr" },
  "20 Minutes":  { domain:"20minutes.fr",    url:"https://www.20minutes.fr" },
  "Le Figaro":   { domain:"lefigaro.fr",     url:"https://www.lefigaro.fr" },
  "L'Équipe":    { domain:"lequipe.fr",      url:"https://www.lequipe.fr" },
  "01Net":       { domain:"01net.com",       url:"https://www.01net.com" },
  "Télérama":    { domain:"telerama.fr",     url:"https://www.telerama.fr" },
};

// ─── RSS CONFIG ──────────────────────────────────────────────────────────────
const ACCENT = { headlines:"#FF4D4D", politique:"#EAB308", tech:"#7C3AED", economie:"#10B981", culture:"#EC4899", social:"#F97316" };
const FALLBACK_IMG = {
  headlines:"https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&q=80",
  politique:"https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=700&q=80",
  tech:"https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=700&q=80",
  economie:"https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=80",
  culture:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&q=80",
  social:"https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=700&q=80",
};

// ─── BACKEND API ─────────────────────────────────────────────────────────────
const API_URL = "https://viee-backend-production.up.railway.app";

async function fetchFromBackend() {
  const res  = await fetch(`${API_URL}/api/articles?limit=24`);
  const data = await res.json();
  if (!data.success || !data.articles?.length) throw new Error("No articles");
  return data.articles.map(a => ({
    id:        String(a.id),
    category:  a.category,
    source:    a.source,
    pubDate:   a.pub_date,
    headline:  a.title,
    rawDesc:   a.summary_fr || "",
    summary:   a.summary_fr || null,
    summaryEn: a.summary_en || null,
    keyPoints: a.key_points_fr || [],
    photo:     a.image_url || FALLBACK_IMG[a.category] || FALLBACK_IMG.headlines,
    accent:    a.accent_color || ACCENT[a.category] || "#FF6B00",
    url:       a.url,
    isReal:    true,
  }));
}

function timeAgo(str, lang) {
  const d = Math.floor((Date.now() - new Date(str)) / 1000);
  if (lang === "fr") {
    if (d < 60) return "À l'instant";
    if (d < 3600) return `il y a ${Math.floor(d/60)} min`;
    if (d < 86400) return `il y a ${Math.floor(d/3600)}h`;
    return `il y a ${Math.floor(d/86400)} j`;
  }
  if (d < 60) return "Just now";
  if (d < 3600) return `${Math.floor(d/60)}m ago`;
  if (d < 86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}

// ─── MOCK FALLBACK ───────────────────────────────────────────────────────────
const MOCK = [
  { id:"m1", category:"headlines", source:"Le Monde", pubDate:new Date().toISOString(), isReal:false,
    headline:"Réforme des retraites : le gouvernement annonce de nouvelles concessions",
    rawDesc:"Face à la pression syndicale, le Premier ministre présente un plan d'ajustement qui revoit l'âge pivot à 64 ans pour certaines professions pénibles. Un vote est attendu à l'Assemblée nationale jeudi, dans un contexte de forte tension politique.",
    summary:"Face à une mobilisation syndicale persistante, le Premier ministre a présenté un plan d'ajustement sur la réforme des retraites. L'âge pivot est revu à 64 ans pour les professions reconnues pénibles, tout en maintenant les grands équilibres budgétaires. Les syndicats annoncent poursuivre la pression malgré ces concessions. Un vote solennel est attendu à l'Assemblée nationale jeudi, dans un hémicycle sous haute tension politique et sociale.",
    keyPoints:["Âge pivot revu à 64 ans","Exceptions métiers pénibles","Vote Assemblée jeudi"],
    photo:"https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=700&q=80", accent:"#FF4D4D", url:"https://www.lemonde.fr" },
  { id:"m2", category:"tech", source:"Les Échos", pubDate:new Date().toISOString(), isReal:false,
    headline:"Mistral AI lève 600M€ et défie OpenAI sur le marché européen",
    rawDesc:"La startup parisienne Mistral AI boucle un tour de table de 600 millions d'euros, portant sa valorisation à plus de 6 milliards. Elle s'impose comme le principal concurrent européen d'OpenAI grâce à ses modèles open-source.",
    summary:"La startup parisienne Mistral AI boucle un tour de table de 600 millions d'euros, portant sa valorisation à plus de 6 milliards. Fondée il y a moins de deux ans, elle s'impose comme le principal concurrent européen d'OpenAI grâce à ses modèles open-source souverains, plébiscités par les entreprises soucieuses de confidentialité. Une expansion en Allemagne et au Royaume-Uni est prévue dès le trimestre prochain.",
    keyPoints:["Valorisation 6 Mds€","Modèle open-source","Expansion UK & DE"],
    photo:"https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=700&q=80", accent:"#7C3AED", url:"https://www.lesechos.fr" },
  { id:"m3", category:"economie", source:"BFM Business", pubDate:new Date().toISOString(), isReal:false,
    headline:"L'inflation recule à 2.1% en France, pouvoir d'achat sous pression",
    rawDesc:"L'INSEE confirme la décélération de l'inflation à 2,1% portée par la baisse des prix de l'énergie. Les prix alimentaires restent élevés à +4,2%, pénalisant les ménages modestes.",
    summary:"L'INSEE publie ses derniers chiffres : l'inflation française retombe à 2,1% en glissement annuel contre 2,9% le mois précédent. Cette décélération est tirée par la baisse des prix de l'énergie, en recul de 8% sur un an. Les prix alimentaires restent obstinément élevés à +4,2%, pénalisant les ménages modestes. Les économistes restent prudents quant à une véritable détente du pouvoir d'achat.",
    keyPoints:["Inflation 2.1%","Énergie −8%","Alimentation +4.2%"],
    photo:"https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=80", accent:"#10B981", url:"https://www.bfmtv.com" },
  { id:"m4", category:"culture", source:"Télérama", pubDate:new Date().toISOString(), isReal:false,
    headline:"César 2025 : 'L'Amour Ouf' domine avec 11 nominations record",
    rawDesc:"Le film de Gilles Lellouche rafle 11 nominations aux César 2025, un record pour cette édition. Adèle Exarchopoulos et François Civil sont en lice pour les prix d'interprétation.",
    summary:"Le film de Gilles Lellouche, fresque romantique sur fond de banlieue des années 80, rafle 11 nominations aux César 2025, un record pour cette édition. Adèle Exarchopoulos et François Civil sont tous deux en lice pour les prix d'interprétation. Plusieurs outsiders créent la surprise dans les catégories techniques. La cérémonie, prévue le 28 février à l'Olympia, s'annonce particulièrement disputée.",
    keyPoints:["11 nominations record","Exarchopoulos & Civil nommés","Cérémonie 28 février"],
    photo:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&q=80", accent:"#EC4899", url:"https://www.telerama.fr" },
  { id:"m5", category:"politique", source:"Libération", pubDate:new Date().toISOString(), isReal:false,
    headline:"Sondage : la gauche unie dépasserait le RN pour la première fois en 18 mois",
    rawDesc:"Un sondage IFOP place le Nouveau Front Populaire à 31% des intentions de vote, soit deux points au-dessus du RN. Cette dynamique reste fragile selon les analystes.",
    summary:"Un sondage IFOP publié ce matin place le Nouveau Front Populaire à 31% des intentions de vote, soit deux points au-dessus du Rassemblement National pour la première fois depuis dix-huit mois. Renaissance chute à 18%. Cette dynamique reste fragile : les analystes soulignent que l'unité de la gauche sur les questions économiques sera déterminante pour confirmer cette tendance.",
    keyPoints:["NFP 31% (+3pts)","RN 29% (−1pt)","Renaissance 18%"],
    photo:"https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=700&q=80", accent:"#EAB308", url:"https://www.liberation.fr" },
  { id:"m6", category:"social", source:"20 Minutes", pubDate:new Date().toISOString(), isReal:false,
    headline:"#GreveSNCF : chaos ferroviaire, 40 000 tweets en moins de 2 heures",
    rawDesc:"Une grève surprise paralyse les grandes lignes SNCF ce matin. En deux heures, 40 000 tweets ont déferlé entre témoignages, mèmes et colère.",
    summary:"Une grève surprise déclenchée à 6h du matin paralyse les grandes lignes SNCF, pris de court par un mouvement non annoncé. En deux heures, plus de 40 000 tweets ont déferlé sous le hashtag #GreveSNCF, entre témoignages de voyageurs bloqués, mèmes désabusés et critiques acérées. Le sujet s'est hissé en tête des tendances nationales, révélant une exaspération profonde envers les perturbations ferroviaires récurrentes.",
    keyPoints:["40k tweets en 2h","Trending #1 France","Grève non annoncée"],
    photo:"https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=700&q=80", accent:"#F97316", url:"https://www.20minutes.fr" },
];

// ─── GAMIFICATION ────────────────────────────────────────────────────────────
const XP_THRESHOLDS = [0, 100, 250, 500, 900, 1500];
function getLevelInfo(xp) {
  let lvl = 0;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) { if (xp >= XP_THRESHOLDS[i]) { lvl = i; break; } }
  const next = XP_THRESHOLDS[lvl + 1] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const curr = XP_THRESHOLDS[lvl];
  return { lvl, progress: Math.min(1, (xp - curr) / (next - curr)), xpToNext: Math.max(0, next - xp) };
}

const LEADERBOARD_DATA = [
  { name:"Sophie M.", xp:1240, flag:"🇫🇷" }, { name:"Lucas B.", xp:1180, flag:"🇫🇷" },
  { name:"Emma R.",   xp:890,  flag:"🇫🇷" }, { name:"Thomas K.", xp:820, flag:"🇩🇪" },
  { name:"Marie L.",  xp:760,  flag:"🇫🇷" }, { name:"Pablo G.",  xp:650, flag:"🇪🇸" },
  { name:"Anna W.",   xp:580,  flag:"🇩🇪" }, { name:"Lena P.",   xp:420, flag:"🇫🇷" },
];

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function SourceBadge({ source }) {
  const s = SOURCES[source];
  if (!s) return null;
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
      style={{ position:"absolute", top:14, right:14, display:"flex", alignItems:"center", gap:5,
        background:"rgba(0,0,0,0.65)", backdropFilter:"blur(10px)", borderRadius:20,
        padding:"5px 10px 5px 6px", textDecoration:"none", border:"1px solid rgba(255,255,255,0.13)", zIndex:5 }}>
      <img src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`} alt={source}
        style={{ width:15, height:15, borderRadius:3 }} onError={e => { e.target.style.display="none"; }} />
      <span style={{ color:"rgba(255,255,255,0.9)", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:11 }}>{source}</span>
    </a>
  );
}

function StreakRing({ streak, size = 44 }) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#FF6B00" strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(1, streak / 7))} strokeLinecap="round" />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize: size > 50 ? 16 : 12 }}>🔥</span>
        <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize: size > 50 ? 11 : 9, color:"#FF6B00", lineHeight:1 }}>{streak}</span>
      </div>
    </div>
  );
}

function XPToast({ amount, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", top:72, left:"50%", transform:"translateX(-50%)", zIndex:999,
      background:"#FFD700", color:"#000", borderRadius:30, padding:"8px 20px",
      fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:15,
      boxShadow:"0 8px 30px rgba(255,215,0,0.5)", animation:"xpPop 0.3s ease", whiteSpace:"nowrap" }}>
      +{amount} XP ⚡
    </div>
  );
}

function CelebrationOverlay({ text, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)" }}>
      <div style={{ textAlign:"center", animation:"celebPop 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ fontSize:72, marginBottom:12 }}>🎉</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:28, color:"#FFD700" }}>{text}</div>
      </div>
    </div>
  );
}

function SkeletonCard({ opacity = 1 }) {
  return (
    <div style={{ borderRadius:20, overflow:"hidden", background:"#141414", border:"1px solid rgba(255,255,255,0.05)", opacity }}>
      <div style={{ height:200, background:"linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%)", backgroundSize:"400px 100%", animation:"shimmer 1.4s infinite" }} />
      <div style={{ padding:"14px 16px" }}>
        {[95,80,65,45].map((w,i) => (
          <div key={i} style={{ height:10, borderRadius:5, marginBottom:8, width:`${w}%`,
            background:"linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%)",
            backgroundSize:"400px 100%", animation:"shimmer 1.4s infinite" }} />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("fr");
  const t = T[lang];

  // Onboarding
  const [onboarded, setOnboarded] = useState(false);
  const [obStep, setObStep]       = useState(0); // 0=lang, 1=topics, 2=name
  const [obTopics, setObTopics]   = useState([]);
  const [obName, setObName]       = useState("");
  const [obAnimating, setObAnimating] = useState(false);

  // News
  const [cards, setCards]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [isDemoMode, setDemoMode] = useState(false);

  // Gamification
  const [xp, setXP]             = useState(120);
  const [streak, setStreak]     = useState(3);
  const [dailyCount, setDaily]  = useState(2);
  const [xpToast, setXpToast]   = useState(null);
  const [celebrate, setCelebrate] = useState(null);

  // UI
  const [activeTab, setTab]         = useState(0);
  const [activeCategory, setCategory] = useState("all");
  const [saved, setSaved]           = useState([]);
  const [history, setHistory]       = useState([]);
  const [showAI, setShowAI]         = useState(false);
  const [aiText, setAiText]         = useState("");
  const [aiLoading, setAiLoading]   = useState(false);
  const [imgErr, setImgErr]         = useState({});

  // AI summaries per card
  const [summaries, setSummaries]       = useState({});
  const [summaryLoading, setSummaryLoading] = useState(null);

  // Swipe
  const [drag, setDrag]       = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(null);

  // ── Load articles from backend on mount ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const articles = await fetchFromBackend();
        setCards(articles);
        setDemoMode(false);
      } catch {
        setCards(MOCK);
        setDemoMode(true);
      }
      setLoading(false);
    };
    load();
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────
  const filtered = activeCategory === "all" ? cards : cards.filter(c => c.category === activeCategory);
  const topCard  = filtered[0];
  const behind   = filtered.slice(1, 3);

  // ── Summary per card — served from backend, no API call needed ──────────
  useEffect(() => {
    if (!topCard) return;
    const key = `${topCard.id}-${lang}`;
    if (summaries[key]) return;
    const text = lang === "en"
      ? (topCard.summaryEn || topCard.summary || topCard.rawDesc || topCard.headline)
      : (topCard.summary   || topCard.rawDesc || topCard.headline);
    setSummaries(p => ({ ...p, [key]: text }));
  }, [topCard?.id, lang]);

  // ── XP helpers ───────────────────────────────────────────────────────────
  const award = (amount) => { setXP(p => p + amount); setXpToast(amount); };

  // ── Swipe handlers ───────────────────────────────────────────────────────
  const onStart = (x) => { startX.current = x; };
  const onMove  = (x) => {
    if (startX.current === null) return;
    const d = x - startX.current;
    if (Math.abs(d) > 5) setDragging(true);
    setDrag(d);
  };
  const onEnd = () => {
    if (Math.abs(drag) > 85) doSwipe(drag > 0 ? "right" : "left");
    else { setDrag(0); setDragging(false); startX.current = null; }
  };
  const doSwipe = (dir) => {
    if (!topCard) return;
    setDrag(dir === "right" ? 700 : -700);
    setTimeout(() => {
      if (dir === "right") { setSaved(p => [topCard, ...p]); award(20); }
      else award(5);
      const n = dailyCount + 1;
      setDaily(n);
      if (n === 5) setCelebrate(lang === "fr" ? "🎉 Défi accompli !" : "🎉 Challenge done!");
      setCards(p => p.filter(c => c.id !== topCard.id));
      setHistory(p => [...p, { article:topCard, dir }]);
      setDrag(0); setDragging(false); startX.current = null;
    }, 270);
  };
  const undo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setCards(p => [last.article, ...p]);
    if (last.dir === "right") setSaved(p => p.filter(s => s.id !== last.article.id));
    setHistory(p => p.slice(0, -1));
  };

  // ── Global AI analysis ───────────────────────────────────────────────────
  const fetchAI = async () => {
    setAiLoading(true); setShowAI(true);
    const heads = filtered.slice(0, 5).map(a => a.headline).join(" | ");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system: t.aiSystem,
          messages:[{ role:"user", content: t.aiPrompt(heads) }]
        })
      });
      const data = await res.json();
      setAiText(data.content?.[0]?.text || "—");
    } catch { setAiText("Indisponible."); }
    setAiLoading(false);
  };

  // ── Reload ───────────────────────────────────────────────────────────────
  const reload = async () => {
    setLoading(true); setHistory([]);
    try {
      const articles = await fetchFromBackend();
      setCards(articles);
      setDemoMode(false);
    } catch {
      setCards(MOCK);
      setDemoMode(true);
    }
    setLoading(false);
  };

  // ── Derived display ──────────────────────────────────────────────────────
  const rot       = drag * 0.04;
  const cardOpacity = Math.max(0.15, 1 - Math.abs(drag) / 380);
  const likeOpa   = Math.min(1, Math.max(0, drag / 90));
  const skipOpa   = Math.min(1, Math.max(0, -drag / 90));
  const CATS      = Object.keys(t.cat).map(id => ({ id, label:t.cat[id], emoji:t.catEmoji[id] }));

  const getDisplaySummary = (card) => {
    const key = `${card.id}-${lang}`;
    return summaries[key] || null;
  };
  const wc = (text) => text.trim().split(/\s+/).length;

  // ─── PROFILE — THE GARDEN ──────────────────────────────────────────────────
  const { lvl, progress, xpToNext } = getLevelInfo(xp);

  // Garden: each plant unlocks at a certain total-articles-read count
  // dailyCount is used as proxy for total articles read in this session
  const totalRead = dailyCount;

  // Deterministic plant positions — fixed grid so garden looks intentional
  const GARDEN_PLANTS = [
    // [id, unlockAt, emoji, label_fr, label_en, x%, y%, size, animDelay]
    [0,  1,  "🌱", "Premier article",    "First article",     18, 72, 1.0, 0.0],
    [1,  2,  "🌿", "2 articles",         "2 articles",        38, 78, 1.1, 0.1],
    [2,  3,  "🌸", "3 articles",         "3 articles",        62, 70, 1.2, 0.2],
    [3,  5,  "🌻", "5 articles",         "5 articles",        80, 75, 1.3, 0.0],
    [4,  7,  "🌺", "7 articles",         "7 articles",        25, 55, 1.1, 0.3],
    [5,  10, "🌳", "10 articles",        "10 articles",       50, 60, 1.5, 0.1],
    [6,  12, "🦋", "12 articles",        "12 articles",       72, 52, 1.0, 0.4],
    [7,  15, "🌴", "15 articles",        "15 articles",       12, 45, 1.4, 0.2],
    [8,  18, "🌼", "18 articles",        "18 articles",       88, 44, 1.1, 0.0],
    [9,  20, "🍄", "20 articles",        "20 articles",       40, 42, 1.2, 0.3],
    [10, 25, "🦚", "25 articles",        "25 articles",       65, 35, 1.3, 0.1],
    [11, 30, "🌈", "30 articles",        "30 articles",       22, 30, 1.5, 0.2],
    [12, 40, "⭐", "40 articles",        "40 articles",       55, 25, 1.6, 0.0],
    [13, 50, "🌙", "50 articles",        "50 articles",       80, 22, 1.4, 0.4],
    [14, 75, "🦁", "75 articles",        "75 articles",       35, 15, 1.7, 0.1],
    [15, 100,"🏆", "100 articles",       "100 articles",      65, 10, 2.0, 0.0],
  ];

  const nextPlant = GARDEN_PLANTS.find(p => p[1] > totalRead);
  const unlockedCount = GARDEN_PLANTS.filter(p => p[1] <= totalRead).length;

  const ProfileTab = () => {
    const [hoveredPlant, setHoveredPlant] = useState(null);

    return (
      <div style={{ overflowY:"auto", flex:1, display:"flex", flexDirection:"column" }}>

        {/* ── USER HEADER ── */}
        <div style={{ padding:"20px 18px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
            <div style={{ width:50, height:50, borderRadius:"50%", background:"linear-gradient(135deg,#FF6B00,#FFD700)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
              {obName ? obName[0].toUpperCase() : "👤"}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:17, color:"#fff" }}>
                {obName || (lang === "fr" ? "Mon Jardin" : "My Garden")}
              </div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:1 }}>
                {t.levelNames[lvl]} · {totalRead} {lang==="fr"?"articles lus":"articles read"}
              </div>
            </div>
            <StreakRing streak={streak} size={50} />
          </div>

          {/* XP bar */}
          <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"12px 14px", marginBottom:14, border:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:11, color:"#FFD700" }}>{t.levelNames[lvl]} · Niv {lvl+1}</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:11, color:"rgba(255,255,255,0.3)" }}>{xp} XP</span>
            </div>
            <div style={{ height:7, background:"rgba(255,255,255,0.08)", borderRadius:6, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progress*100}%`, background:"linear-gradient(90deg,#FFD700,#FF6B00)", borderRadius:6, transition:"width 0.6s ease" }} />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:18 }}>
            {[["🔥",streak,t.streakLabel],["📖",totalRead,lang==="fr"?"Lus":"Read"],["🔖",saved.length,t.savedLabel]].map(([icon,val,label],i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"11px 8px", textAlign:"center", border:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize:18, marginBottom:3 }}>{icon}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:"#fff" }}>{val}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:9, color:"rgba(255,255,255,0.3)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── GARDEN TITLE ── */}
        <div style={{ padding:"0 18px 10px", display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:"#fff" }}>
              {lang==="fr" ? "🌿 Votre Jardin" : "🌿 Your Garden"}
            </div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:2 }}>
              {unlockedCount === 0
                ? (lang==="fr" ? "Lisez votre 1er article pour planter une graine" : "Read your 1st article to plant a seed")
                : lang==="fr"
                  ? `${unlockedCount} plante${unlockedCount>1?"s":""} · ${nextPlant ? `prochain à ${nextPlant[1]} articles` : "Jardin complet 🏆"}`
                  : `${unlockedCount} plant${unlockedCount>1?"s":""} · ${nextPlant ? `next at ${nextPlant[1]} articles` : "Garden complete 🏆"}`
              }
            </div>
          </div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,107,0,0.7)", fontWeight:700 }}>
            {unlockedCount}/{GARDEN_PLANTS.length}
          </div>
        </div>

        {/* ── THE GARDEN ── */}
        <div style={{ margin:"0 18px", borderRadius:22, overflow:"hidden", position:"relative", height:280, flexShrink:0,
          background:"linear-gradient(180deg, #0a1a0a 0%, #0d2210 40%, #142e0f 70%, #1a3a12 100%)",
          border:"1px solid rgba(255,255,255,0.06)",
          boxShadow:"inset 0 -20px 40px rgba(0,0,0,0.4), inset 0 20px 40px rgba(0,0,0,0.2)"
        }}>
          {/* Sky gradient */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"45%", background:"linear-gradient(180deg,#0a0f1a 0%,transparent 100%)", pointerEvents:"none" }} />

          {/* Stars in sky */}
          {unlockedCount > 5 && [
            [15,8],[35,12],[55,6],[75,10],[88,15],[8,18],[48,4],[68,8]
          ].map(([x,y],i) => (
            <div key={i} style={{ position:"absolute", left:`${x}%`, top:`${y}%`, width: i%3===0?3:2, height:i%3===0?3:2, borderRadius:"50%", background:"#fff", opacity:0.4+i*0.04, animation:`twinkle ${2+i*0.3}s infinite alternate` }} />
          ))}

          {/* Moon if 15+ plants */}
          {unlockedCount >= 10 && (
            <div style={{ position:"absolute", top:12, right:20, fontSize:22, opacity:0.7, animation:"float 4s ease-in-out infinite" }}>🌙</div>
          )}

          {/* Ground */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"35%",
            background:"linear-gradient(180deg, transparent 0%, rgba(20,50,10,0.6) 30%, #0d2210 100%)",
            borderRadius:"0 0 20px 20px"
          }} />

          {/* Ground texture dots */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"20%",
            background:"radial-gradient(ellipse at 50% 100%, rgba(30,80,20,0.8) 0%, transparent 70%)"
          }} />

          {/* Next plant preview (locked, ghost) */}
          {nextPlant && (
            <div style={{ position:"absolute", left:`${nextPlant[6]}%`, top:`${nextPlant[7]}%`, transform:"translate(-50%,-100%)", opacity:0.2, fontSize:`${nextPlant[8]*24}px`, filter:"grayscale(1) blur(1px)", transition:"all 0.3s" }}>
              {nextPlant[2]}
            </div>
          )}

          {/* Progress ring around next plant */}
          {nextPlant && (() => {
            const prev = GARDEN_PLANTS[nextPlant[0]-1];
            const prevCount = prev ? prev[1] : 0;
            const pct = Math.min(1,(totalRead - prevCount) / (nextPlant[1] - prevCount));
            const r = 22; const circ = 2*Math.PI*r;
            return (
              <div style={{ position:"absolute", left:`${nextPlant[6]}%`, top:`${nextPlant[7]}%`, transform:"translate(-50%,-130%)", zIndex:3 }}>
                <svg width={52} height={52} style={{ transform:"rotate(-90deg)" }}>
                  <circle cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2.5}/>
                  <circle cx={26} cy={26} r={r} fill="none" stroke="#FF6B00" strokeWidth={2.5}
                    strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"/>
                </svg>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, filter:"grayscale(1)", opacity:0.35 }}>
                  {nextPlant[2]}
                </div>
              </div>
            );
          })()}

          {/* Unlocked plants */}
          {GARDEN_PLANTS.filter(p => p[1] <= totalRead).map((plant) => {
            const [id,,emoji,labelFr,labelEn,x,y,size,delay] = plant;
            const isHovered = hoveredPlant === id;
            return (
              <div key={id}
                onMouseEnter={() => setHoveredPlant(id)}
                onMouseLeave={() => setHoveredPlant(null)}
                onTouchStart={() => setHoveredPlant(id)}
                onTouchEnd={() => setTimeout(()=>setHoveredPlant(null),1500)}
                style={{ position:"absolute", left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-100%)",
                  fontSize:`${size*24}px`, cursor:"default",
                  animation:`plantSway ${3+delay*2}s ease-in-out infinite`,
                  animationDelay:`${delay}s`,
                  filter: isHovered ? "drop-shadow(0 0 12px rgba(255,220,50,0.8))" : "none",
                  transition:"filter 0.2s", zIndex:2
                }}>
                {emoji}
                {/* Tooltip */}
                {isHovered && (
                  <div style={{ position:"absolute", bottom:"110%", left:"50%", transform:"translateX(-50%)", whiteSpace:"nowrap",
                    background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", borderRadius:10, padding:"5px 10px",
                    fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:700, color:"#FFD700",
                    border:"1px solid rgba(255,215,0,0.25)", pointerEvents:"none", zIndex:10
                  }}>
                    {lang==="fr" ? labelFr : labelEn}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state message */}
          {unlockedCount === 0 && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
              <div style={{ fontSize:36, opacity:0.3 }}>🌱</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"rgba(255,255,255,0.25)", textAlign:"center", padding:"0 30px" }}>
                {lang==="fr" ? "Votre jardin attend sa première graine…" : "Your garden awaits its first seed…"}
              </div>
            </div>
          )}
        </div>

        {/* ── NEXT UNLOCK ── */}
        {nextPlant && (
          <div style={{ margin:"12px 18px 0", background:"rgba(255,107,0,0.07)", border:"1px solid rgba(255,107,0,0.18)", borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:28, filter:"grayscale(0.5)", opacity:0.6 }}>{nextPlant[2]}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, color:"rgba(255,255,255,0.7)", marginBottom:6 }}>
                {lang==="fr" ? `Prochain : ${nextPlant[3]}` : `Next: ${nextPlant[4]}`}
              </div>
              <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:4, overflow:"hidden" }}>
                {(() => {
                  const prev = GARDEN_PLANTS[nextPlant[0]-1];
                  const prevCount = prev ? prev[1] : 0;
                  const pct = Math.min(1,(totalRead - prevCount)/(nextPlant[1]-prevCount))*100;
                  return <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#FF6B00,#FFD700)", borderRadius:4, transition:"width 0.5s" }} />;
                })()}
              </div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, color:"rgba(255,255,255,0.28)", marginTop:4 }}>
                {nextPlant[1] - totalRead} {lang==="fr" ? "articles restants" : "articles to go"}
              </div>
            </div>
          </div>
        )}

        {/* ── PLANT COLLECTION ── */}
        <div style={{ padding:"16px 18px 10px" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:12, letterSpacing:"0.5px" }}>
            {lang==="fr" ? "COLLECTION" : "COLLECTION"} · {unlockedCount}/{GARDEN_PLANTS.length}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {GARDEN_PLANTS.map(([id,,emoji,labelFr,labelEn,,,,delay,unlockAt]) => {
              const earned = id < unlockedCount || GARDEN_PLANTS[id]?.[1] <= totalRead;
              return (
                <div key={id} style={{ width:44, height:44, borderRadius:12,
                  background: earned ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
                  border: earned ? "1px solid rgba(255,215,0,0.2)" : "1px solid rgba(255,255,255,0.05)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:22, opacity: earned ? 1 : 0.25,
                  filter: earned ? "none" : "grayscale(1)"
                }}>
                  {emoji}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── LANGUAGE TOGGLE ── */}
        <div style={{ margin:"8px 18px 20px", background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", border:"1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, color:"rgba(255,255,255,0.55)" }}>🌍 Langue</span>
          <div style={{ display:"flex", background:"rgba(255,255,255,0.06)", borderRadius:10, padding:3 }}>
            {["fr","en"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding:"5px 14px", borderRadius:8, border:"none", cursor:"pointer", background:lang===l?"#FF6B00":"transparent", color:lang===l?"#fff":"rgba(255,255,255,0.4)", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, transition:"all 0.2s" }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── CHALLENGES ───────────────────────────────────────────────────────────
  const ChallengesTab = () => (
    <div style={{ padding:"20px 18px", overflowY:"auto", flex:1 }}>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:"#fff", marginBottom:4 }}>{t.challengeTitle}</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"rgba(255,255,255,0.3)", marginBottom:18 }}>{t.today()}</div>
      {[
        { icon:"📰", title:t.challengeDesc, p:dailyCount, total:5, reward:50 },
        { icon:"🏛️", title:lang==="fr"?"3 articles Politique":"3 Politics articles", p:1, total:3, reward:30 },
        { icon:"🔥", title:lang==="fr"?"Maintiens ta série 7 jours":"7-day streak", p:streak, total:7, reward:100 },
        { icon:"💡", title:lang==="fr"?"5 articles Tech":"5 Tech articles", p:0, total:5, reward:40 },
      ].map((c,i) => (
        <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:16, padding:16, marginBottom:10, border:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:24 }}>{c.icon}</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, color:"#fff", lineHeight:1.3 }}>{c.title}</span>
            </div>
            <div style={{ background:"rgba(255,215,0,0.12)", borderRadius:8, padding:"3px 8px", flexShrink:0 }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:11, color:"#FFD700" }}>+{c.reward} XP</span>
            </div>
          </div>
          <div style={{ height:8, background:"rgba(255,255,255,0.07)", borderRadius:8, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min(1,c.p/c.total)*100}%`, background:"linear-gradient(90deg,#FF6B00,#FFD700)", borderRadius:8, transition:"width 0.5s ease" }} />
          </div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, color:"rgba(255,255,255,0.28)", marginTop:5 }}>{c.p}/{c.total}</div>
        </div>
      ))}
    </div>
  );

  // ─── LEADERBOARD ──────────────────────────────────────────────────────────
  const LeaderboardTab = () => {
    const board = [...LEADERBOARD_DATA, { name:lang==="fr"?"Vous":"You", xp, flag:"🇫🇷", isYou:true }]
      .sort((a,b) => b.xp - a.xp);
    return (
      <div style={{ padding:"20px 18px", overflowY:"auto", flex:1 }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:"#fff", marginBottom:4 }}>{t.leagueTitle}</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"rgba(255,255,255,0.3)", marginBottom:18 }}>{t.leagueSubtitle}</div>
        {board.map((u,i) => (
          <div key={i} style={{ background:u.isYou?"rgba(255,107,0,0.12)":"rgba(255,255,255,0.03)", border:u.isYou?"1px solid rgba(255,107,0,0.35)":"1px solid rgba(255,255,255,0.05)", borderRadius:14, padding:"13px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:28, textAlign:"center", fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:15, color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"rgba(255,255,255,0.28)", flexShrink:0 }}>
              {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
            </div>
            <span style={{ fontSize:18 }}>{u.flag}</span>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:u.isYou?900:700, fontSize:13, color:u.isYou?"#FF6B00":"rgba(255,255,255,0.8)", flex:1 }}>
              {u.name}{u.isYou ? ` (${lang==="fr"?"Vous":"You"})` : ""}
            </span>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:"#FFD700" }}>{u.xp}</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, color:"rgba(255,255,255,0.28)" }}>XP</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ─── FEED ─────────────────────────────────────────────────────────────────
  const FeedTab = () => (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>

      {/* Loading overlay */}
      {loading && (
        <div style={{ position:"absolute", inset:0, zIndex:50, background:"#090909", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, padding:"0 24px" }}>
          <div style={{ position:"relative", width:64, height:64 }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid rgba(255,107,0,0.15)" }} />
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid transparent", borderTopColor:"#FF6B00", animation:"spin 0.9s linear infinite" }} />
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>📡</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:"#fff", marginBottom:6 }}>{t.loadingNews}</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,255,255,0.28)" }}>{t.loadingSources}</div>
          </div>
          <div style={{ width:"100%", maxWidth:300, display:"flex", flexDirection:"column", gap:10 }}>
            {[1,0.65,0.35].map((op,i) => <SkeletonCard key={i} opacity={op} />)}
          </div>
        </div>
      )}

      {/* Demo mode banner */}
      {!loading && isDemoMode && (
        <div style={{ margin:"0 18px 8px", background:"rgba(255,165,0,0.08)", border:"1px solid rgba(255,165,0,0.2)", borderRadius:12, padding:"9px 14px", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:14 }}>⚠️</span>
          <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:11, color:"rgba(255,200,100,0.9)" }}>{t.fallbackNotice}</span>
        </div>
      )}

      {/* Live indicator */}
      {!loading && !isDemoMode && (
        <div style={{ margin:"0 18px 6px", display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#10B981", animation:"livePulse 2s infinite", flexShrink:0 }} />
          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600 }}>{t.liveIndicator}</span>
        </div>
      )}

      {/* AI Panel */}
      {showAI && (
        <div style={{ padding:"0 18px 8px" }}>
          <div style={{ background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:14, padding:"13px 15px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
              <span style={{ color:"#a78bfa", fontSize:10, fontFamily:"'Nunito',sans-serif", fontWeight:800, letterSpacing:"1.5px" }}>✦ {t.aiTitle}</span>
              <button onClick={() => setShowAI(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
            </div>
            {aiLoading
              ? <div style={{ color:"rgba(255,255,255,0.35)", fontSize:12, fontFamily:"'Nunito',sans-serif", fontStyle:"italic" }}>{t.analyzing}</div>
              : <p style={{ color:"rgba(255,255,255,0.78)", fontSize:12.5, lineHeight:1.65, fontFamily:"'Nunito',sans-serif", margin:0 }}>{aiText}</p>}
          </div>
        </div>
      )}

      {/* Category pills */}
      <div style={{ display:"flex", gap:7, overflowX:"auto", padding:"0 18px 10px", scrollbarWidth:"none" }}>
        {CATS.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
            padding:"6px 13px", borderRadius:20, flexShrink:0, cursor:"pointer", transition:"all 0.15s",
            border:activeCategory===cat.id?"none":"1px solid rgba(255,255,255,0.1)",
            background:activeCategory===cat.id?"#FF6B00":"rgba(255,255,255,0.04)",
            color:activeCategory===cat.id?"#fff":"rgba(255,255,255,0.5)",
            fontSize:11.5, fontFamily:"'Nunito',sans-serif", fontWeight:activeCategory===cat.id?800:600, whiteSpace:"nowrap"
          }}>{cat.emoji} {cat.label}</button>
        ))}
      </div>

      {/* Count + undo */}
      <div style={{ padding:"0 18px 6px", display:"flex", justifyContent:"space-between" }}>
        <span style={{ color:"rgba(255,255,255,0.18)", fontSize:10.5, fontFamily:"'Nunito',sans-serif" }}>{filtered.length} {t.articles}</span>
        {history.length > 0 && (
          <button onClick={undo} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.32)", cursor:"pointer", fontSize:11, fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>{t.undo}</button>
        )}
      </div>

      {/* Card stack */}
      <div style={{ flex:1, padding:"0 18px", position:"relative", minHeight:460 }}>
        {!loading && filtered.length === 0 && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
            <div style={{ fontSize:60 }}>✓</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:"rgba(255,255,255,0.55)" }}>{t.allDone}</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"rgba(255,255,255,0.22)" }}>{t.allDoneMsg}</div>
            <button onClick={reload} style={{ marginTop:6, background:"#FF6B00", color:"#fff", border:"none", borderRadius:22, padding:"12px 32px", fontSize:14, fontFamily:"'Nunito',sans-serif", fontWeight:800, cursor:"pointer", boxShadow:"0 8px 24px rgba(255,107,0,0.4)" }}>{t.reload}</button>
          </div>
        )}

        {/* Behind cards */}
        {behind.map((card, i) => (
          <div key={card.id} style={{ position:"absolute", left:0, right:0, top:(i+1)*8, height:"calc(100% - 8px)", borderRadius:22, overflow:"hidden", transform:`scale(${1-(i+1)*0.03})`, transformOrigin:"center bottom", opacity:0.4-i*0.15, zIndex:10-i, border:"1px solid rgba(255,255,255,0.05)" }}>
            <img src={card.photo} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.3)" }} />
          </div>
        ))}

        {/* TOP CARD */}
        {topCard && (
          <div
            onMouseDown={e => onStart(e.clientX)}
            onMouseMove={e => { if (startX.current !== null) onMove(e.clientX); }}
            onMouseUp={onEnd} onMouseLeave={onEnd}
            onTouchStart={e => onStart(e.touches[0].clientX)}
            onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX); }}
            onTouchEnd={onEnd}
            style={{ position:"absolute", left:0, right:0, top:0, height:"calc(100% - 8px)", borderRadius:22, overflow:"hidden", zIndex:20, transform:`translateX(${drag}px) rotate(${rot}deg)`, transition:dragging?"none":"transform 0.28s cubic-bezier(0.34,1.2,0.64,1)", opacity:cardOpacity, cursor:dragging?"grabbing":"grab", boxShadow:"0 28px 70px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.07)", userSelect:"none", display:"flex", flexDirection:"column", background:"#111" }}
          >
            {/* Stamps */}
            <div style={{ position:"absolute", top:22, left:18, zIndex:30, opacity:likeOpa, transform:"rotate(-12deg)", border:`3px solid ${topCard.accent}`, borderRadius:8, padding:"3px 13px", color:topCard.accent, fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, letterSpacing:2 }}>{t.save}</div>
            <div style={{ position:"absolute", top:22, right:18, zIndex:30, opacity:skipOpa, transform:"rotate(12deg)", border:"3px solid #FF4545", borderRadius:8, padding:"3px 13px", color:"#FF4545", fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, letterSpacing:2 }}>{t.skip}</div>

            {/* Photo */}
            <div style={{ position:"relative", height:"48%", flexShrink:0, background:"#1a1a1a" }}>
              {!imgErr[topCard.id] ? (
                <img src={topCard.photo} alt={topCard.headline} draggable={false}
                  onError={() => setImgErr(p => ({ ...p, [topCard.id]:true }))}
                  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              ) : (
                <div style={{ width:"100%", height:"100%", background:"#1c1c1c", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:48, opacity:0.2 }}>📰</span>
                </div>
              )}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 45%,#111 100%)" }} />
              <div style={{ position:"absolute", top:14, left:14, background:topCard.accent, borderRadius:6, padding:"3px 10px", fontSize:"9.5px", fontWeight:800, color:"#fff", fontFamily:"'Nunito',sans-serif", letterSpacing:"1px", textTransform:"uppercase" }}>
                {t.cat[topCard.category]}
              </div>
              <SourceBadge source={topCard.source} />
              <div style={{ position:"absolute", bottom:13, left:14, color:"rgba(255,255,255,0.38)", fontSize:10, fontFamily:"'Nunito',sans-serif" }}>
                {topCard.isReal ? timeAgo(topCard.pubDate, lang) : topCard.pubDate}
              </div>
            </div>

            {/* Text */}
            <div style={{ flex:1, background:"#111", padding:"14px 16px 0", display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <h2 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:"clamp(14px,3.4vw,17.5px)", color:"#fff", lineHeight:1.3, margin:"0 0 10px", flexShrink:0 }}>
                {topCard.headline}
              </h2>

              {/* AI Summary with shimmer loader */}
              {(() => {
                const summary = getDisplaySummary(topCard);
                const key = `${topCard.id}-${lang}`;
                const isLoading = summaryLoading === key && !summary;
                if (isLoading) return (
                  <div style={{ marginBottom:10, flexShrink:0 }}>
                    {[100,92,80,55].map((w,i) => (
                      <div key={i} style={{ height:10, borderRadius:5, marginBottom:5, width:`${w}%`, background:"linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%)", backgroundSize:"300px 100%", animation:"shimmer 1.3s infinite" }} />
                    ))}
                    <span style={{ color:"rgba(255,107,0,0.4)", fontSize:10, fontFamily:"'Nunito',sans-serif", fontStyle:"italic" }}>{t.aiSummaryLoading}</span>
                  </div>
                );
                const text = summary || topCard.rawDesc || "";
                return (
                  <div style={{ marginBottom:10, flexShrink:0 }}>
                    <p style={{ color:"rgba(255,255,255,0.75)", fontSize:12.5, lineHeight:1.68, fontFamily:"'Nunito',sans-serif", margin:"0 0 6px" }}>{text}</p>
                    {summary && (
                      <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,107,0,0.08)", border:"1px solid rgba(255,107,0,0.2)", borderRadius:20, padding:"2px 9px" }}>
                        <span style={{ color:"#FF6B00", fontSize:9 }}>✦</span>
                        <span style={{ color:"rgba(255,107,0,0.8)", fontSize:9.5, fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>{t.aiSummaryLabel(wc(text))}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Key points — only for mock articles */}
              {!topCard.isReal && topCard.keyPoints && topCard.keyPoints.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, flexShrink:0 }}>
                  {topCard.keyPoints.map((pt,i) => (
                    <div key={i} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"3px 9px", color:"rgba(255,255,255,0.68)", fontSize:11, fontFamily:"'Nunito',sans-serif", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ color:topCard.accent, fontSize:7 }}>●</span>{pt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action bar */}
            <div style={{ background:"#111", padding:"10px 16px 14px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={e => { e.stopPropagation(); doSwipe("left"); }} style={{ width:40, height:40, borderRadius:"50%", background:"rgba(255,60,60,0.1)", border:"1px solid rgba(255,60,60,0.2)", color:"#ff6060", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                <button onClick={e => { e.stopPropagation(); doSwipe("right"); }} style={{ width:40, height:40, borderRadius:"50%", background:"rgba(255,107,0,0.12)", border:"1px solid rgba(255,107,0,0.3)", color:"#FF6B00", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>🔖</button>
              </div>
              <a href={topCard.url || (SOURCES[topCard.source] && SOURCES[topCard.source].url) || "#"} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                style={{ display:"flex", alignItems:"center", gap:7, background:"#FF6B00", color:"#fff", borderRadius:22, padding:"9px 16px", textDecoration:"none", fontSize:12, fontFamily:"'Nunito',sans-serif", fontWeight:800, boxShadow:"0 6px 20px rgba(255,107,0,0.35)", flexShrink:0 }}>
                <img src={`https://www.google.com/s2/favicons?domain=${SOURCES[topCard.source]?.domain || "google.com"}&sz=32`} alt="" style={{ width:13, height:13, borderRadius:2 }} onError={e => e.target.style.display="none"} />
                {t.readOn} {topCard.source} ↗
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Swipe hint */}
      {!loading && filtered.length > 0 && (
        <div style={{ padding:"8px 18px 10px", textAlign:"center", color:"rgba(255,255,255,0.12)", fontSize:10.5, fontFamily:"'Nunito',sans-serif" }}>{t.swipeHint}</div>
      )}
    </div>
  );


  // ─── ONBOARDING ────────────────────────────────────────────────────────────
  const toggleTopic = (id) => {
    setObTopics(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const obNext = () => {
    if (obAnimating) return;
    setObAnimating(true);
    setTimeout(() => {
      setObStep(s => s + 1);
      setObAnimating(false);
    }, 220);
  };

  const obFinish = () => {
    if (obAnimating) return;
    setObAnimating(true);
    setTimeout(() => {
      // Apply selected topics as default category filter if only one chosen
      setOnboarded(true);
      setObAnimating(false);
    }, 400);
  };

  const Onboarding = () => {
    const steps = [t.ob_step_lang, t.ob_step_topics, t.ob_step_name];
    return (
      <div style={{ minHeight:"100vh", background:"#090909", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", padding:"0 0 32px" }}>

        {/* Top logo */}
        <div style={{ width:"100%", maxWidth:440, padding:"52px 28px 0", textAlign:"center" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:44, color:"#FF6B00", letterSpacing:"-1px", lineHeight:1, marginBottom:8 }}>
            viee<span style={{ color:"#FFD700" }}>.</span>
          </div>

          {/* Step dots */}
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:40 }}>
            {steps.map((s,i) => (
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                <div style={{ width: obStep === i ? 28 : 8, height:8, borderRadius:4,
                  background: i < obStep ? "#FF6B00" : obStep === i ? "#FF6B00" : "rgba(255,255,255,0.12)",
                  transition:"all 0.3s ease" }} />
              </div>
            ))}
          </div>

          {/* Step content */}
          <div style={{ opacity: obAnimating ? 0 : 1, transform: obAnimating ? "translateY(10px)" : "translateY(0)", transition:"all 0.22s ease" }}>

            {/* ── STEP 0: Language ── */}
            {obStep === 0 && (
              <div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:26, color:"#fff", marginBottom:10, lineHeight:1.2 }}>
                  {t.ob_welcome}
                </div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:15, color:"rgba(255,255,255,0.45)", marginBottom:44, lineHeight:1.6, whiteSpace:"pre-line" }}>
                  {t.ob_tagline}
                </div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:20, letterSpacing:"0.5px" }}>
                  {t.ob_lang.toUpperCase()}
                </div>
                <div style={{ display:"flex", gap:14, justifyContent:"center" }}>
                  {[
                    { code:"fr", flag:"🇫🇷", label:"Français" },
                    { code:"en", flag:"🇬🇧", label:"English"  },
                  ].map(l => (
                    <button key={l.code} onClick={() => setLang(l.code)} style={{
                      flex:1, maxWidth:160, padding:"20px 16px", borderRadius:18, cursor:"pointer",
                      background: lang === l.code ? "rgba(255,107,0,0.15)" : "rgba(255,255,255,0.04)",
                      border: lang === l.code ? "2px solid #FF6B00" : "2px solid rgba(255,255,255,0.08)",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:10,
                      transition:"all 0.18s"
                    }}>
                      <span style={{ fontSize:40 }}>{l.flag}</span>
                      <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:16, color: lang === l.code ? "#FF6B00" : "rgba(255,255,255,0.7)" }}>{l.label}</span>
                      {lang === l.code && (
                        <div style={{ width:24, height:24, borderRadius:"50%", background:"#FF6B00", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <span style={{ color:"#fff", fontSize:13 }}>✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 1: Topics ── */}
            {obStep === 1 && (
              <div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:26, color:"#fff", marginBottom:8, lineHeight:1.2 }}>
                  {t.ob_topics}
                </div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, color:"rgba(255,255,255,0.38)", marginBottom:28 }}>
                  {t.ob_topics_sub}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {t.ob_topics_list.map(topic => {
                    const selected = obTopics.includes(topic.id);
                    return (
                      <button key={topic.id} onClick={() => toggleTopic(topic.id)} style={{
                        padding:"18px 14px", borderRadius:16, cursor:"pointer",
                        background: selected ? "rgba(255,107,0,0.12)" : "rgba(255,255,255,0.04)",
                        border: selected ? "2px solid #FF6B00" : "2px solid rgba(255,255,255,0.07)",
                        display:"flex", alignItems:"center", gap:12,
                        transition:"all 0.18s", position:"relative"
                      }}>
                        <span style={{ fontSize:26 }}>{topic.emoji}</span>
                        <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color: selected ? "#FF6B00" : "rgba(255,255,255,0.75)", textAlign:"left" }}>{topic.label}</span>
                        {selected && (
                          <div style={{ position:"absolute", top:8, right:8, width:18, height:18, borderRadius:"50%", background:"#FF6B00", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <span style={{ color:"#fff", fontSize:11 }}>✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 2: Name ── */}
            {obStep === 2 && (
              <div>
                <div style={{ fontSize:64, marginBottom:16 }}>👋</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:26, color:"#fff", marginBottom:8 }}>
                  {t.ob_name}
                </div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, color:"rgba(255,255,255,0.38)", marginBottom:32 }}>
                  {lang === "fr" ? "Pour personnaliser votre expérience" : "To personalise your experience"}
                </div>
                <input
                  type="text"
                  value={obName}
                  onChange={e => setObName(e.target.value)}
                  placeholder={t.ob_name_placeholder}
                  maxLength={20}
                  style={{
                    width:"100%", padding:"16px 18px", borderRadius:14,
                    background:"rgba(255,255,255,0.06)", border:"2px solid rgba(255,255,255,0.1)",
                    color:"#fff", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:16,
                    outline:"none", textAlign:"center",
                    caretColor:"#FF6B00",
                  }}
                />
                {obName.length > 0 && (
                  <div style={{ marginTop:16, fontFamily:"'Nunito',sans-serif", fontSize:13, color:"rgba(255,255,255,0.35)" }}>
                    {lang === "fr" ? `Bonjour, ${obName} 👋` : `Hello, ${obName} 👋`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ width:"100%", maxWidth:440, padding:"0 28px" }}>
          {obStep === 0 && (
            <button onClick={obNext} style={{ width:"100%", padding:"17px", borderRadius:22, background:"#FF6B00", color:"#fff", border:"none", fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:17, cursor:"pointer", boxShadow:"0 10px 30px rgba(255,107,0,0.4)", transition:"all 0.18s" }}>
              {lang === "fr" ? "Continuer →" : "Continue →"}
            </button>
          )}

          {obStep === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <button onClick={obNext} disabled={obTopics.length < 2} style={{ width:"100%", padding:"17px", borderRadius:22, background: obTopics.length >= 2 ? "#FF6B00" : "rgba(255,255,255,0.07)", color: obTopics.length >= 2 ? "#fff" : "rgba(255,255,255,0.3)", border:"none", fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:17, cursor: obTopics.length >= 2 ? "pointer" : "not-allowed", boxShadow: obTopics.length >= 2 ? "0 10px 30px rgba(255,107,0,0.4)" : "none", transition:"all 0.18s" }}>
                {obTopics.length >= 2
                  ? (lang === "fr" ? `Continuer avec ${obTopics.length} sujets →` : `Continue with ${obTopics.length} topics →`)
                  : (lang === "fr" ? `Choisissez encore ${2 - obTopics.length}` : `Pick ${2 - obTopics.length} more`)}
              </button>
            </div>
          )}

          {obStep === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <button onClick={obFinish} style={{ width:"100%", padding:"17px", borderRadius:22, background:"#FF6B00", color:"#fff", border:"none", fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:17, cursor:"pointer", boxShadow:"0 10px 30px rgba(255,107,0,0.4)" }}>
                {t.ob_finish}
              </button>
              <button onClick={obFinish} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontFamily:"'Nunito',sans-serif", fontSize:13, cursor:"pointer", padding:"8px" }}>
                {t.ob_name_skip}
              </button>
            </div>
          )}
        </div>

        {/* Already have account */}
        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,255,255,0.15)", textAlign:"center", marginTop:8 }}>
          viee. · {lang === "fr" ? "L'actu qui vous ressemble" : "News that fits you"}
        </div>
      </div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  if (!onboarded) return <Onboarding />;

  return (
    <div style={{ minHeight:"100vh", background:"#090909", display:"flex", flexDirection:"column", alignItems:"center", maxWidth:"100vw", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#090909; }
        ::-webkit-scrollbar { display:none; }
        @keyframes shimmer { 0%{background-position:-300px 0} 100%{background-position:300px 0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes xpPop { from{opacity:0;transform:translateX(-50%) translateY(-10px) scale(0.8)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
        @keyframes celebPop { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
        @keyframes plantSway { 0%,100%{transform:translate(-50%,-100%) rotate(-2deg)} 50%{transform:translate(-50%,-100%) rotate(2deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes twinkle { 0%{opacity:0.2;transform:scale(0.8)} 100%{opacity:0.8;transform:scale(1.2)} }
        @keyframes plantPop { 0%{transform:translate(-50%,-100%) scale(0)} 70%{transform:translate(-50%,-100%) scale(1.3)} 100%{transform:translate(-50%,-100%) scale(1)} }
      `}</style>

      {xpToast   && <XPToast amount={xpToast} onDone={() => setXpToast(null)} />}
      {celebrate && <CelebrationOverlay text={celebrate} onDone={() => setCelebrate(null)} />}

      {/* Header */}
      <div style={{ width:"100%", maxWidth:440, padding:"18px 18px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:30, color:"#FF6B00", letterSpacing:"-0.5px", lineHeight:1 }}>
            viee<span style={{ color:"#FFD700" }}>.</span>
          </div>
          <div style={{ color:"rgba(255,255,255,0.22)", fontSize:"9.5px", fontFamily:"'Nunito',sans-serif", fontWeight:600, letterSpacing:"1px", marginTop:1 }}>
            🇫🇷 {t.today().toUpperCase()}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={fetchAI} style={{ background:"rgba(124,58,237,0.14)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:10, padding:"7px 11px", cursor:"pointer", color:"#a78bfa", fontSize:11, fontFamily:"'Nunito',sans-serif", fontWeight:800 }}>✦ IA</button>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:10, padding:"6px 10px" }}>
            <span style={{ fontSize:13 }}>⚡</span>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:13, color:"#FFD700" }}>{xp}</span>
          </div>
          <StreakRing streak={streak} size={40} />
        </div>
      </div>

      {/* Daily challenge bar */}
      {activeTab === 0 && (
        <div style={{ width:"100%", maxWidth:440, padding:"0 18px 10px" }}>
          <div style={{ background:"rgba(255,107,0,0.07)", border:"1px solid rgba(255,107,0,0.15)", borderRadius:12, padding:"9px 14px", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:16 }}>🎯</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:11, color:"rgba(255,255,255,0.68)" }}>{t.challengeDesc}</div>
              <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:4, marginTop:5, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(1,dailyCount/5)*100}%`, background:"linear-gradient(90deg,#FF6B00,#FFD700)", borderRadius:4, transition:"width 0.4s ease" }} />
              </div>
            </div>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:11, color:"#FF6B00", flexShrink:0 }}>{dailyCount}/5</span>
          </div>
        </div>
      )}

      {/* Tab content */}
      <div style={{ width:"100%", maxWidth:440, flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {activeTab === 0 && <FeedTab />}
        {activeTab === 1 && <ProfileTab />}
        {activeTab === 2 && <ChallengesTab />}
        {activeTab === 3 && <LeaderboardTab />}
      </div>

      {/* Bottom nav */}
      <div style={{ width:"100%", maxWidth:440, background:"#0f0f0f", borderTop:"1px solid rgba(255,255,255,0.06)", padding:"8px 0 12px", display:"flex", justifyContent:"space-around", alignItems:"center", flexShrink:0 }}>
        {["📰","👤","🎯","🏆"].map((icon, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", flex:1, padding:"4px 0" }}>
            <span style={{ fontSize:20, filter:activeTab===i?"none":"grayscale(1) opacity(0.35)" }}>{icon}</span>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:10, color:activeTab===i?"#FF6B00":"rgba(255,255,255,0.22)", transition:"color 0.15s" }}>{t.tabs[i]}</span>
            {activeTab === i && <div style={{ width:18, height:3, background:"#FF6B00", borderRadius:2, marginTop:1 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
