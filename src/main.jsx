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

// ─── STATIC FALLBACK DATA ──────────────────────────────────────────
const WIN_RATE_KPIS = {
  'Vimeo Enterprise': {
    overall:        { se: 29.5,  noSe: 48.7,  seSample: 3239,  noSeSample: 18086 },
    newBusiness:    { se: 21.4,  noSe: 17.3,  seSample: 2365,  noSeSample: 7711 },
    expansion:      { se: 29.7,  noSe: 43.7,  seSample: 551,   noSeSample: 2795 },
  },
  'OTT': {
    overall:        { se: 30.7,  noSe: 45.6,  seSample: 215,   noSeSample: 3676 },
    newBusiness:    { se: 26.9,  noSe: 14.5,  seSample: 175,   noSeSample: 1431 },
    expansion:      { se: 21.7,  noSe: 52.1,  seSample: 23,    noSeSample: 457 },
  },
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
  { term: 'Custom', count: 1208, category: 'technical' }, { term: 'Demo', count: 1232, category: 'process' },
  { term: 'API', count: 533, category: 'technical' }, { term: 'Integration', count: 492, category: 'technical' },
  { term: 'Workflow', count: 447, category: 'process' }, { term: 'Trial', count: 396, category: 'process' },
];

const HEATMAP_DATA = [
  { activity: 'Platform Demo', mid: 28, large: 32, enterprise: 38 },
  { activity: 'POV / Trial Support', mid: 23, large: 31, enterprise: 49 },
  { activity: 'Technical Architecture', mid: 36, large: 44, enterprise: 41 },
  { activity: 'Security Review',        mid: 38, large: 42, enterprise: 37 },
  { activity: 'Integration / API',      mid: 29, large: 33, enterprise: 44 },
  { activity: 'Competitive Intel',      mid: 35, large: 40, enterprise: 38 },
  { activity: 'Stakeholder Alignment',  mid: 19, large: 22, enterprise: 27 },
];

const SE_STAGE_DATA = {
  'Vimeo Enterprise': {
    insight: 'Later SE assignment correlates with higher win rates — but deals assigned SEs late have already survived early qualification',
    stages: [{ name: 'Technical Proof', won: 85, total: 199, rate: 42.7 }, { name: 'Business Alignment', won: 126, total: 297, rate: 42.4 }, { name: 'Discovery', won: 96, total: 269, rate: 35.7 }],
  },
  'OTT': {
    insight: 'SE involvement at Technical Proof and Validation stages drives the strongest OTT win rates — early Discovery engagement underperforms',
    stages: [{ name: 'Technical Proof', won: 8, total: 15, rate: 53.3 }, { name: 'Business Alignment', won: 8, total: 17, rate: 47.1 }, { name: 'Discovery', won: 1, total: 12, rate: 8.3 }],
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
      backgroundColor: COLORS.card, border: `1px solid ${currentBorderColor}`, borderLeft: accentColor ? `4px solid ${accentColor}` : `1px solid ${currentBorderColor}`,
      borderRadius: '12px', padding: '20px', transition: 'border-color 0.2s ease', ...style
    }}>{children}</div>
  );
};

const SectionLabel = ({ children, style }) => (
  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.textDim, fontWeight: 600, marginBottom: '8px', ...style }}>{children}</div>
);

const ExportActions = ({ onCopy, onDownload }) => (
  <div className="export-actions" style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
    <button onClick={onCopy} title="Copy" style={{ background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: '4px', cursor: 'pointer', padding: '6px', color: COLORS.textDim }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg></button>
    <button onClick={onDownload} title="Download" style={{ background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: '4px', cursor: 'pointer', padding: '6px', color: COLORS.textDim }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg></button>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, padding: '12px', borderRadius: '8px', color: COLORS.text }}>
        <div style={{ marginBottom: '8px', fontWeight: 600, color: COLORS.textMuted }}>{label}</div>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: 10, height: 10, backgroundColor: entry.color, borderRadius: '2px' }} />
            <span style={{ color: COLORS.textSub }}>{entry.name}:</span>
            <span style={{ fontWeight: 600 }}>{entry.name === "Count" ? entry.value.toLocaleString() : (entry.name.includes('%') || entry.name.includes('Diff') ? `${entry.value}%` : formatCurrency(entry.value))}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── TABS ──────────────────────────────────────────────────────────

const AttachmentRateDashboard = ({ data, dateRange, hasGlobalData, handleExport }) => {
  const stats = useMemo(() => {
    if (!hasGlobalData) return {
      seCount: 26, aeWithSECount: 216, seDealsTotal: 3955, ratio: "10.8", coverage: 77, dealsPerSE: 152,
      totalWon: 35810, totalLost: 33562, seWon: 1253, seLost: 2674, seWonBV: 37280000,
      wonPct: 3.5, lostPct: 8.0, ratioLostToWon: 2.1,
      bucketData: [{ label: 'Enterprise ($100K+)', pct: 52.5, total: 1421 }, { label: 'Large ($50K–$100K)', pct: 34.2, total: 3240 }, { label: 'Mid ($25K–$50K)', pct: 24.6, total: 6276 }, { label: 'Small ($10K–$25K)', pct: 12.4, total: 8400 }, { label: 'Micro ($0–$10K)', pct: 6.3, total: 12036 }],
      tableData: [{ region: "AMER", aes: 154, ses: 19, deals: "2,564", won: 786, lost: "1,762", winPct: 31, noSeWinPct: "55%", bv: "$25.3M" }, { region: "EMEA", aes: 78, ses: 12, deals: "728", won: 224, lost: "497", winPct: 31, noSeWinPct: "50%", bv: "$6.6M" }, { region: "APAC/JAPAN", aes: 36, ses: 9, deals: "451", won: 149, lost: "299", winPct: 33, noSeWinPct: "47%", bv: "$3.1M" }, { region: "LATAM", aes: 8, ses: 9, deals: "100", won: 50, lost: "48", winPct: 50, noSeWinPct: "76%", bv: "$1.1M" }],
    };

    let totalWon = 0, totalLost = 0, seWon = 0, seLost = 0, seWonBV = 0;
    const uniqueSEs = new Set(), uniqueAEs = new Set(), uniqueAEsWithSE = new Set(), regionMap = {};
    const buckets = [{ label: 'Enterprise ($100K+)', min: 100000, max: Infinity, total: 0, se: 0 }, { label: 'Large ($50K–$100K)', min: 50000, max: 100000, total: 0, se: 0 }, { label: 'Mid ($25K–$50K)', min: 25000, max: 50000, total: 0, se: 0 }, { label: 'Small ($10K–$25K)', min: 10000, max: 25000, total: 0, se: 0 }, { label: 'Micro ($0–$10K)', min: 0, max: 10000, total: 0, se: 0 }];

    data.forEach(d => {
      if (d.stage !== 'Closed Won' && d.stage !== 'Closed Lost') return;
      const isWon = d.stage === 'Closed Won', isSE = d.hasSE === "1";
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

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div id="attachment-header" style={{ position: 'relative', background: `linear-gradient(135deg, ${V.black} 0%, ${V.pearlBlack} 100%)`, padding: '24px 32px', borderRadius: '8px', border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
        <ExportActions onCopy={() => handleExport('attachment-header', 'ratio-header.png', 'copy')} onDownload={() => handleExport('attachment-header', 'ratio-header.png', 'download')} />
        <div style={{ color: C.accent, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', border: `1px solid ${C.accent}`, borderRadius: '999px', marginBottom: '16px', display: 'inline-block' }}>Vimeo SE Analytics</div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '36px', fontWeight: 800, background: `linear-gradient(135deg, ${V.pearlWhite}, ${V.blue})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SE to AE Ratio</h1>
        <p style={{ margin: 0, color: C.textDim, fontSize: '13px' }}>{stats.seCount} SEs supporting {stats.aeWithSECount} AEs across {stats.seDealsTotal.toLocaleString()} deals</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {[{ id: "att-kpi-1", label: "SE : AE RATIO", val: `1 : ${stats.ratio}`, color: C.accent }, { id: "att-kpi-2", label: "AE COVERAGE", val: `${stats.coverage}%`, color: C.green }, { id: "att-kpi-3", label: "DEALS PER SE", val: stats.dealsPerSE, color: C.indigo }].map(k => (
          <Card key={k.id} id={k.id} style={{ position: 'relative' }}>
            <ExportActions onCopy={() => handleExport(k.id, `${k.id}.png`, 'copy')} onDownload={() => handleExport(k.id, `${k.id}.png`, 'download')} />
            <SectionLabel>{k.label}</SectionLabel>
            <div style={{ fontSize: '48px', fontFamily: 'JetBrains Mono', fontWeight: 700, color: k.color }}>{k.val}</div>
          </Card>
        ))}
      </div>

      <div id="attachment-deal-size-card" style={{ position: 'relative', background: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '24px' }}>
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
                   <div style={{ flex: 1, height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                     <div style={{ width: `${visWidth}%`, height: '100%', background: color, transition: 'width 1s' }} />
                   </div>
                   <div style={{ width: '100px', textAlign: 'right', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{b.pct}%</div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      <div id="attachment-table-card" style={{ position: 'relative', background: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden' }}>
        <ExportActions onCopy={() => handleExport('attachment-table-card', 'regional.png', 'copy')} onDownload={() => handleExport('attachment-table-card', 'regional.png', 'download')} />
        <div style={{ padding: '16px', borderBottom: `1px solid ${V.ebony}` }}><h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>SE utilization by owner region</h2></div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: V.ebony, color: C.textMuted, fontSize: '10px', textTransform: 'uppercase' }}>{['Region', 'AEs', 'SEs', 'SE Deals', 'Win %', 'No SE Win %', 'SE Won BV'].map(h => <th key={h} style={{ padding: '12px', textAlign: h==='Region'?'left':'right' }}>{h}</th>)}</tr></thead>
          <tbody>{stats.tableData.map((r, i) => <tr key={i} style={{ borderBottom: `1px solid ${V.ebony}`, fontSize: '12px', background: r.region === 'LATAM' ? 'rgba(154, 232, 94, 0.04)' : 'transparent' }}><td style={{ padding: '12px', fontWeight: 700 }}>{r.region}</td><td style={{ padding: '12px', textAlign: 'right' }}>{r.aes}</td><td style={{ padding: '12px', textAlign: 'right' }}>{r.ses}</td><td style={{ padding: '12px', textAlign: 'right', fontWeight: 700 }}>{r.deals}</td><td style={{ padding: '12px', textAlign: 'right', color: r.winPct >= 35 ? C.green : C.red, fontWeight: 700 }}>{r.winPct}%</td><td style={{ padding: '12px', textAlign: 'right' }}>{r.noSeWinPct}</td><td style={{ padding: '12px', textAlign: 'right', color: C.green }}>{r.bv}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
};

const WinRateTab = ({ data, dateRange, hasGlobalData, handleExport }) => {
  const [product, setProduct] = useState('Vimeo Enterprise');
  const sharedCardStyle = { backgroundColor: '#151a20', border: '1px solid rgba(23, 213, 255, 0.35)', borderRadius: '12px', padding: '20px' };

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
      const isWon = d.stage === 'Closed Won', isSE = d.hasSE === "1", isNb = d.type === "New Business";
      
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
          const ks = d.keywords.split(/[,|;]/).map(k => k.trim()).filter(Boolean);
          ks.forEach(k => { kwMap[k] = (kwMap[k] || 0) + 1; });
        }
        if (d.seActivity) {
          const acts = d.seActivity.split(/[,|;]/).map(a => a.trim()).filter(Boolean);
          acts.forEach(t => {
            if (!actMap[t]) actMap[t] = { midW: 0, midT: 0, lrgW: 0, lrgT: 0, entW: 0, entT: 0 };
            if (d.value < 50000) { actMap[t].midT++; if (isWon) actMap[t].midW++; }
            else if (d.value < 100000) { actMap[t].lrgT++; if (isWon) actMap[t].lrgW++; }
            else { actMap[t].entT++; if (isWon) actMap[t].entW++; }
          });
        }
        if (['Discovery', 'Business Alignment', 'Technical Proof'].includes(d.stageWhenSEAssigned)) {
          const s = d.stageWhenSEAssigned; if (!stageMap[s]) stageMap[s] = { name: s, won: 0, total: 0 };
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

    const finalKw = Object.entries(kwMap).map(([term, count]) => ({ term, count, category: count > 10 ? 'technical' : 'process' })).sort((a,b) => b.count-a.count).slice(0, 8);
    const finalHeat = Object.entries(actMap).map(([act, c]) => ({ activity: act, mid: c.midT>0?Math.round(c.midW/c.midT*100):null, large: c.lrgT>0?Math.round(c.lrgW/c.lrgT*100):null, enterprise: c.entT>0?Math.round(c.entW/c.entT*100):null }));

    return {
      kpis: { overall: { se: Number(((seNbW+seExW)/(seNbT+seExT||1)*100).toFixed(1)), noSe: Number(((noNbW+noExW)/(noNbT+noExT||1)*100).toFixed(1)) }, newBusiness: { se: Number((seNbW/(seNbT||1)*100).toFixed(1)), noSe: Number((noNbW/(noNbT||1)*100).toFixed(1)) }, expansion: { se: Number((seExW/(seExT||1)*100).toFixed(1)), noSe: Number((noExW/(noExT||1)*100).toFixed(1)) } },
      diffData: diffData.map((d, i) => ({ ...d, nbTrend: Number((nbReg.slope * i + nbReg.intercept).toFixed(1)), expTrend: Number((exReg.slope * i + exReg.intercept).toFixed(1)) })),
      keywords: finalKw.length ? finalKw : KEYWORD_DATA,
      heatmap: finalHeat.length ? finalHeat : HEATMAP_DATA,
      stages: Object.values(stageMap).map(s => ({ ...s, rate: Number((s.won/s.total*100).toFixed(1)) }))
    };
  }, [data, product, hasGlobalData]);

  const maxHeat = useMemo(() => {
    let m = -1, a = ''; winStats.heatmap.forEach(r => { ['mid', 'large', 'enterprise'].forEach(k => { if (r[k] > m) { m = r[k]; a = r.activity; } }); });
    return { val: m, activity: a };
  }, [winStats.heatmap]);

  const getHeatColor = (v) => v === null ? 'transparent' : (v<=20?'#7B1F1F':v<=29?'#8B4A1A':v<=36?'#5A6B1A':v<=43?'#1A5C2A':'#0D3D1A');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(23, 213, 255, 0.04)', padding: '4px', borderRadius: '99px', width: 'fit-content' }}>
        {['Vimeo Enterprise', 'OTT'].map(p => <button key={p} onClick={() => setProduct(p)} style={{ background: product === p ? '#17D5FF' : 'transparent', color: product === p ? '#141A20' : '#C8D6E5', fontWeight: product === p ? 700 : 500, border: 'none', padding: '6px 16px', borderRadius: '99px', fontSize: '13px', cursor: 'pointer' }}>{p}</button>)}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card id="win-heat" style={{ position: 'relative' }}>
          <ExportActions onCopy={() => handleExport('win-heat', 'heatmap.png', 'copy')} onDownload={() => handleExport('win-heat', 'heatmap.png', 'download')} />
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Activity Win Rate x Deal Size</h2>
          <p style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '20px' }}>Opportunity win rates based on primary SE activity and band</p>
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
        </Card>

        <Card id="win-kw" style={{ position: 'relative' }}>
          <ExportActions onCopy={() => handleExport('win-kw', 'keywords.png', 'copy')} onDownload={() => handleExport('win-kw', 'keywords.png', 'download')} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Keyword Frequency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={winStats.keywords} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="term" width={100} fontSize={12} tick={{ fill: '#C8D6E5' }} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>{winStats.keywords.map((e, i) => <Cell key={i} fill={e.category === 'technical' ? COLORS.blue : COLORS.orange} />)}<LabelList dataKey="count" position="right" fill="#3D4751" fontSize={10} /></Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card id="win-stage" style={{ position: 'relative' }}>
        <ExportActions onCopy={() => handleExport('win-stage', 'stage.png', 'copy')} onDownload={() => handleExport('win-stage', 'stage.png', 'download')} />
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Win Rate by Stage of SE Assignment</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {winStats.stages.map((s, i) => {
            const color = s.rate >= 46 ? COLORS.blue : (s.rate >= 42 ? COLORS.green : COLORS.orange);
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}><span>{s.name}</span><span style={{ fontWeight: 700, color }}>{s.rate}%</span></div>
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}><div style={{ width: `${s.rate}%`, height: '100%', background: color }} /></div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

const PovImpactTab = ({ data, hasGlobalData, handleExport }) => {
  const [product, setProduct] = useState('Vimeo Enterprise');
  const stats = useMemo(() => {
    const mode = product === 'OTT' ? 'SE-Attached' : 'POV';
    if (!hasGlobalData) return { mode, winRate: 36.9, n: 244, avgBV: 64000, cycleTime: 104, bands: [{ label: 'MICRO', rate: 15, noPovRate: 20, diff: -5, recColor: '#FF5757', rec: 'Avoid' }, { label: 'ENTERPRISE', rate: 82.5, noPovRate: 40, diff: 42.5, recColor: COLORS.blue, rec: 'Mandatory' }] };

    let pT = 0, pW = 0, pBV = 0, pAS = 0, pAC = 0;
    const bands = { micro: { pT: 0, pW: 0, nT: 0, nW: 0 }, small: { pT: 0, pW: 0, nT: 0, nW: 0 }, mid: { pT: 0, pW: 0, nT: 0, nW: 0 }, large: { pT: 0, pW: 0, nT: 0, nW: 0 }, ent: { pT: 0, pW: 0, nT: 0, nW: 0 } };
    data.forEach(d => {
      if (d.product !== product || (d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')) return;
      const isP = product === 'OTT' ? (d.hasSE === "1") : (d.hasPOV || d.hasSE === "1"), isW = d.stage === 'Closed Won';
      if (isP) { pT++; if (isW) { pW++; pBV += d.value; } if (d.age) { pAS += d.age; pAC++; } }
      const v = d.value || 0; let b = v < 10000 ? bands.micro : v < 25000 ? bands.small : v < 50000 ? bands.mid : v < 100000 ? bands.large : bands.ent;
      if (isP) { b.pT++; if (isW) b.pW++; } else { b.nT++; if (isW) b.nW++; }
    });
    const getRec = (r) => r >= 75 ? { rec: 'Mandatory', recColor: COLORS.blue } : r >= 50 ? { rec: 'Deploy', recColor: COLORS.green } : r >= 25 ? { rec: 'Selective', recColor: V.yellow } : { rec: 'Avoid', recColor: COLORS.red };
    return {
      mode, winRate: pT > 0 ? (pW / pT * 100).toFixed(1) : 0, n: pT, avgBV: pW > 0 ? pBV / pW : 0, cycleTime: pAC > 0 ? Math.round(pAS / pAC) : 0,
      bands: Object.entries(bands).map(([k, b]) => {
        const r = b.pT > 0 ? Number((b.pW / b.pT * 100).toFixed(1)) : 0, nr = b.nT > 0 ? Number((b.nW / b.nT * 100).toFixed(1)) : 0;
        return { label: k.toUpperCase(), rate: r, noPovRate: nr, diff: Number((r - nr).toFixed(1)), ...getRec(r) };
      })
    };
  }, [data, product, hasGlobalData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(23, 213, 255, 0.04)', padding: '4px', borderRadius: '24px', width: 'fit-content' }}>
        {['Vimeo Enterprise', 'OTT'].map(p => <button key={p} onClick={() => setProduct(p)} style={{ background: product === p ? '#17D5FF' : 'transparent', color: product === p ? '#141A20' : '#C8D6E5', fontWeight: product === p ? 700 : 500, border: 'none', padding: '6px 18px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer' }}>{p}</button>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <Card id="pov-wr"><SectionLabel>{stats.mode} WIN RATE</SectionLabel><div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.blue }}>{stats.winRate}%</div><div style={{ fontSize: '12px', color: COLORS.textDim }}>n={stats.n} deals</div></Card>
        <Card id="pov-bv"><SectionLabel>WON AVG BV</SectionLabel><div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.green }}>{formatCurrency(stats.avgBV)}</div></Card>
        <Card id="pov-age"><SectionLabel>CYCLE TIME</SectionLabel><div style={{ fontSize: '36px', fontWeight: 700, color: COLORS.orange }}>{stats.cycleTime}d</div></Card>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Impact by Deal Size</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {stats.bands.map((b, i) => (
          <div key={i} style={{ background: COLORS.card, border: `1px solid ${b.recColor}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#C8D6E5', marginBottom: '12px' }}>{b.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div><div style={{ fontSize: '9px', color: COLORS.textDim }}>POV</div><div style={{ fontSize: '20px', fontWeight: 700, color: b.recColor }}>{b.rate}%</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: '9px', color: COLORS.textDim }}>NO POV</div><div style={{ fontSize: '20px', fontWeight: 700, color: '#FAFCFD' }}>{b.noPovRate}%</div></div>
            </div>
            <div style={{ marginTop: 'auto', background: hexToRgba(b.recColor, 0.1), color: b.recColor, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textAlign: 'center' }}>{b.rec} &middot; {b.diff > 0 ? `+${b.diff}` : b.diff}pp</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN APP ───────────────────────────────────────────────────────
export default function App() {
  const TABS = ['Revenue Impact', 'Win Rate', 'Attachment Rate', 'SE Efficiency', 'Quality & Product Impact'];
  const [activeTab, setActiveTab] = useState(TABS[1]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadedRows, setLoadedRows] = useState(0);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

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
          value: parseFloat(row["Bookings Value"]) || 0,
          type: row["Type"], product: row["Product Type"], stage: row["Stage"],
          hasSE: row["Has Solutions Engineer?"], ae: row["Account Executive"] || row["Opportunity Owner"] || "", se: row["Solutions Engineer"] || "",
          region: row["Owner Region"] || row["Region"] || "", stageWhenSEAssigned: row["Stage When SE Assigned"] || "",
          keywords: row["Keywords"] || row["Technical Keywords"] || row["Technical Fit Notes"] || row["Own the Technical Outcome"] || "",
          seActivity: row["SE Activity"] || row["Primary Activity"] || row["Activity Type"] || row["Activity"] || "",
          age, hasPOV: !!(row["POV Start Date"] || row["Trial Start Date"])
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

  return (
    <div style={{ fontFamily: 'Inter Tight, sans-serif', backgroundColor: COLORS.bg, color: COLORS.text, minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(10, 14, 18, 0.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ padding: '16px 32px 8px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ cursor: 'pointer', backgroundColor: COLORS.blue, color: '#000', padding: '8px 16px', borderRadius: '6px', fontWeight: 700 }}>
              {loading ? 'Parsing...' : 'Upload CSV'}
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
            {loadedRows > 0 && <div style={{ fontSize: '12px', color: COLORS.green }}>{loadedRows.toLocaleString()} rows loaded</div>}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: '#fff', padding: '4px 8px', borderRadius: '4px' }} />
            <span>to</span>
            <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: '#fff', padding: '4px 8px', borderRadius: '4px' }} />
          </div>
        </div>
        <div style={{ padding: '0 32px 16px 32px', color: COLORS.blue, fontSize: '20px', fontWeight: 600 }}>Solutions Engineering</div>
        <div style={{ display: 'flex', padding: '0 32px', gap: '24px' }}>
          {TABS.map(t => <button key={t} onClick={() => setActiveTab(t)} style={{ background: 'none', border: 'none', borderBottom: activeTab === t ? `2px solid ${COLORS.blue}` : 'none', color: activeTab === t ? '#fff' : COLORS.textDim, padding: '12px 0', cursor: 'pointer', fontWeight: 600 }}>{t}</button>)}
        </div>
      </div>

      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'Win Rate' ? <WinRateTab data={dateFilteredData} dateRange={dateRange} hasGlobalData={data.length > 0} handleExport={handleExport} /> :
         activeTab === 'Attachment Rate' ? <AttachmentRateDashboard data={dateFilteredData} dateRange={dateRange} hasGlobalData={data.length > 0} handleExport={handleExport} /> :
         activeTab === 'SE Efficiency' ? <PovImpactTab data={dateFilteredData} hasGlobalData={data.length > 0} handleExport={handleExport} /> :
         <div style={{ padding: '64px', textAlign: 'center', background: COLORS.card, borderRadius: '12px' }}><h2>{activeTab}</h2><p>Data visualization coming soon.</p></div>}
      </div>
    </div>
  );
}
