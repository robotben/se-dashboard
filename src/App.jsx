import React, { useState, useMemo, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  LabelList
} from 'recharts';

// Official Brand Colors
const COLORS = {
  bg:          "#0A0E12",
  card:        "#141A20",
  border:      "#28313A",
  borderMuted: "#3D4751",
  text:        "#FAFCFD",
  textSub:     "#F1F5F9",
  textMuted:   "#D1D9E1",
  textDim:     "#3D4751",
  blue:        "#17D5FF",
  blue60:      "#00AACF",
  blue80:      "#024655",
  green:       "#9AE85E",
  greenDark:   "#619F32",
  orange:      "#FA9C58",
  orangeDark:  "#D76614",
  red:         "#FE6363",
  indigo:      "#8C96F1",
  chart:       ["#17D5FF", "#9AE85E", "#FA9C58"],
};

const V = {
  black: "#0A0E12", pearlBlack: "#141A20", ebony: "#28313A", raven: "#3D4751",
  white: "#FAFCFD", pearlWhite: "#F1F5F9", silver: "#DFE4EA", granite: "#D1D9E1",
  blue: "#17D5FF", blue60: "#00AACF", blue80: "#024655",
  red40: "#FF5757", red60: "#BE2929",
  orange40: "#FA9C58", orange60: "#D76614",
  green20: "#C1F698", green40: "#9AE85E", green60: "#619F32",
  indigo40: "#8C96F1", indigo60: "#404CAC",
  magenta40: "#DF5EBB",
  yellow: "#F5C518",
};

const C = {
  bg: V.black, card: V.pearlBlack, border: V.ebony,
  text: V.pearlWhite, textMuted: V.granite, textDim: V.raven,
  accent: V.blue, accentDark: V.blue60,
  green: V.green40, greenDark: V.green60,
  red: V.red40, orange: V.orange40,
  indigo: V.indigo40,
};

// ─── NATURAL LANGUAGE PARSING ──────────────────────────────────────
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
  "tbd", "etc", "however", "therefore", "thus", "hence", "although", "though", "via", "na", "n/a", "nil", "null", "none", "unknown", "missing", "yes", "true", "false",
  "customer", "client", "vimeo", "video", "videos", "platform", "use", "using", "used", "user", "users", "want", "wants", "need", "needs", "looking", "like", "will", "can", "may",
  "make", "sure", "also", "just", "well", "even", "much", "many", "really", "actually", "currently", "already", "still", "always", "never", "often", "sometimes", "usually",
  "test", "testing", "note", "notes", "see", "below", "above", "has", "have", "had", "do", "does", "did", "be", "am", "is", "are", "was", "were", "new", "old", "good", "bad", "high", "low",
  "large", "small", "big", "little", "great", "tiny", "huge", "short", "long", "wide", "narrow", "thick", "thin", "deep", "shallow", "heavy", "light", "hard", "soft", "strong", "weak",
  "opportunity", "deal", "lead", "contact", "account", "sales", "call", "meeting", "email", "phone", "discussed", "spoke", "talked", "said", "told", "asked", "answered",
  "question", "questions", "answer", "answers", "info", "information", "details", "detail", "data", "fact", "facts", "number", "numbers", "figure", "figures", "amount", "amounts",
  "price", "pricing", "cost", "costs", "fee", "fees", "budget", "money", "cash", "pay", "payment", "payed", "paid", "buy", "buying", "bought", "sell", "selling", "sold", "purchase",
  "purchasing", "purchased", "order", "orders", "ordered", "contract", "contracts", "agreement", "agreements", "sign", "signing", "signed", "close", "closing", "closed", "won", "lost",
  "fit", "content", "tech", "team", "teams", "technical", "technology"
]);

const extractKeywords = (text) => {
  if (!text) return [];
  const words = text.toLowerCase().split(/[^a-z0-9]+/);
  const uppercaseAcronyms = new Set(['api', 'sso', 'ui', 'ux', 'qa', 'bi', 'db', 'ai', 'ip', 'it', 'tv', 'drm']);
  
  // Filter and format unigrams
  const validTokens = words.map(w => {
    if (!w || STOP_WORDS.has(w) || !isNaN(w)) return null; 
    if (w.length <= 2 && !uppercaseAcronyms.has(w)) return null; 
    
    if (uppercaseAcronyms.has(w)) {
      return w.toUpperCase();
    } else {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }
  });

  const keywords = [];
  
  // Push unigrams and build consecutive bigrams
  for (let i = 0; i < validTokens.length; i++) {
    if (validTokens[i]) {
      keywords.push(validTokens[i]); // Unigram
      
      // Bigram
      if (i + 1 < validTokens.length && validTokens[i + 1]) {
        keywords.push(`${validTokens[i]} ${validTokens[i + 1]}`);
      }
    }
  }
  
  return keywords;
};

// ─── STATIC FALLBACK DATA ──────────────────────────────────────────
const WIN_RATE_KPIS = {
  'Vimeo Enterprise': { overall: { se: 29.5, noSe: 48.7 }, newBusiness: { se: 21.4, noSe: 17.3 }, expansion: { se: 29.7, noSe: 43.7 } },
  'OTT': { overall: { se: 30.7, noSe: 45.6 }, newBusiness: { se: 26.9, noSe: 14.5 }, expansion: { se: 21.7, noSe: 52.1 } }
};

const DIFFERENTIAL_DATA = {
  'Vimeo Enterprise': [
    { bucket: '$10k–20k', nbDiff: 2.8, expDiff: -18.2 }, { bucket: '$20k–30k', nbDiff: 0.8, expDiff: -24.3 },
    { bucket: '$30k–40k', nbDiff: -2.7, expDiff: -24.1 }, { bucket: '$40k–50k', nbDiff: 5.2, expDiff: -16.4 },
    { bucket: '$50k–60k', nbDiff: 7.8, expDiff: -14.9 }, { bucket: '$60k–70k', nbDiff: -3.0, expDiff: -30.3 },
    { bucket: '$70k–80k', nbDiff: 11.2, expDiff: -7.7 }, { bucket: '$80k–90k', nbDiff: 5.2, expDiff: 10.4 },
    { bucket: '$90k–100k', nbDiff: 10.6, expDiff: -40.7 }, { bucket: '$100k–110k', nbDiff: 17.2, expDiff: 6.0 },
    { bucket: '$110k–120k', nbDiff: -0.8, expDiff: null }, { bucket: '$120k–130k', nbDiff: 12.2, expDiff: null },
    { bucket: '$130k+', nbDiff: 24.3, expDiff: -2.5 },
  ],
  'OTT': [
    { bucket: '$10k–20k', nbDiff: 12.2, expDiff: -20.8 }, { bucket: '$20k–30k', nbDiff: 1.5, expDiff: -53.8 },
    { bucket: '$30k–40k', nbDiff: 6.7, expDiff: -18.8 }, { bucket: '$40k–50k', nbDiff: 3.8, expDiff: -21.0 },
    { bucket: '$50k–60k', nbDiff: -8.5, expDiff: -38.5 }, { bucket: '$60k–70k', nbDiff: 18.4, expDiff: null },
    { bucket: '$70k–80k', nbDiff: 4.2, expDiff: null }, { bucket: '$80k–90k', nbDiff: -40.9, expDiff: null },
    { bucket: '$90k–100k', nbDiff: -30.0, expDiff: null }, { bucket: '$100k–110k', nbDiff: -50.0, expDiff: 0.0 },
    { bucket: '$110k–120k', nbDiff: -75.0, expDiff: null }, { bucket: '$120k–130k', nbDiff: 24.2, expDiff: null },
    { bucket: '$130k+', nbDiff: -17.7, expDiff: -74.2 },
  ],
};

const KEYWORD_DATA = [
  { term: 'Use Case', count: 1208, category: 'technical' }, { term: 'Platform Demo', count: 1232, category: 'process' },
  { term: 'API Integration', count: 533, category: 'technical' }, { term: 'SAML Support', count: 492, category: 'technical' },
  { term: 'Custom Workflow', count: 447, category: 'process' }, { term: 'Live Event', count: 396, category: 'technical' },
];

const HEATMAP_DATA = [
  { activity: 'Use Case', mid: 28, large: 32, enterprise: 38 },
  { activity: 'Platform Demo', mid: 23, large: 31, enterprise: 49 },
  { activity: 'API Integration', mid: 36, large: 44, enterprise: 41 },
  { activity: 'SAML Support', mid: 38, large: 42, enterprise: 37 },
  { activity: 'Custom Workflow', mid: 29, large: 33, enterprise: 44 },
  { activity: 'Live Event', mid: 35, large: 40, enterprise: 38 },
];

const SE_STAGE_DATA = {
  'Vimeo Enterprise': {
    insight: 'Later SE assignment correlates with higher win rates — but deals assigned SEs late have already survived early qualification',
    stages: [{ name: 'Pricing and Negotiation', won: 45, total: 60, rate: 75.0 }, { name: 'Technical Proof', won: 85, total: 199, rate: 42.7 }, { name: 'Business Alignment', won: 126, total: 297, rate: 42.4 }, { name: 'Discovery', won: 96, total: 269, rate: 35.7 }],
  },
  'OTT': {
    insight: 'SE involvement at Technical Proof and Validation stages drives the strongest OTT win rates — early Discovery engagement underperforms',
    stages: [{ name: 'Pricing and Negotiation', won: 5, total: 6, rate: 83.3 }, { name: 'Technical Proof', won: 8, total: 15, rate: 53.3 }, { name: 'Business Alignment', won: 8, total: 17, rate: 47.1 }, { name: 'Discovery', won: 1, total: 12, rate: 8.3 }],
  },
};

// ─── UTILITIES ──────────────────────────────────────────────────────
function linearRegression(points) {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  const sumX = points.reduce((a, p) => a + p.x, 0);
  const sumY = points.reduce((a, p) => a + p.y, 0);
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
  const sumXX = points.reduce((a, p) => a + p.x * p.x, 0);
  const denom = (n * sumXX - sumX * sumX);
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

const hexToRgba = (hex, opacity) => {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const parseCSV = (text) => {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let insideQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (insideQuotes && text[i + 1] === '"') { currentCell += '"'; i++; } else insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) { currentRow.push(currentCell); currentCell = ''; }
    else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && text[i+1] === '\n') i++;
      currentRow.push(currentCell);
      if (currentRow.some(c => c !== '')) rows.push(currentRow);
      currentRow = []; currentCell = '';
    } else currentCell += char;
  }
  if (currentCell !== '' || currentRow.length > 0) { currentRow.push(currentCell); rows.push(currentRow); }
  return rows;
};

const parseCSVToObjects = (text) => {
  const rows = parseCSV(text);
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => { if (header) obj[header.trim()] = row[index] !== undefined ? row[index].trim() : ''; });
    return obj;
  });
};

const formatCurrency = (val) => {
  if (val === 0) return "$0";
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `$${Math.round(val).toLocaleString()}`;
};

// ─── SHARED COMPONENTS ──────────────────────────────────────────────
const Card = ({ children, style, accentColor, id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const currentBorderColor = isHovered ? 'rgba(23, 213, 255, 0.4)' : COLORS.border;
  return (
    <div id={id} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={{
      backgroundColor: COLORS.card,
      borderTop: `1px solid ${currentBorderColor}`,
      borderRight: `1px solid ${currentBorderColor}`,
      borderBottom: `1px solid ${currentBorderColor}`,
      borderLeft: accentColor ? `4px solid ${accentColor}` : `1px solid ${currentBorderColor}`,
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.2s ease',
      ...style
    }}>{children}</div>
  );
};

const SectionLabel = ({ children, style }) => (
  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.textDim, fontWeight: 600, marginBottom: '8px', ...style }}>{children}</div>
);

const ExportActions = ({ onCopy, onDownload }) => (
  <div className="export-actions" style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
    <button onClick={onCopy} title="Copy" style={{ background: 'transparent', borderTop: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, borderLeft: `1px solid ${COLORS.border}`, borderRadius: '4px', cursor: 'pointer', padding: '6px', color: COLORS.textDim }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg></button>
    <button onClick={onDownload} title="Download" style={{ background: 'transparent', borderTop: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, borderLeft: `1px solid ${COLORS.border}`, borderRadius: '4px', cursor: 'pointer', padding: '6px', color: COLORS.textDim }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg></button>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: COLORS.card, borderTop: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, borderLeft: `1px solid ${COLORS.border}`, padding: '12px', borderRadius: '8px', color: COLORS.text }}>
        <div style={{ marginBottom: '8px', fontWeight: 600, color: COLORS.textMuted }}>{label}</div>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: 10, height: 10, backgroundColor: entry.color, borderRadius: '2px' }} />
            <span style={{ color: COLORS.textSub }}>{entry.name}:</span>
            <span style={{ fontWeight: 600 }}>
              {entry.name === "Count" ? entry.value.toLocaleString() : 
                (entry.name.includes('%') || entry.name.includes('Diff') ? `${entry.value}%` : 
                (entry.name.includes('Days') ? `${entry.value}d` : formatCurrency(entry.value)))}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── TABS ──────────────────────────────────────────────────────────

const TableRow = ({ row, index }) => {
  const [hover, setHover] = useState(false);
  const isLatam = row.region === 'LATAM';
  let bg = index % 2 === 0 ? C.card : '#0D1118';
  if (isLatam && !hover) bg = 'rgba(158, 232, 94, 0.04)';
  if (hover) bg = V.ebony;

  const getWinPctColor = (pct) => pct >= 35 ? C.green : (pct >= 25 ? C.orange : C.red);
  const cellStyle = { padding: '9px 14px', borderBottom: `1px solid ${V.ebony}`, fontSize: '12px' };
  const numStyle = { ...cellStyle, fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textAlign: 'right' };

  return (
    <tr onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ backgroundColor: bg, transition: 'background-color 0.2s' }}>
      <td style={{ ...cellStyle, fontFamily: "'Inter Tight', sans-serif", fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.region}</td>
      <td style={numStyle}>{row.aes}</td>
      <td style={numStyle}>{row.ses}</td>
      <td style={{ ...numStyle, fontWeight: 700, color: C.text }}>{row.deals}</td>
      <td style={numStyle}>{row.won}</td>
      <td style={numStyle}>{row.lost}</td>
      <td style={{ ...numStyle, color: getWinPctColor(row.winPct), fontWeight: 700 }}>{row.winPct}%</td>
      <td style={numStyle}>{row.noSeWinPct}</td>
      <td style={{ ...numStyle, color: C.green, fontWeight: 700 }}>{row.bv}</td>
    </tr>
  );
};

const AttachmentRateDashboard = ({ data, dateRange, hasGlobalData, handleExport }) => {
  const stats = useMemo(() => {
    if (!hasGlobalData) return {
      seCount: 26, aeWithSECount: 216, seDealsTotal: 3955, ratio: "10.8", coverage: 77, dealsPerSE: 152,
      totalWon: 35810, totalLost: 33562, seWon: 1253, seLost: 2674, seWonBV: 37280000,
      wonPct: 3.5, lostPct: 8.0, ratioLostToWon: 2.1,
      bucketData: [{ label: '$100K+', pct: 52.5, total: 1421 }, { label: '$50K–$100K', pct: 34.2, total: 3240 }, { label: '$25K–$50K', pct: 24.6, total: 6276 }, { label: '$10K–$25K', pct: 12.4, total: 8400 }, { label: '$0–$10K', pct: 6.3, total: 12036 }],
      tableData: [{ region: "AMER", aes: 154, ses: 19, deals: "2,564", won: 786, lost: "1,762", winPct: 31, noSeWinPct: "55%", bv: "$25.3M" }, { region: "EMEA", aes: 78, ses: 12, deals: "728", won: 224, lost: "497", winPct: 31, noSeWinPct: "50%", bv: "$6.6M" }, { region: "APAC/JAPAN", aes: 36, ses: 9, deals: "451", won: 149, lost: "299", winPct: 33, noSeWinPct: "47%", bv: "$3.1M" }, { region: "LATAM", aes: 8, ses: 9, deals: "100", won: 50, lost: "48", winPct: 50, noSeWinPct: "76%", bv: "$1.1M" }],
    };

    let totalWon = 0, totalLost = 0, seWon = 0, seLost = 0, seWonBV = 0;
    const uniqueSEs = new Set(), uniqueAEs = new Set(), uniqueAEsWithSE = new Set(), regionMap = {};
    const buckets = [{ label: '$100K+', min: 100000, max: Infinity, total: 0, se: 0 }, { label: '$50K–$100K', min: 50000, max: 100000, total: 0, se: 0 }, { label: '$25K–$50K', min: 25000, max: 50000, total: 0, se: 0 }, { label: '$10K–$25K', min: 10000, max: 25000, total: 0, se: 0 }, { label: '$0–$10K', min: 0, max: 10000, total: 0, se: 0 }];

    data.forEach(d => {
      if (d.stage !== 'Closed Won' && d.stage !== 'Closed Lost') return;
      const isWon = d.stage === 'Closed Won', isSE = d.hasSE === "1" || String(d.hasSE).toLowerCase() === 'true' || String(d.hasSE).toLowerCase() === 'yes';
      if (d.se && d.se !== "Unknown") uniqueSEs.add(d.se);
      if (d.ae && d.ae !== "Unknown") { uniqueAEs.add(d.ae); if (isSE) uniqueAEsWithSE.add(d.ae); }
      if (isWon) totalWon++; else totalLost++;
      if (isSE) { if (isWon) { seWon++; seWonBV += d.value; } else seLost++; }
      const bucket = buckets.find(b => d.value >= b.min && d.value < b.max);
      if (bucket) { bucket.total++; if (isSE) bucket.se++; }
      
      let r = d.region || "Unknown";
      const upper = r.toUpperCase();
      if (upper.includes("LATAM")) r = "LATAM"; else if (upper.includes("AMER") || upper === "US") r = "AMER"; else if (upper.includes("EMEA")) r = "EMEA"; else if (upper.includes("APAC")) r = "APAC/JAPAN";
      if (!regionMap[r]) regionMap[r] = { region: r, aes: new Set(), ses: new Set(), seDeals: 0, seWon: 0, seLost: 0, noSeWon: 0, noSeLost: 0, bv: 0 };
      if (d.ae) regionMap[r].aes.add(d.ae); if (d.se) regionMap[r].ses.add(d.se);
      if (isSE) { regionMap[r].seDeals++; if (isWon) { regionMap[r].seWon++; regionMap[r].bv += d.value; } else regionMap[r].seLost++; }
      else { if (isWon) regionMap[r].noSeWon++; else regionMap[r].noSeLost++; }
    });

    return {
      seCount: uniqueSEs.size, aeWithSECount: uniqueAEsWithSE.size, seDealsTotal: seWon + seLost,
      ratio: uniqueSEs.size > 0 ? (uniqueAEsWithSE.size / uniqueSEs.size).toFixed(1) : "0.0",
      coverage: uniqueAEs.size > 0 ? Math.round((uniqueAEsWithSE.size / uniqueAEs.size) * 100) : 0,
      dealsPerSE: uniqueSEs.size > 0 ? Math.round((seWon+seLost) / uniqueSEs.size) : 0,
      totalWon, totalLost, seWon, seLost, seWonBV,
      wonPct: totalWon > 0 ? ((seWon / totalWon) * 100).toFixed(1) : "0.0",
      lostPct: totalLost > 0 ? ((seLost / totalLost) * 100).toFixed(1) : "0.0",
      ratioLostToWon: seWon > 0 ? (seLost / seWon).toFixed(1) : "0.0",
      bucketData: buckets.map(b => ({ label: b.label, total: b.total, pct: b.total > 0 ? Number(((b.se / b.total) * 100).toFixed(1)) : 0 })),
      tableData: Object.values(regionMap).map(r => ({ region: r.region, aes: r.aes.size, ses: r.ses.size, deals: r.seDeals.toLocaleString(), won: r.seWon.toLocaleString(), lost: r.seLost.toLocaleString(), winPct: (r.seWon+r.seLost)>0 ? Math.round((r.seWon/(r.seWon+r.seLost))*100) : 0, noSeWinPct: (r.noSeWon+r.noSeLost)>0 ? `${Math.round((r.noSeWon/(r.noSeWon+r.noSeLost))*100)}%` : "0%", bv: formatCurrency(r.bv), rawDeals: r.seDeals })).sort((a,b) => b.rawDeals - a.rawDeals)
    };
  }, [data, hasGlobalData]);

  const dateLabel = useMemo(() => {
    if (dateRange.start && dateRange.end) return `${dateRange.start} to ${dateRange.end}`;
    if (dateRange.start) return `From ${dateRange.start}`;
    if (dateRange.end) return `Until ${dateRange.end}`;
    return 'All Time';
  }, [dateRange]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div id="attachment-header" style={{ position: 'relative', background: `linear-gradient(135deg, ${V.black} 0%, ${V.pearlBlack} 100%)`, padding: '24px 32px', borderRadius: '8px', borderTop: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, borderLeft: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
        <ExportActions onCopy={() => handleExport('attachment-header', 'ratio-header.png', 'copy')} onDownload={() => handleExport('attachment-header', 'ratio-header.png', 'download')} />
        <div style={{ color: C.accent, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderTop: `1px solid ${C.accent}`, borderRight: `1px solid ${C.accent}`, borderBottom: `1px solid ${C.accent}`, borderLeft: `1px solid ${C.accent}`, borderRadius: '999px', marginBottom: '16px', display: 'inline-block' }}>Vimeo SE Analytics</div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '36px', fontWeight: 800, background: `linear-gradient(135deg, ${V.pearlWhite}, ${V.blue})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SE to AE Ratio</h1>
        <p style={{ margin: 0, color: C.textDim, fontSize: '13px' }}>{stats.seCount} SEs supporting {stats.aeWithSECount} AEs across {stats.seDealsTotal.toLocaleString()} deals</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {[{ id: "att-kpi-1", label: "SE : AE RATIO", val: `1 : ${stats.ratio}`, color: C.accent }, { id: "att-kpi-2", label: "AE COVERAGE", val: `${stats.coverage}%`, color: C.green }, { id: "att-kpi-3", label: "DEALS PER SE", val: stats.dealsPerSE, color: C.indigo }].map(k => (
          <Card key={k.id} id={k.id} style={{ position: 'relative' }}>
            <ExportActions onCopy={() => handleExport(k.id, `${k.id}.png`, 'copy')} onDownload={() => handleExport(k.id, `${k.id}.png`, 'download')} />
            <SectionLabel>{k.label}</SectionLabel>
            <div style={{ fontSize: '48px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: k.color }}>{k.val}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: C.text }}>SE engagement by stage</h2>
          <p style={{ margin: 0, fontStyle: 'italic', fontSize: '12px', color: C.textMuted }}>SEs touch {stats.wonPct}% of wins but {stats.lostPct}% of losses — they're deployed on the hardest deals</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <div id="attachment-won-card" style={{ position: 'relative', background: C.card, borderTop: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, borderLeft: `3px solid ${C.green}`, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', padding: '20px' }}>
            <ExportActions onCopy={() => handleExport('attachment-won-card', 'se-closed-won.png', 'copy')} onDownload={() => handleExport('attachment-won-card', 'se-closed-won.png', 'download')} />
            <div style={{ fontSize: '11px', color: C.green, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px' }}>CLOSED WON</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '40px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: C.green, lineHeight: 1 }}>{stats.seWon.toLocaleString()}</span>
              <span style={{ fontSize: '14px', color: C.textMuted }}>SE deals</span>
            </div>
            <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '16px' }}>{stats.wonPct}% of {stats.totalWon.toLocaleString()} total won deals</div>
            <div style={{ fontSize: '13px', color: C.green, fontWeight: 700 }}>{formatCurrency(stats.seWonBV)} bookings won</div>
          </div>
          <div id="attachment-lost-card" style={{ position: 'relative', background: C.card, borderTop: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, borderLeft: `3px solid ${C.red}`, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', padding: '20px' }}>
            <ExportActions onCopy={() => handleExport('attachment-lost-card', 'se-closed-lost.png', 'copy')} onDownload={() => handleExport('attachment-lost-card', 'se-closed-lost.png', 'download')} />
            <div style={{ fontSize: '11px', color: C.red, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px' }}>CLOSED LOST</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '40px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: C.red, lineHeight: 1 }}>{stats.seLost.toLocaleString()}</span>
              <span style={{ fontSize: '14px', color: C.textMuted }}>SE deals</span>
            </div>
            <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '16px' }}>{stats.lostPct}% of {stats.totalLost.toLocaleString()} total lost deals</div>
            <div style={{ fontSize: '13px', color: C.red, fontWeight: 700 }}>{stats.ratioLostToWon}x more losses than wins touched</div>
          </div>
        </div>
      </div>

      <div id="attachment-deal-size-card" style={{ position: 'relative', background: C.card, borderTop: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, borderLeft: `1px solid ${C.border}`, borderRadius: '8px', padding: '24px' }}>
        <ExportActions onCopy={() => handleExport('attachment-deal-size-card', 'dealsize.png', 'copy')} onDownload={() => handleExport('attachment-deal-size-card', 'dealsize.png', 'download')} />
        <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: C.text }}>SE attachment by deal size</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {stats.bucketData.map((b, i) => {
             const visWidth = Math.min((b.pct / 50) * 100, 100);
             const color = b.pct >= 40 ? C.green : (b.pct >= 20 ? V.yellow : C.red);
             return (
               <div key={i}>
                 <div style={{ fontSize: '14px', marginBottom: '4px' }}>{b.label}</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ flex: 1, height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                     <div style={{ width: `${visWidth}%`, height: '100%', background: color, transition: 'width 1s', display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
                       {visWidth >= 8 && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#FAFCFD', fontSize: '14px' }}>{b.pct}%</span>}
                     </div>
                     {visWidth < 8 && <span style={{ position: 'absolute', left: `calc(${Math.max(visWidth, 0.5)}% + 8px)`, top: '50%', transform: 'translateY(-50%)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: C.text, fontSize: '14px' }}>{b.pct}%</span>}
                   </div>
                   <div style={{ width: '100px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{b.pct}%</div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      <div id="attachment-table-card" style={{ position: 'relative', background: C.card, borderTop: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, borderLeft: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden' }}>
        <ExportActions onCopy={() => handleExport('attachment-table-card', 'regional.png', 'copy')} onDownload={() => handleExport('attachment-table-card', 'regional.png', 'download')} />
        <div style={{ padding: '16px', borderBottom: `1px solid ${V.ebony}` }}><h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>SE utilization by owner region</h2></div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: V.ebony, color: C.textMuted, fontSize: '10px', textTransform: 'uppercase' }}>{['Region', 'AEs', 'SEs', 'SE Deals', 'Win %', 'No SE Win %', 'SE Won BV'].map(h => <th key={h} style={{ padding: '12px', textAlign: h==='Region'?'left':'right' }}>{h}</th>)}</tr></thead>
          <tbody>{stats.tableData.map((r, i) => <TableRow key={i} row={r} index={i} />)}</tbody>
        </table>
      </div>
    </div>
  );
};

const WinRateTab = ({ data, dateRange, hasGlobalData, handleExport }) => {
  const [product, setProduct] = useState('Vimeo Enterprise');
  const sharedCardStyle = { backgroundColor: '#151a20', borderTop: '1px solid rgba(23, 213, 255, 0.35)', borderRight: '1px solid rgba(23, 213, 255, 0.35)', borderBottom: '1px solid rgba(23, 213, 255, 0.35)', borderLeft: '1px solid rgba(23, 213, 255, 0.35)', borderRadius: '12px', padding: '20px' };

  const winStats = useMemo(() => {
    if (!hasGlobalData) return { 
      kpis: WIN_RATE_KPIS[product], 
      diffData: DIFFERENTIAL_DATA[product].map((d, i) => ({ ...d, nbTrend: d.nbDiff, expTrend: d.expDiff })),
      keywords: KEYWORD_DATA, 
      heatmap: HEATMAP_DATA,
      stages: SE_STAGE_DATA[product].stages
    };

    let seNbW = 0, seNbT = 0, noNbW = 0, noNbT = 0, seExW = 0, seExT = 0, noExW = 0, noExT = 0;
    const kwMap = {}, actMap = {}, stageMap = {};
    const buckets = Array.from({length: 13}, (_, i) => ({ bucket: i===12?'$130k+':`$${10+i*10}k–${20+i*10}k`, min: 10000+i*10000, max: i===12?Infinity:20000+i*10000, seNbW: 0, seNbT: 0, noNbW: 0, noNbT: 0, seExW: 0, seExT: 0, noExW: 0, noExT: 0 }));

    data.forEach(d => {
      if (d.product !== product || (d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')) return;
      const isWon = d.stage === 'Closed Won', isSE = d.hasSE === "1" || String(d.hasSE).toLowerCase() === 'true' || String(d.hasSE).toLowerCase() === 'yes', isNb = d.type === "New Business";
      
      // KPIs & Differential
      if (d.value >= 10000) {
        if (isSE) { if (isNb) { seNbW += isWon?1:0; seNbT++; } else { seExW += isWon?1:0; seExT++; } }
        else { if (isNb) { noNbW += isWon?1:0; noNbT++; } else { noExW += isWon?1:0; noExT++; } }
        const b = buckets.find(b => d.value >= b.min && d.value < b.max);
        if (b) { if (isSE) { if (isNb) { b.seNbW+=isWon?1:0; b.seNbT++; } else { b.seExW+=isWon?1:0; b.seExT++; } } else { if (isNb) { b.noNbW+=isWon?1:0; b.noNbT++; } else { b.noExW+=isWon?1:0; b.noExT++; } } }
      }

      // Keywords & Heatmap & Stages (SE only)
      if (isSE) {
        if (d.keywords) {
          const ks = extractKeywords(d.keywords);
          ks.forEach(k => { 
            const term = k === 'Case' ? 'Use Case' : k;
            if (!kwMap[term]) kwMap[term] = { count: 0, midW: 0, midT: 0, lrgW: 0, lrgT: 0, entW: 0, entT: 0 };
            kwMap[term].count++; 
            
            if (d.value < 50000) { kwMap[term].midT++; if (isWon) kwMap[term].midW++; }
            else if (d.value < 100000) { kwMap[term].lrgT++; if (isWon) kwMap[term].lrgW++; }
            else { kwMap[term].entT++; if (isWon) kwMap[term].entW++; }
          });
        }
        if (['Discovery', 'Business Alignment', 'Technical Proof', 'Pricing and Negotiation', 'Pricing and negotiation'].includes(d.stageWhenSEAssigned)) {
          const s = d.stageWhenSEAssigned.toLowerCase() === 'pricing and negotiation' ? 'Pricing and Negotiation' : d.stageWhenSEAssigned;
          if (!stageMap[s]) stageMap[s] = { name: s, won: 0, total: 0 };
          stageMap[s].total++; if (isWon) stageMap[s].won++;
        }
      }
    });

    const diffData = buckets.map((b, i) => {
      const nb = b.seNbT>0 && b.noNbT>0 ? Number(((b.seNbW/b.seNbT - b.noNbW/b.noNbT)*100).toFixed(1)) : null;
      const ex = b.seExT>0 && b.noExT>0 ? Number(((b.seExW/b.seExT - b.noExW/b.noExT)*100).toFixed(1)) : null;
      return { bucket: b.bucket, nbDiff: nb, expDiff: ex };
    });
    const nbReg = linearRegression(diffData.map((d, i) => ({ x: i, y: d.nbDiff })).filter(p => p.y !== null));
    const exReg = linearRegression(diffData.map((d, i) => ({ x: i, y: d.expDiff })).filter(p => p.y !== null));

    const processTerms = new Set(['demo', 'trial', 'pov', 'migration', 'competitive', 'workflow']);
    const sortedKwEntries = Object.entries(kwMap).sort((a,b) => b[1].count - a[1].count).slice(0, 8);
    
    const finalKw = sortedKwEntries.map(([term, data]) => ({ 
      term, count: data.count, category: processTerms.has(term.toLowerCase()) ? 'process' : 'technical' 
    }));
    
    const finalHeat = sortedKwEntries.map(([act, c]) => ({ 
      activity: act, mid: c.midT>0?Math.round(c.midW/c.midT*100):null, large: c.lrgT>0?Math.round(c.lrgW/c.lrgT*100):null, enterprise: c.entT>0?Math.round(c.entW/c.entT*100):null 
    }));
    
    const STAGE_ORDER = ['Pricing and Negotiation', 'Technical Proof', 'Business Alignment', 'Discovery'];
    const finalStages = Object.values(stageMap).map(s => ({ ...s, rate: Number((s.won/s.total*100).toFixed(1)) })).sort((a,b) => STAGE_ORDER.indexOf(a.name) - STAGE_ORDER.indexOf(b.name));

    return {
      kpis: { overall: { se: Number(((seNbW+seExW)/(seNbT+seExT||1)*100).toFixed(1)), noSe: Number(((noNbW+noExW)/(noNbT+noExT||1)*100).toFixed(1)) }, newBusiness: { se: Number((seNbW/(seNbT||1)*100).toFixed(1)), noSe: Number((noNbW/(noNbT||1)*100).toFixed(1)) }, expansion: { se: Number((seExW/(seExT||1)*100).toFixed(1)), noSe: Number((noExW/(noExT||1)*100).toFixed(1)) } },
      diffData: diffData.map((d, i) => ({ ...d, nbTrend: Number((nbReg.slope * i + nbReg.intercept).toFixed(1)), expTrend: Number((exReg.slope * i + exReg.intercept).toFixed(1)) })),
      keywords: finalKw.length > 0 ? finalKw : (hasGlobalData ? [] : KEYWORD_DATA),
      heatmap: finalHeat.length > 0 ? finalHeat : (hasGlobalData ? [] : HEATMAP_DATA),
      stages: finalStages.length > 0 ? finalStages : (hasGlobalData ? [] : SE_STAGE_DATA[product].stages)
    };
  }, [data, product, hasGlobalData]);

  const maxHeat = useMemo(() => {
    let m = -1, a = ''; 
    if (winStats.heatmap.length > 0) {
      winStats.heatmap.forEach(r => { ['mid', 'large', 'enterprise'].forEach(k => { if (r[k] > m && r[k] !== null) { m = r[k]; a = r.activity; } }); });
    }
    return { val: m, activity: a };
  }, [winStats.heatmap]);

  const getHeatColor = (v) => v === null ? 'transparent' : (v<=20?'#7B1F1F':v<=29?'#8B4A1A':v<=36?'#5A6B1A':v<=43?'#1A5C2A':'#0D3D1A');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(23, 213, 255, 0.04)', padding: '4px', borderRadius: '99px', width: 'fit-content' }}>
          {['Vimeo Enterprise', 'OTT'].map(p => <button key={p} onClick={() => setProduct(p)} style={{ background: product === p ? '#17D5FF' : 'transparent', color: product === p ? '#141A20' : '#C8D6E5', fontWeight: product === p ? 700 : 500, border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '13px', cursor: 'pointer' }}>{p}</button>)}
        </div>
        {hasGlobalData && (dateRange.start || dateRange.end) && (
           <span style={{ fontSize: '11px', color: COLORS.green, backgroundColor: 'rgba(154, 232, 94, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
             Active Date Filter Applied
           </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <Card id="win-se" style={{ position: 'relative' }}><SectionLabel>SE WIN RATE</SectionLabel><div style={{ fontSize: '28px', fontWeight: 700, color: COLORS.blue }}>{winStats.kpis.overall.se}%</div></Card>
        <Card id="win-nose" style={{ position: 'relative' }}><SectionLabel>NO SE WIN RATE</SectionLabel><div style={{ fontSize: '28px', fontWeight: 700, color: '#C8D6E5' }}>{winStats.kpis.overall.noSe}%</div></Card>
        <Card id="win-lift" style={{ position: 'relative' }}><SectionLabel>NB LIFT</SectionLabel><div style={{ fontSize: '28px', fontWeight: 700, color: (winStats.kpis.newBusiness.se - winStats.kpis.newBusiness.noSe) >= 0 ? COLORS.green : COLORS.red }}>{(winStats.kpis.newBusiness.se - winStats.kpis.newBusiness.noSe).toFixed(1)}pp</div></Card>
        <Card id="win-exp" style={{ position: 'relative' }}><SectionLabel>EXP WIN RATE</SectionLabel><div style={{ fontSize: '28px', fontWeight: 700, color: COLORS.blue }}>{winStats.kpis.expansion.se}%</div></Card>
      </div>

      <Card id="win-diff" style={{ position: 'relative' }}>
        <ExportActions onCopy={() => handleExport('win-diff', 'diff.png', 'copy')} onDownload={() => handleExport('win-diff', 'diff.png', 'download')} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>SE Win Rate Differential</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={winStats.diffData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="bucket" fontSize={10} tick={{ fill: '#3D4751' }} />
            <YAxis fontSize={10} tick={{ fill: '#3D4751' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#3D4751" strokeDasharray="4 4" />
            <Line dataKey="nbDiff" name="NB Diff" stroke={COLORS.orange} strokeWidth={2} dot={{ r: 4 }} connectNulls />
            <Line dataKey="expDiff" name="Exp Diff" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 4 }} connectNulls />
            <Line dataKey="nbTrend" name="NB Trend" stroke={COLORS.orange} strokeWidth={2} strokeDasharray="6 3" dot={false} strokeOpacity={0.6} />
            <Line dataKey="expTrend" name="Exp Trend" stroke={COLORS.blue} strokeWidth={2} strokeDasharray="6 3" dot={false} strokeOpacity={0.6} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card id="win-stage" style={{ position: 'relative' }}>
        <ExportActions onCopy={() => handleExport('win-stage', 'stage.png', 'copy')} onDownload={() => handleExport('win-stage', 'stage.png', 'download')} />
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Win Rate by Stage of SE Assignment</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {winStats.stages.length > 0 ? winStats.stages.map((s, i) => {
            let color = COLORS.indigo; // Default for 30% to 50%
            if (s.rate < 15) color = COLORS.red;
            else if (s.rate <= 20) color = V.yellow;
            else if (s.rate <= 30) color = COLORS.green;
            else if (s.rate > 50) color = COLORS.blue;
            
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}><span>{s.name}</span><span style={{ fontWeight: 700, color }}>{s.rate}%</span></div>
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}><div style={{ width: `${s.rate}%`, height: '100%', background: color }} /></div>
              </div>
            );
          }) : (
            <div style={{ padding: '32px 0', color: COLORS.textDim, textAlign: 'center' }}>No stage assignment data in this date range.</div>
          )}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card id="win-heat" style={{ position: 'relative' }}>
          <ExportActions onCopy={() => handleExport('win-heat', 'heatmap.png', 'copy')} onDownload={() => handleExport('win-heat', 'heatmap.png', 'download')} />
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Keyword Win Rate x Deal Size</h2>
          <p style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '20px' }}>Opportunity win rates based on top keywords and band</p>
          
          {winStats.heatmap.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '8px' }}>
              <thead><tr><th />{['MID', 'LARGE', 'ENT'].map(h => <th key={h} style={{ fontSize: '10px', color: COLORS.textDim }}>{h}</th>)}</tr></thead>
              <tbody>{winStats.heatmap.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '12px', color: '#C8D6E5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={r.activity}>{r.activity}</td>
                  {['mid', 'large', 'enterprise'].map(k => (
                    <td key={k} style={{ textAlign: 'center' }}>
                      <div style={{ height: '40px', background: getHeatColor(r[k]), borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, position: 'relative' }}>
                        {r[k] !== null ? `${r[k]}%` : '-'}
                        {r[k] === maxHeat.val && r.activity === maxHeat.activity && <span style={{ position: 'absolute', top: -5, right: -5 }}>⭐</span>}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}</tbody>
            </table>
          ) : (
            <div style={{ display: 'flex', height: '200px', alignItems: 'center', justifyContent: 'center', color: COLORS.textDim }}>No keyword data in this date range.</div>
          )}
        </Card>

        <Card id="win-kw" style={{ position: 'relative' }}>
          <ExportActions onCopy={() => handleExport('win-kw', 'keywords.png', 'copy')} onDownload={() => handleExport('win-kw', 'keywords.png', 'download')} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Keyword Frequency</h2>
          
          <ResponsiveContainer width="100%" height={300}>
            {winStats.keywords.length > 0 ? (
              <BarChart data={winStats.keywords} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="term" width={100} fontSize={12} tick={{ fill: '#C8D6E5' }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>{winStats.keywords.map((e, i) => <Cell key={i} fill={e.category === 'technical' ? COLORS.blue : COLORS.orange} />)}<LabelList dataKey="count" position="right" fill="#3D4751" fontSize={10} /></Bar>
              </BarChart>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: COLORS.textDim }}>No keyword data in this date range.</div>
            )}
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

const PovImpactTab = ({ data, hasGlobalData, handleExport }) => {
  const stats = useMemo(() => {
    const mode = 'POV';
    if (!hasGlobalData) return { 
      mode, winRate: 36.9, n: 244, avgBV: 64000, cycleTime: 104, 
      bands: [
        { label: 'Micro $0–$10K', rate: 15, noPovRate: 20, diff: -5, recColor: '#FF5757', rec: 'Avoid' }, 
        { label: 'Small $10K–$25K', rate: 35, noPovRate: 30, diff: 5, recColor: '#F5C518', rec: 'Selective' },
        { label: 'Mid $25K–$50K', rate: 65, noPovRate: 40, diff: 25, recColor: COLORS.green, rec: 'Deploy' },
        { label: 'Large $50K–$100K', rate: 23.4, noPovRate: 45, diff: -21.6, recColor: '#FF5757', rec: 'Avoid' },
        { label: 'Enterprise $100K+', rate: 82.5, noPovRate: 40, diff: 42.5, recColor: COLORS.blue, rec: 'Mandatory' }
      ] 
    };

    let pT = 0, pW = 0, pBV = 0, pAS = 0, pAC = 0;
    const bands = { micro: { pT: 0, pW: 0, nT: 0, nW: 0 }, small: { pT: 0, pW: 0, nT: 0, nW: 0 }, mid: { pT: 0, pW: 0, nT: 0, nW: 0 }, large: { pT: 0, pW: 0, nT: 0, nW: 0 }, ent: { pT: 0, pW: 0, nT: 0, nW: 0 } };
    data.forEach(d => {
      if (d.product !== 'Vimeo Enterprise' || (d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')) return;
      
      const isP = d.hasPOV;
      const isW = d.stage === 'Closed Won';

      if (isP) { pT++; if (isW) { pW++; pBV += d.value; } if (d.age) { pAS += d.age; pAC++; } }
      const v = d.value || 0; let b = v < 10000 ? bands.micro : v < 25000 ? bands.small : v < 50000 ? bands.mid : v < 100000 ? bands.large : bands.ent;
      if (isP) { b.pT++; if (isW) b.pW++; } else { b.nT++; if (isW) b.nW++; }
    });
    
    const getRec = (r) => r >= 75 ? { rec: 'Mandatory', recColor: COLORS.blue } : r >= 50 ? { rec: 'Deploy', recColor: COLORS.green } : r >= 25 ? { rec: 'Selective', recColor: V.yellow } : { rec: 'Avoid', recColor: COLORS.red };
    const BAND_LABELS = { micro: 'Micro $0–$10K', small: 'Small $10K–$25K', mid: 'Mid $25K–$50K', large: 'Large $50K–$100K', ent: 'Enterprise $100K+' };

    return {
      mode, winRate: pT > 0 ? (pW / pT * 100).toFixed(1) : 0, n: pT, avgBV: pW > 0 ? pBV / pW : 0, cycleTime: pAC > 0 ? Math.round(pAS / pAC) : 0,
      bands: Object.entries(bands).map(([k, b]) => {
        const r = b.pT > 0 ? Number((b.pW / b.pT * 100).toFixed(1)) : 0, nr = b.nT > 0 ? Number((b.nW / b.nT * 100).toFixed(1)) : 0;
        return { label: BAND_LABELS[k], rate: r, noPovRate: nr, diff: Number((r - nr).toFixed(1)), ...getRec(r) };
      })
    };
  }, [data, hasGlobalData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: COLORS.text, margin: 0 }}>Vimeo Enterprise Only</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <Card id="pov-wr" style={{ position: 'relative' }}>
          <ExportActions onCopy={() => handleExport('pov-wr', 'pov-wr.png', 'copy')} onDownload={() => handleExport('pov-wr', 'pov-wr.png', 'download')} />
          <SectionLabel>{stats.mode} WIN RATE</SectionLabel>
          <div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.blue }}>{stats.winRate}%</div>
          <div style={{ fontSize: '12px', color: COLORS.textDim }}>n={stats.n.toLocaleString()} deals</div>
        </Card>
        <Card id="pov-bv" style={{ position: 'relative' }}>
          <ExportActions onCopy={() => handleExport('pov-bv', 'pov-bv.png', 'copy')} onDownload={() => handleExport('pov-bv', 'pov-bv.png', 'download')} />
          <SectionLabel>WON AVG BV</SectionLabel>
          <div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.green }}>{formatCurrency(stats.avgBV)}</div>
        </Card>
        <Card id="pov-age" style={{ position: 'relative' }}>
          <ExportActions onCopy={() => handleExport('pov-age', 'pov-age.png', 'copy')} onDownload={() => handleExport('pov-age', 'pov-age.png', 'download')} />
          <SectionLabel>CYCLE TIME</SectionLabel>
          <div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.orange }}>{stats.cycleTime}d</div>
        </Card>
      </div>

      <Card id="pov-deal-size" style={{ position: 'relative', padding: '24px' }}>
        <ExportActions onCopy={() => handleExport('pov-deal-size', 'pov-deal-size.png', 'copy')} onDownload={() => handleExport('pov-deal-size', 'pov-deal-size.png', 'download')} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>POV Win Rates by Deal Size</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          {stats.bands.map((b, i) => (
            <div key={i} style={{ background: COLORS.bg, borderTop: `1px solid ${b.recColor}`, borderRight: `1px solid ${b.recColor}`, borderBottom: `1px solid ${b.recColor}`, borderLeft: `1px solid ${b.recColor}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#C8D6E5', marginBottom: '12px' }}>{b.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div><div style={{ fontSize: '9px', color: COLORS.textDim }}>{stats.mode.toUpperCase()}</div><div style={{ fontSize: '20px', fontWeight: 700, color: b.recColor }}>{b.rate}%</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '9px', color: COLORS.textDim }}>NO {stats.mode.toUpperCase()}</div><div style={{ fontSize: '20px', fontWeight: 700, color: '#FAFCFD' }}>{b.noPovRate}%</div></div>
              </div>
              <div style={{ marginTop: 'auto', background: hexToRgba(b.recColor, 0.1), color: b.recColor, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textAlign: 'center' }}>
                {b.diff > 0 ? `+${b.diff}` : b.diff}pp
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const TechnicalFitTab = ({ data, hasGlobalData, handleExport }) => {
  const stats = useMemo(() => {
    if (!hasGlobalData) return {
      matrix: [
        { size: '$0–$10K', high: 35, medium: 20, low: 5 },
        { size: '$10K–$25K', high: 45, medium: 28, low: 10 },
        { size: '$25K–$50K', high: 58, medium: 35, low: 15 },
        { size: '$50K–$100K', high: 72, medium: 45, low: 22 },
        { size: '$100K+', high: 88, medium: 55, low: 30 }
      ],
      ageMatrix: [
        { size: '$0–$10K', high: 14, medium: 21, low: 35 },
        { size: '$10K–$25K', high: 25, medium: 38, low: 52 },
        { size: '$25K–$50K', high: 45, medium: 60, low: 85 },
        { size: '$50K–$100K', high: 70, medium: 95, low: 120 },
        { size: '$100K+', high: 90, medium: 130, low: 180 }
      ],
      kpis: { highWR: 72.4, medWR: 35.8, lowWR: 12.2 }
    };

    let hW = 0, hT = 0, mW = 0, mT = 0, lW = 0, lT = 0;
    const bands = [
      { label: '$0–$10K', min: 0, max: 10000, highW: 0, highT: 0, medW: 0, medT: 0, lowW: 0, lowT: 0, highAge: 0, highAgeC: 0, medAge: 0, medAgeC: 0, lowAge: 0, lowAgeC: 0 },
      { label: '$10K–$25K', min: 10000, max: 25000, highW: 0, highT: 0, medW: 0, medT: 0, lowW: 0, lowT: 0, highAge: 0, highAgeC: 0, medAge: 0, medAgeC: 0, lowAge: 0, lowAgeC: 0 },
      { label: '$25K–$50K', min: 25000, max: 50000, highW: 0, highT: 0, medW: 0, medT: 0, lowW: 0, lowT: 0, highAge: 0, highAgeC: 0, medAge: 0, medAgeC: 0, lowAge: 0, lowAgeC: 0 },
      { label: '$50K–$100K', min: 50000, max: 100000, highW: 0, highT: 0, medW: 0, medT: 0, lowW: 0, lowT: 0, highAge: 0, highAgeC: 0, medAge: 0, medAgeC: 0, lowAge: 0, lowAgeC: 0 },
      { label: '$100K+', min: 100000, max: Infinity, highW: 0, highT: 0, medW: 0, medT: 0, lowW: 0, lowT: 0, highAge: 0, highAgeC: 0, medAge: 0, medAgeC: 0, lowAge: 0, lowAgeC: 0 }
    ];

    data.forEach(d => {
      if (d.stage !== 'Closed Won' && d.stage !== 'Closed Lost') return;
      const isWon = d.stage === 'Closed Won';
      const isSE = d.hasSE === "1" || String(d.hasSE).toLowerCase() === 'true' || String(d.hasSE).toLowerCase() === 'yes';
      
      if (!isSE) return;

      let fit = 'unrated';
      const val = String(d.technicalFit || '').toLowerCase();
      if (val) {
        if (val.includes('strong') || val.includes('high') || val.includes('great') || val === '5' || val === '4') fit = 'high';
        else if (val.includes('medium') || val.includes('avg') || val.includes('average') || val.includes('neutral') || val === '3') fit = 'medium';
        else if (val.includes('weak') || val.includes('low') || val.includes('poor') || val === '2' || val === '1') fit = 'low';
      }

      if (fit === 'high') { hT++; if (isWon) hW++; }
      if (fit === 'medium') { mT++; if (isWon) mW++; }
      if (fit === 'low') { lT++; if (isWon) lW++; }

      const v = d.value || 0;
      const age = d.age || 0;
      const b = bands.find(b => v >= b.min && v < b.max) || bands[bands.length - 1];
      if (b) {
        if (fit === 'high') { b.highT++; if (isWon) b.highW++; if (age > 0) { b.highAge += age; b.highAgeC++; } }
        else if (fit === 'medium') { b.medT++; if (isWon) b.medW++; if (age > 0) { b.medAge += age; b.medAgeC++; } }
        else if (fit === 'low') { b.lowT++; if (isWon) b.lowW++; if (age > 0) { b.lowAge += age; b.lowAgeC++; } }
      }
    });

    return {
      matrix: bands.map(b => ({
        size: b.label,
        high: b.highT > 0 ? Math.round((b.highW / b.highT) * 100) : null,
        medium: b.medT > 0 ? Math.round((b.medW / b.medT) * 100) : null,
        low: b.lowT > 0 ? Math.round((b.lowW / b.lowT) * 100) : null
      })),
      ageMatrix: bands.map(b => ({
        size: b.label,
        high: b.highAgeC > 0 ? Math.round(b.highAge / b.highAgeC) : null,
        medium: b.medAgeC > 0 ? Math.round(b.medAge / b.medAgeC) : null,
        low: b.lowAgeC > 0 ? Math.round(b.lowAge / b.lowAgeC) : null
      })),
      kpis: {
        highWR: hT > 0 ? (hW / hT * 100).toFixed(1) : 0,
        medWR: mT > 0 ? (mW / mT * 100).toFixed(1) : 0,
        lowWR: lT > 0 ? (lW / lT * 100).toFixed(1) : 0
      }
    };
  }, [data, hasGlobalData]);

  const getHeatColor = (v, type) => {
    if (v === null) return 'transparent';
    if (type === 'high') return v >= 70 ? COLORS.greenDark : v >= 50 ? COLORS.green : 'rgba(154, 232, 94, 0.2)';
    if (type === 'medium') return v >= 40 ? V.orange60 : v >= 25 ? COLORS.orange : 'rgba(250, 156, 88, 0.2)';
    if (type === 'low') return v >= 20 ? V.red60 : v >= 10 ? COLORS.red : 'rgba(254, 99, 99, 0.2)';
    return 'transparent';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <Card id="fit-kpi-low" style={{ position: 'relative' }}>
          <ExportActions onCopy={() => handleExport('fit-kpi-low', 'low-fit.png', 'copy')} onDownload={() => handleExport('fit-kpi-low', 'low-fit.png', 'download')} />
          <SectionLabel>LOW FIT WIN RATE</SectionLabel>
          <div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.red }}>{stats.kpis.lowWR}%</div>
        </Card>
        <Card id="fit-kpi-med" style={{ position: 'relative' }}>
          <ExportActions onCopy={() => handleExport('fit-kpi-med', 'med-fit.png', 'copy')} onDownload={() => handleExport('fit-kpi-med', 'med-fit.png', 'download')} />
          <SectionLabel>MEDIUM FIT WIN RATE</SectionLabel>
          <div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.orange }}>{stats.kpis.medWR}%</div>
        </Card>
        <Card id="fit-kpi-high" style={{ position: 'relative' }}>
          <ExportActions onCopy={() => handleExport('fit-kpi-high', 'high-fit.png', 'copy')} onDownload={() => handleExport('fit-kpi-high', 'high-fit.png', 'download')} />
          <SectionLabel>HIGH FIT WIN RATE</SectionLabel>
          <div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.green }}>{stats.kpis.highWR}%</div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <Card id="fit-bar-chart" style={{ position: 'relative', height: '420px' }}>
          <ExportActions onCopy={() => handleExport('fit-bar-chart', 'fit-bars.png', 'copy')} onDownload={() => handleExport('fit-bar-chart', 'fit-bars.png', 'download')} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Win Rate by Deal Size & Technical Fit</h2>
          <div style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.matrix} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.borderMuted} />
                <XAxis dataKey="size" stroke={COLORS.textDim} tick={{ fill: COLORS.textDim, fontSize: 11 }} tickLine={false} axisLine={{ stroke: COLORS.border }} dy={10} />
                <YAxis stroke={COLORS.textDim} tickFormatter={(val) => `${val}%`} tick={{ fill: COLORS.textDim, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: COLORS.border, opacity: 0.4 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: COLORS.textSub }} />
                <Bar dataKey="low" name="Low Fit" fill={COLORS.red} radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium" name="Medium Fit" fill={COLORS.orange} radius={[4, 4, 0, 0]} />
                <Bar dataKey="high" name="High Fit" fill={COLORS.green} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card id="fit-heatmap" style={{ position: 'relative' }}>
          <ExportActions onCopy={() => handleExport('fit-heatmap', 'fit-heatmap.png', 'copy')} onDownload={() => handleExport('fit-heatmap', 'fit-heatmap.png', 'download')} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Heatmap Analysis</h2>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '6px' }}>
            <thead>
              <tr>
                <th />
                {['LOW', 'MEDIUM', 'HIGH'].map(h => <th key={h} style={{ fontSize: '10px', color: COLORS.textDim, paddingBottom: '8px' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {stats.matrix.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '11px', color: '#C8D6E5', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.size}</td>
                  {['low', 'medium', 'high'].map(k => (
                    <td key={k} style={{ textAlign: 'center', width: '28%' }}>
                      <div style={{ height: '36px', background: getHeatColor(r[k], k), borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: r[k] !== null ? '#FAFCFD' : 'transparent', fontSize: '13px' }}>
                        {r[k] !== null ? `${r[k]}%` : '-'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: '20px', fontSize: '12px', color: COLORS.textDim, fontStyle: 'italic' }}>
            Technical Fit ratings are extracted natively from outcome and fit notes attached to opportunities.
          </p>
        </Card>
      </div>

      <Card id="fit-age-chart" style={{ position: 'relative' }}>
        <ExportActions onCopy={() => handleExport('fit-age-chart', 'fit-age.png', 'copy')} onDownload={() => handleExport('fit-age-chart', 'fit-age.png', 'download')} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Deal Age by Deal Size & Technical Fit</h2>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '6px' }}>
          <thead>
            <tr>
              <th />
              {['LOW', 'MEDIUM', 'HIGH'].map(h => <th key={h} style={{ fontSize: '10px', color: COLORS.textDim, paddingBottom: '8px' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {stats.ageMatrix.map((r, i) => (
              <tr key={i}>
                <td style={{ fontSize: '11px', color: '#C8D6E5', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.size}</td>
                {['low', 'medium', 'high'].map(k => {
                  const maxAge = Math.max(...stats.ageMatrix.flatMap(m => [m.high, m.medium, m.low].filter(v => v !== null)), 1);
                  const val = r[k];
                  let bgColor = 'transparent';
                  let textColor = 'transparent';
                  
                  if (val !== null) {
                    const ratio = val / maxAge;
                    if (ratio <= 0.20) {
                      bgColor = COLORS.greenDark; // Very Fast
                      textColor = '#FAFCFD';
                    } else if (ratio <= 0.40) {
                      bgColor = COLORS.green; // Fast
                      textColor = '#0A0E12'; // Dark text for light green
                    } else if (ratio <= 0.60) {
                      bgColor = V.yellow; // Average
                      textColor = '#0A0E12'; // Dark text for yellow
                    } else if (ratio <= 0.80) {
                      bgColor = COLORS.orange; // Slow
                      textColor = '#0A0E12'; // Dark text for orange
                    } else {
                      bgColor = COLORS.red; // Very Slow
                      textColor = '#FAFCFD';
                    }
                  }

                  return (
                    <td key={k} style={{ textAlign: 'center', width: '28%' }}>
                      <div style={{ height: '36px', background: bgColor, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: textColor, fontSize: '13px' }}>
                        {val !== null ? `${val}d` : '-'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: '20px', fontSize: '12px', color: COLORS.textDim, fontStyle: 'italic' }}>
          Average duration (in days) from opportunity creation to closed won.
        </p>
      </Card>
    </div>
  );
};

const LossAnalysisTab = ({ data, hasGlobalData, handleExport }) => {
  const stats = useMemo(() => {
    if (!hasGlobalData) return {
      totalLostBV: 12500000,
      totalLostDeals: 342,
      avgAge: 52,
      reasons: [
        { reason: 'Price/Budget', count: 145 },
        { reason: 'Missing Feature', count: 82 },
        { reason: 'Went with Competitor', count: 64 },
        { reason: 'Project Cancelled', count: 31 },
        { reason: 'Poor Technical Fit', count: 20 }
      ],
      dealSizes: [
        { size: '$0–$10K', count: 145 },
        { size: '$10K–$25K', count: 89 },
        { size: '$25K–$50K', count: 62 },
        { size: '$50K–$100K', count: 34 },
        { size: '$100K+', count: 12 }
      ]
    };

    let tBV = 0, tDeals = 0, tAge = 0, ageCount = 0;
    const rMap = {};
    const bands = {
      micro: { label: '$0–$10K', count: 0, min: 0, max: 10000 },
      small: { label: '$10K–$25K', count: 0, min: 10000, max: 25000 },
      mid: { label: '$25K–$50K', count: 0, min: 25000, max: 50000 },
      large: { label: '$50K–$100K', count: 0, min: 50000, max: 100000 },
      ent: { label: '$100K+', count: 0, min: 100000, max: Infinity }
    };

    data.forEach(d => {
      if (d.stage !== 'Closed Lost') return;
      const isSE = d.hasSE === "1" || String(d.hasSE).toLowerCase() === 'true' || String(d.hasSE).toLowerCase() === 'yes';
      if (!isSE) return;

      tDeals++;
      tBV += d.value || 0;
      if (d.age) { tAge += d.age; ageCount++; }

      const v = d.value || 0;
      const b = Object.values(bands).find(b => v >= b.min && v < b.max) || bands.ent;
      b.count++;

      const r = (d.lossReason || 'Unknown').trim();
      const rLower = r.toLowerCase();
      if (r && rLower !== 'unknown' && rLower !== 'clean up/duplicate' && rLower !== 'duplicate' && rLower !== 'clean up') { 
        rMap[r] = (rMap[r] || 0) + 1; 
      }
    });

    const sortAndTop = (map, keyName) => Object.entries(map)
      .map(([k, v]) => ({ [keyName]: k, count: v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalLostBV: tBV,
      totalLostDeals: tDeals,
      avgAge: ageCount > 0 ? Math.round(tAge / ageCount) : 0,
      reasons: sortAndTop(rMap, 'reason'),
      dealSizes: Object.values(bands).map(b => ({ size: b.label, count: b.count }))
    };
  }, [data, hasGlobalData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <Card id="loss-kpi-bv" style={{ position: 'relative' }} accentColor={COLORS.red}>
           <ExportActions onCopy={() => handleExport('loss-kpi-bv', 'lost-bv.png', 'copy')} onDownload={() => handleExport('loss-kpi-bv', 'lost-bv.png', 'download')} />
           <SectionLabel>SE ATTACHED LOST BV</SectionLabel>
           <div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.text }}>{formatCurrency(stats.totalLostBV)}</div>
        </Card>
        <Card id="loss-kpi-deals" style={{ position: 'relative' }}>
           <ExportActions onCopy={() => handleExport('loss-kpi-deals', 'lost-deals.png', 'copy')} onDownload={() => handleExport('loss-kpi-deals', 'lost-deals.png', 'download')} />
           <SectionLabel>LOST DEALS (SE ATTACHED)</SectionLabel>
           <div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.text }}>{stats.totalLostDeals.toLocaleString()}</div>
        </Card>
        <Card id="loss-kpi-age" style={{ position: 'relative' }}>
           <ExportActions onCopy={() => handleExport('loss-kpi-age', 'lost-age.png', 'copy')} onDownload={() => handleExport('loss-kpi-age', 'lost-age.png', 'download')} />
           <SectionLabel>AVG AGE OF LOST DEALS</SectionLabel>
           <div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.orange }}>{stats.avgAge}d</div>
        </Card>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <Card id="loss-reasons" style={{ position: 'relative', height: '400px' }}>
           <ExportActions onCopy={() => handleExport('loss-reasons', 'loss-reasons.png', 'copy')} onDownload={() => handleExport('loss-reasons', 'loss-reasons.png', 'download')} />
           <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Top Primary Loss Reasons</h2>
           {stats.reasons.length > 0 ? (
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.reasons} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="reason" width={220} fontSize={13} tick={{ fill: COLORS.text }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: COLORS.border, opacity: 0.4 }} content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Deals Lost" radius={[0, 4, 4, 0]}>
                    {stats.reasons.map((entry, index) => {
                      const colors = [COLORS.red, COLORS.orange, V.yellow, COLORS.blue, COLORS.indigo, COLORS.green];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                    <LabelList dataKey="count" position="right" fill={COLORS.text} fontSize={13} />
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
           ) : (
             <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textDim }}>No loss reason data found</div>
           )}
        </Card>
      </div>

      <Card id="loss-deal-sizes" style={{ position: 'relative', height: '350px' }}>
         <ExportActions onCopy={() => handleExport('loss-deal-sizes', 'loss-sizes.png', 'copy')} onDownload={() => handleExport('loss-deal-sizes', 'loss-sizes.png', 'download')} />
         <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>SE Attached Losses by Deal Size</h2>
         <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.dealSizes} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.borderMuted} />
              <XAxis dataKey="size" stroke={COLORS.textDim} tick={{ fill: COLORS.textDim, fontSize: 12 }} tickLine={false} axisLine={{ stroke: COLORS.border }} dy={10} />
              <YAxis stroke={COLORS.textDim} tick={{ fill: COLORS.textDim, fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip cursor={{ fill: COLORS.border, opacity: 0.4 }} content={<CustomTooltip />} />
              <Bar dataKey="count" name="Deals Lost" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
         </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────
export default function App() {
  const TABS = ['Revenue Impact', 'Win Rate', 'Attachment Rate', 'POV Analysis', 'Technical Fit', 'Loss Analysis'];
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadedRows, setLoadedRows] = useState(0);
  const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2025-12-31' });
  const [productFilter, setProductFilter] = useState('All');

  const getFuzzyCol = (row, searchTerms) => {
    const keys = Object.keys(row);
    for (const term of searchTerms) {
      const match = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === term.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (match && row[match]) return row[match];
    }
    for (const term of searchTerms) {
      const match = keys.find(k => k.toLowerCase().includes(term.toLowerCase()));
      if (match && row[match]) return row[match];
    }
    return "";
  };

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0]; if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const results = parseCSVToObjects(event.target.result);
      const parsedData = results.map(row => {
        const closeDate = row["Close Date"] ? new Date(row["Close Date"]) : null;
        const createdDate = (row["Created Date"] || row["Create Date"]) ? new Date(row["Created Date"] || row["Create Date"]) : null;
        let age = parseInt(row["Age"]) || 0;
        if (!age && closeDate && createdDate) age = Math.floor((closeDate - createdDate) / 86400000);
        
        return {
          date: closeDate,
          monthKey: closeDate && !isNaN(closeDate) ? `${closeDate.getFullYear()}-${String(closeDate.getMonth() + 1).padStart(2, '0')}` : "",
          monthLabel: closeDate && !isNaN(closeDate) ? `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][closeDate.getMonth()]} ${closeDate.getFullYear()}` : "",
          value: parseFloat(String(row["Bookings Value"] || row["Amount"] || row["Value"] || "0").replace(/[^0-9.-]+/g, "")) || 0,
          type: row["Type"], product: row["Product Type"], stage: row["Stage"],
          hasSE: getFuzzyCol(row, ['has solutions engineer', 'se attached', 'has se']) || row["Has Solutions Engineer?"],
          ae: row["Account Executive"] || row["Opportunity Owner"] || "", se: row["Solutions Engineer"] || "",
          region: row["Owner Region"] || row["Region"] || "", 
          stageWhenSEAssigned: getFuzzyCol(row, ['stage when se assigned', 'se assignment stage']) || row["Stage When SE Assigned"] || "",
          keywords: getFuzzyCol(row, ['keyword', 'fit notes', 'outcome']) || row["Keywords"] || row["Technical Keywords"] || row["Technical Fit Notes"] || row["Own the Technical Outcome"] || "",
          seActivity: getFuzzyCol(row, ['se activity', 'primary activity', 'activity type', 'activity']) || row["SE Activity"] || row["Primary Activity"] || row["Activity Type"] || row["Activity"] || "",
          technicalFit: getFuzzyCol(row, ['technical fit', 'fit rating', 'fit score', 'fit']) || row["Technical Fit"] || "",
          lossReason: getFuzzyCol(row, ['reason for lost opportunity', 'loss reason', 'closed lost reason', 'reason for loss', 'reason lost']) || row["Reason for Lost Opportunity"] || row["Loss Reason"] || "",
          age, hasPOV: (() => {
            const povVal = getFuzzyCol(row, ['pov start', 'trial start', 'pov date', 'pov']) || row["POV Start Date"] || row["Trial Start Date"];
            return !!povVal && String(povVal).toLowerCase() !== 'false' && String(povVal).toLowerCase() !== 'no' && String(povVal).trim() !== '0';
          })()
        };
      });
      setData(parsedData); setLoadedRows(parsedData.length); setLoading(false);
    };
    reader.readAsText(file, 'iso-8859-1');
  }, []);

  const handleExport = useCallback(async (nodeId, filename, action) => {
    const node = document.getElementById(nodeId); if (!node) return;
    try {
      const clone = node.cloneNode(true);
      clone.querySelectorAll('.export-actions').forEach(btn => btn.remove());
      const width = node.offsetWidth, height = node.offsetHeight;
      clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      const htmlStr = new XMLSerializer().serializeToString(clone);
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><style>* { box-sizing: border-box; font-family: 'Inter Tight', sans-serif; }</style><foreignObject width="100%" height="100%">${htmlStr}</foreignObject></svg>`;
      const canvas = document.createElement("canvas"); canvas.width = width * 2; canvas.height = height * 2;
      const ctx = canvas.getContext("2d"); ctx.scale(2, 2);
      const img = new Image(); const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (action === 'download') { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); }
          else if (navigator.clipboard) { navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => alert("Copied!")); }
          URL.revokeObjectURL(url);
        });
      };
      img.src = url;
    } catch (e) { alert("Export failed."); }
  }, []);

  const dateFilteredData = useMemo(() => {
    const start = dateRange.start ? new Date(dateRange.start) : null;
    const end = dateRange.end ? new Date(dateRange.end) : null;
    return data.filter(d => (!start || (d.date && d.date >= start)) && (!end || (d.date && d.date <= end)));
  }, [data, dateRange]);

  const productFilteredData = useMemo(() =>
    productFilter === 'All' ? dateFilteredData : dateFilteredData.filter(d => d.product === productFilter),
  [dateFilteredData, productFilter]);

  const baseFilteredData = useMemo(() => productFilteredData.filter(d => d.stage === "Closed Won"), [productFilteredData]);
  const seFilteredData = useMemo(() => baseFilteredData.filter(d => d.hasSE === "1" || String(d.hasSE).toLowerCase() === 'true' || String(d.hasSE).toLowerCase() === 'yes'), [baseFilteredData]);

  const revKpis = useMemo(() => {
    let nb = 0, upsell = 0, crossSell = 0, total = 0, deals = 0, nbDeals = 0;
    seFilteredData.forEach(d => {
      total += d.value; deals += 1;
      if (d.type === "New Business") { nb += d.value; nbDeals += 1; }
      if (d.type === "Upsell") upsell += d.value;
      if (d.type === "Cross-Sell") crossSell += d.value;
    });
    const expansion = upsell + crossSell;
    return { 
      nb, nbDeals, upsell, crossSell, expansion, total, deals,
      nbPct: total > 0 ? ((nb / total) * 100).toFixed(1) : 0,
      expPct: total > 0 ? ((expansion / total) * 100).toFixed(1) : 0
    };
  }, [seFilteredData]);

  const donutData = useMemo(() => {
    const validProducts = ["Vimeo Enterprise", "OTT", "Vimeo Custom"];
    const map = {
      "Vimeo Enterprise": { bookings: 0, seDeals: 0, totalDeals: 0 },
      "OTT": { bookings: 0, seDeals: 0, totalDeals: 0 },
      "Vimeo Custom": { bookings: 0, seDeals: 0, totalDeals: 0 }
    };
    let totalTracked = 0;

    baseFilteredData.forEach(d => {
      if (validProducts.includes(d.product)) {
        map[d.product].totalDeals += 1;
        
        const isSE = d.hasSE === "1" || String(d.hasSE).toLowerCase() === 'true' || String(d.hasSE).toLowerCase() === 'yes';
        if (isSE) {
          map[d.product].bookings += d.value;
          map[d.product].seDeals += 1;
          totalTracked += d.value;
        }
      }
    });

    const data = [
      { name: "Vimeo Enterprise", value: map["Vimeo Enterprise"].bookings, seDeals: map["Vimeo Enterprise"].seDeals, totalDeals: map["Vimeo Enterprise"].totalDeals, color: COLORS.chart[0] },
      { name: "OTT", value: map["OTT"].bookings, seDeals: map["OTT"].seDeals, totalDeals: map["OTT"].totalDeals, color: COLORS.chart[1] },
      { name: "Vimeo Custom", value: map["Vimeo Custom"].bookings, seDeals: map["Vimeo Custom"].seDeals, totalDeals: map["Vimeo Custom"].totalDeals, color: COLORS.chart[2] }
    ].filter(d => d.value > 0);

    data.forEach(d => {
      d.attachmentRate = d.totalDeals > 0 ? Math.round((d.seDeals / d.totalDeals) * 100) : 0;
    });

    return { data, totalTracked };
  }, [baseFilteredData]);

  const barData = useMemo(() => {
    const monthsMap = {};
    baseFilteredData.forEach(d => {
      if (!d.monthKey) return;
      if (!monthsMap[d.monthKey]) monthsMap[d.monthKey] = { monthKey: d.monthKey, monthLabel: d.monthLabel, "New Business": 0, "Expansion": 0, totalCompany: 0 };
      monthsMap[d.monthKey].totalCompany += d.value;
      
      const isSE = d.hasSE === "1" || String(d.hasSE).toLowerCase() === 'true' || String(d.hasSE).toLowerCase() === 'yes';
      if (isSE) {
        if (d.type === "New Business") monthsMap[d.monthKey]["New Business"] += d.value;
        else if (d.type === "Upsell" || d.type === "Cross-Sell") monthsMap[d.monthKey]["Expansion"] += d.value;
      }
    });
    return Object.values(monthsMap).sort((a, b) => a.monthKey.localeCompare(b.monthKey)).map(m => {
      const totalSE = m["New Business"] + m["Expansion"];
      return { ...m, sePercentage: parseFloat((m.totalCompany > 0 ? (totalSE / m.totalCompany) * 100 : 0).toFixed(1)) };
    });
  }, [baseFilteredData]);

  const segmentStats = useMemo(() => {
    const hasGlobalData = data.length > 0;
    if (!hasGlobalData) return [
      { segment: 'Micro', avgRev: 8500 },
      { segment: 'Small', avgRev: 22000 },
      { segment: 'Mid', avgRev: 65000 },
      { segment: 'Large', avgRev: 145000 },
      { segment: 'Enterprise', avgRev: 380000 }
    ];

    const bands = { micro: { bv: 0, ses: new Set() }, small: { bv: 0, ses: new Set() }, mid: { bv: 0, ses: new Set() }, large: { bv: 0, ses: new Set() }, ent: { bv: 0, ses: new Set() } };
    
    productFilteredData.forEach(d => {
      if (d.product !== 'Vimeo Enterprise' || d.stage !== 'Closed Won') return;
      const isSE = d.hasSE === "1" || String(d.hasSE).toLowerCase() === 'true' || String(d.hasSE).toLowerCase() === 'yes';
      if (isSE && d.se && d.se !== "Unknown") {
        const v = d.value || 0;
        let b = v < 10000 ? bands.micro : v < 25000 ? bands.small : v < 50000 ? bands.mid : v < 100000 ? bands.large : bands.ent;
        b.bv += v;
        b.ses.add(d.se);
      }
    });

    return [
      { segment: 'Micro $0–$10K', avgRev: bands.micro.ses.size > 0 ? Math.round(bands.micro.bv / bands.micro.ses.size) : 0 },
      { segment: 'Small $10K–$25K', avgRev: bands.small.ses.size > 0 ? Math.round(bands.small.bv / bands.small.ses.size) : 0 },
      { segment: 'Mid $25K–$50K', avgRev: bands.mid.ses.size > 0 ? Math.round(bands.mid.bv / bands.mid.ses.size) : 0 },
      { segment: 'Large $50K–$100K', avgRev: bands.large.ses.size > 0 ? Math.round(bands.large.bv / bands.large.ses.size) : 0 },
      { segment: 'Enterprise $100K+', avgRev: bands.ent.ses.size > 0 ? Math.round(bands.ent.bv / bands.ent.ses.size) : 0 }
    ];
  }, [productFilteredData, data.length]);

  return (
    <div style={{ fontFamily: 'Inter Tight, sans-serif', backgroundColor: COLORS.bg, color: COLORS.text, minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(10, 14, 18, 0.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ padding: '16px 32px 8px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ cursor: 'pointer', backgroundColor: COLORS.blue, color: '#000', padding: '8px 16px', borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeft: 'none', borderRadius: '6px', fontWeight: 700 }}>
              {loading ? 'Parsing...' : 'Upload CSV'}
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
            {loadedRows > 0 && <div style={{ fontSize: '12px', color: COLORS.green }}>{loadedRows.toLocaleString()} rows loaded</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} style={{ background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, borderLeft: `1px solid ${COLORS.border}`, color: '#fff', padding: '4px 8px', borderRadius: '4px' }} />
              <span>to</span>
              <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} style={{ background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, borderLeft: `1px solid ${COLORS.border}`, color: '#fff', padding: '4px 8px', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {['All', 'Vimeo Enterprise', 'OTT', 'Vimeo Custom'].map(p => (
                <button key={p} onClick={() => setProductFilter(p)} style={{ background: productFilter === p ? COLORS.blue : 'transparent', color: productFilter === p ? COLORS.bg : COLORS.textDim, border: `1px solid ${productFilter === p ? COLORS.blue : COLORS.border}`, borderRadius: '4px', padding: '3px 10px', fontSize: '11px', fontWeight: productFilter === p ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '0 32px 16px 32px', color: COLORS.blue, fontSize: '20px', fontWeight: 600 }}>Solutions Engineering</div>
        <div style={{ display: 'flex', padding: '0 32px', gap: '24px' }}>
          {TABS.map(t => <button key={t} onClick={() => setActiveTab(t)} style={{ background: 'none', borderTop: 'none', borderRight: 'none', borderLeft: 'none', borderBottom: activeTab === t ? `2px solid ${COLORS.blue}` : 'none', color: activeTab === t ? '#fff' : COLORS.textDim, padding: '12px 0', cursor: 'pointer', fontWeight: 600 }}>{t}</button>)}
        </div>
      </div>

      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'Win Rate' ? <WinRateTab data={productFilteredData} dateRange={dateRange} hasGlobalData={data.length > 0} handleExport={handleExport} /> :
         activeTab === 'Attachment Rate' ? <AttachmentRateDashboard data={productFilteredData} dateRange={dateRange} hasGlobalData={data.length > 0} handleExport={handleExport} /> :
         activeTab === 'POV Analysis' ? <PovImpactTab data={productFilteredData} hasGlobalData={data.length > 0} handleExport={handleExport} /> :
         activeTab === 'Technical Fit' ? <TechnicalFitTab data={productFilteredData} hasGlobalData={data.length > 0} handleExport={handleExport} /> :
         activeTab === 'Loss Analysis' ? <LossAnalysisTab data={productFilteredData} hasGlobalData={data.length > 0} handleExport={handleExport} /> :
         activeTab === 'Revenue Impact' && data.length === 0 ? (
          <div style={{ borderTop: `2px dashed ${COLORS.borderMuted}`, borderRight: `2px dashed ${COLORS.borderMuted}`, borderBottom: `2px dashed ${COLORS.borderMuted}`, borderLeft: `2px dashed ${COLORS.borderMuted}`, borderRadius: '12px', padding: '64px', textAlign: 'center', marginTop: '64px', color: COLORS.textMuted }}>
            <h2 style={{ margin: '0 0 8px 0', color: COLORS.text }}>No Data Loaded</h2>
            <p style={{ margin: 0, fontSize: '14px', color: COLORS.textDim }}>Upload your Salesforce CSV export to view the SE performance dashboard.</p>
          </div>
         ) : activeTab === 'Revenue Impact' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
              <Card id="kpi-nb-card" accentColor={COLORS.blue} style={{ position: 'relative' }}>
                <ExportActions onCopy={() => handleExport('kpi-nb-card', 'new-business.png', 'copy')} onDownload={() => handleExport('kpi-nb-card', 'new-business.png', 'download')} />
                <SectionLabel>NEW BUSINESS</SectionLabel>
                <div style={{ fontSize: '48px', fontWeight: 700, margin: '8px 0', color: COLORS.text }}>{formatCurrency(revKpis.nb)}</div>
                <div style={{ fontSize: '16px', color: COLORS.textMuted }}>{revKpis.nbDeals.toLocaleString()} deals &middot; {revKpis.nbPct}% of total</div>
              </Card>
              <Card id="kpi-exp-card" accentColor={COLORS.green} style={{ position: 'relative' }}>
                <ExportActions onCopy={() => handleExport('kpi-exp-card', 'expansion.png', 'copy')} onDownload={() => handleExport('kpi-exp-card', 'expansion.png', 'download')} />
                <SectionLabel>EXPANSION</SectionLabel>
                <div style={{ fontSize: '48px', fontWeight: 700, margin: '8px 0', color: COLORS.text }}>{formatCurrency(revKpis.expansion)}</div>
                <div style={{ fontSize: '16px', color: COLORS.textMuted }}>Upsell {formatCurrency(revKpis.upsell)} &middot; Cross-Sell {formatCurrency(revKpis.crossSell)} &middot; {revKpis.expPct}% of total</div>
              </Card>
              <Card id="kpi-total-card" accentColor={COLORS.indigo} style={{ position: 'relative' }}>
                <ExportActions onCopy={() => handleExport('kpi-total-card', 'total-bookings.png', 'copy')} onDownload={() => handleExport('kpi-total-card', 'total-bookings.png', 'download')} />
                <SectionLabel>TOTAL SE BOOKINGS</SectionLabel>
                <div style={{ fontSize: '48px', fontWeight: 700, margin: '8px 0', color: COLORS.text }}>{formatCurrency(revKpis.total)}</div>
                <div style={{ fontSize: '16px', color: COLORS.textMuted }}>{revKpis.deals.toLocaleString()} total deals across all types</div>
              </Card>
            </div>
            <Card id="donut-chart-card" style={{ marginBottom: '24px', position: 'relative' }}>
              <ExportActions onCopy={() => handleExport('donut-chart-card', 'se-bookings-product.png', 'copy')} onDownload={() => handleExport('donut-chart-card', 'se-bookings-product.png', 'download')} />
              <SectionLabel>SE Bookings by Product Type</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px', minHeight: '280px' }}>
                {donutData.data.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '64px', maxWidth: '800px', width: '100%' }}>
                    <div style={{ position: 'relative', width: '260px', height: '260px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donutData.data} innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value" stroke="none">
                            {donutData.data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <span style={{ fontSize: '12px', color: COLORS.textDim, fontWeight: 600, letterSpacing: '0.05em' }}>TOTAL</span>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: COLORS.text }}>{formatCurrency(donutData.totalTracked)}</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {donutData.data.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '16px', padding: '4px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: item.color }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ color: COLORS.textSub, fontWeight: 500 }}>{item.name}</span>
                              <span style={{ color: COLORS.textDim, fontSize: '12px', marginTop: '2px' }}>
                                {item.attachmentRate}% SE Attached ({item.seDeals}/{item.totalDeals} deals)
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <span style={{ fontWeight: 600, color: COLORS.text }}>{formatCurrency(item.value)}</span>
                            <span style={{ color: COLORS.textDim, width: '40px', textAlign: 'right' }}>{((item.value / donutData.totalTracked) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <div style={{ color: COLORS.textDim, height: '100%', display: 'flex', alignItems: 'center' }}>No valid product data found in this range</div>}
              </div>
            </Card>
            <Card id="bar-chart-card" style={{ minHeight: '400px', position: 'relative' }}>
              <ExportActions onCopy={() => handleExport('bar-chart-card', 'se-monthly-trend.png', 'copy')} onDownload={() => handleExport('bar-chart-card', 'se-monthly-trend.png', 'download')} />
              <SectionLabel>Monthly SE Bookings by Type & % of Total Revenue</SectionLabel>
              <div style={{ height: '400px', marginTop: '24px' }}>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={barData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.borderMuted} />
                      <XAxis dataKey="monthLabel" stroke={COLORS.textDim} tick={{ fill: COLORS.textDim, fontSize: 12 }} tickLine={false} axisLine={{ stroke: COLORS.border }} dy={10} />
                      <YAxis yAxisId="left" stroke={COLORS.textDim} tickFormatter={formatCurrency} tick={{ fill: COLORS.textDim, fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                      <YAxis yAxisId="right" orientation="right" stroke={COLORS.textDim} tickFormatter={(val) => `${val}%`} tick={{ fill: COLORS.textDim, fontSize: 12 }} tickLine={false} axisLine={false} dx={10} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: COLORS.border, opacity: 0.4 }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: COLORS.textSub }} />
                      <Bar yAxisId="left" dataKey="New Business" stackId="a" fill={COLORS.chart[0]} radius={[0, 0, 4, 4]} />
                      <Bar yAxisId="left" dataKey="Expansion" stackId="a" fill={COLORS.chart[1]} radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="sePercentage" name="SE % of Total Revenue" stroke={COLORS.indigo} strokeWidth={3} dot={{ r: 4, fill: COLORS.indigo, stroke: COLORS.bg, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : <div style={{ color: COLORS.textDim, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No trend data found in this range</div>}
              </div>
            </Card>
            <Card id="se-rev-segment" style={{ position: 'relative', height: '400px', marginTop: '24px' }}>
              <ExportActions onCopy={() => handleExport('se-rev-segment', 'se-rev-segment.png', 'copy')} onDownload={() => handleExport('se-rev-segment', 'se-rev-segment.png', 'download')} />
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Average Revenue per SE by Segment</h2>
              <div style={{ height: '300px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segmentStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.borderMuted} />
                    <XAxis dataKey="segment" stroke={COLORS.textDim} tick={{ fill: COLORS.textDim, fontSize: 12 }} tickLine={false} axisLine={{ stroke: COLORS.border }} dy={10} />
                    <YAxis stroke={COLORS.textDim} tickFormatter={formatCurrency} tick={{ fill: COLORS.textDim, fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: COLORS.border, opacity: 0.4 }} />
                    <Bar dataKey="avgRev" name="Avg Revenue per SE" radius={[4, 4, 0, 0]}>
                      {segmentStats.map((entry, index) => {
                        let color = COLORS.blue; // Best (>= $200k)
                        if (entry.avgRev < 20000) color = COLORS.red; // Poor (< $20k)
                        else if (entry.avgRev < 65000) color = V.yellow; // OK ($20k - $65k)
                        else if (entry.avgRev < 200000) color = COLORS.green; // Good ($65k - $200k)
                        
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
         ) :
         <div style={{ padding: '64px', textAlign: 'center', background: COLORS.card, borderRadius: '12px' }}><h2>{activeTab}</h2><p>Data visualization coming soon.</p></div>}
      </div>
    </div>
  );
}
