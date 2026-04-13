const fs = require('fs');
const path = require('path');

const BASE = 'D:/ZT180/Documents/obsidian趣味导图/王兴饭否语录库';

// Parse quotes from markdown files with format:
// > quote text
// >
// > — `date`  [[年度语录/YYYY]]
function parseQuotes(content) {
  const quotes = [];
  const extractText = (raw) => raw
    .split('\n')
    .map(l => l.replace(/^>\s?/, '').trim())
    .filter(l => l)
    .join(' ')
    .trim();

  // Format 1: > text\n>\n> — `date`  (金句文件)
  const regex1 = />([\s\S]+?)>\s*\n>\s*—\s*`([^`]+)`[^\n]*/g;
  let m;
  while ((m = regex1.exec(content)) !== null) {
    const text = extractText(m[1]);
    if (text.length > 5) quotes.push({ text, date: m[2].trim() });
  }

  // Format 2: > text\n>\n> —— YYYY-MM-DD  (年度分析文件)
  const regex2 = />([\s\S]+?)>\s*\n>\s*——\s*(\d{4}-\d{2}-\d{2})[^\n]*/g;
  while ((m = regex2.exec(content)) !== null) {
    const text = extractText(m[1]);
    if (text.length > 5) quotes.push({ text, date: m[2].trim() });
  }

  return quotes;
}

// ── 1. HALL OF FAME ──────────────────────────────────────────────
const hallContent = fs.readFileSync(`${BASE}/03_应用/金句/金句堂.md`, 'utf8');
const hall = parseQuotes(hallContent);
console.log('Hall:', hall.length, 'quotes');

// ── 2. BY THEME ──────────────────────────────────────────────────
const themeDir = `${BASE}/03_应用/金句`;
const themeFiles = fs.readdirSync(themeDir)
  .filter(f => f.endsWith('.md') && f !== 'INDEX.md' && f !== '金句堂.md');

const byTheme = {};
for (const f of themeFiles) {
  const content = fs.readFileSync(path.join(themeDir, f), 'utf8');
  const nameMatch = content.match(/concept:\s*(.+)/);
  const name = nameMatch ? nameMatch[1].trim() : f.replace('.md', '');
  const quotes = parseQuotes(content);
  byTheme[name] = { name, quotes };
  console.log('Theme', name, ':', quotes.length, 'quotes');
}

// ── 3. BY YEAR ───────────────────────────────────────────────────
const yearDir = `${BASE}/03_应用/金句/按年`;
const byYear = {};
for (const f of fs.readdirSync(yearDir).filter(f => f.endsWith('.md'))) {
  const year = f.replace('.md', '');
  const content = fs.readFileSync(path.join(yearDir, f), 'utf8');
  const bgMatch = content.match(/background:\s*"([^"]+)"/);
  const quotes = parseQuotes(content);
  byYear[year] = {
    year,
    background: bgMatch ? bgMatch[1] : '',
    quotes
  };
  console.log('Year', year, ':', quotes.length, 'quotes');
}

// ── 4. YEAR ANALYSIS (full) ───────────────────────────────────────
const yearAnalysisDir = `${BASE}/02_智库/年度分析`;
const yearsData = {};
for (const f of fs.readdirSync(yearAnalysisDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md')) {
  const year = f.replace('.md', '');
  const content = fs.readFileSync(path.join(yearAnalysisDir, f), 'utf8');

  const titleMatch = content.match(/title:\s*"([^"]+)"/);
  const countMatch = content.match(/quote_count:\s*(\d+)/);

  // Background section
  const bgMatch = content.match(/## 商业大背景\s*\n+([^#]+)/);
  const background = bgMatch ? bgMatch[1].trim() : '';

  // Dimensions
  const dimMatches = [...content.matchAll(/\[\[.+?\|(.+?)\]\]\s*\((\d+)条\)/g)];
  const dimensions = dimMatches.map(m => ({ name: m[1], count: parseInt(m[2]) }));

  // Conclusions section (王兴思想结论)
  let insights = '';
  const insightMatch = content.match(/## 王兴思想结论\s*\n([\s\S]+?)(?=\n## |$)/);
  if (insightMatch) insights = insightMatch[1].trim();

  // Sample quotes - from 代表性语录 section
  const sampleSection = content.match(/## 代表性语录\s*\n([\s\S]+?)(?=\n## |---\s*$|$)/);
  const sampleContent = sampleSection ? sampleSection[1] : content;
  const sampleQuotes = parseQuotes(sampleContent).slice(0, 3);

  yearsData[year] = {
    year,
    title: titleMatch ? titleMatch[1] : year,
    quote_count: countMatch ? parseInt(countMatch[1]) : 0,
    sections: { background, dimensions, insights, sample_quotes: sampleQuotes.map(q => q.text) }
  };
}
console.log('Years:', Object.keys(yearsData).length);

// ── 5. MEDIA (with quotes) ────────────────────────────────────────
const mediaBase = `${BASE}/03_应用/书影`;
const typeMap = { '书': 'books', '影': 'movies', '歌': 'songs', '刊': 'magazines', '剧': 'dramas', '诗文': 'poems', '其他': 'others' };
const mediaData = {};

for (const dir of fs.readdirSync(mediaBase).filter(f => fs.statSync(path.join(mediaBase, f)).isDirectory())) {
  const typeKey = typeMap[dir] || dir;
  mediaData[typeKey] = [];
  for (const f of fs.readdirSync(path.join(mediaBase, dir)).filter(f => f.endsWith('.md') && f !== 'INDEX.md')) {
    const content = fs.readFileSync(path.join(mediaBase, dir, f), 'utf8');
    const name = f.replace('.md', '');
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    const countMatch = content.match(/mention_count:\s*(\d+)/);
    const timeMatch = content.match(/时间分布：(.+)/);
    const quotes = parseQuotes(content);
    mediaData[typeKey].push({
      name,
      title: titleMatch ? titleMatch[1] : name,
      quote_count: countMatch ? parseInt(countMatch[1]) : quotes.length,
      time_distribution: timeMatch ? timeMatch[1].trim() : '',
      quotes
    });
  }
  mediaData[typeKey].sort((a, b) => b.quote_count - a.quote_count);
}

// ── WRITE OUTPUT ──────────────────────────────────────────────────
fs.writeFileSync('data/quotes.json', JSON.stringify({ hall, byTheme, byYear }, null, 2), 'utf8');
fs.writeFileSync('data/years-full.json', JSON.stringify(yearsData, null, 2), 'utf8');
fs.writeFileSync('data/media-full.json', JSON.stringify(mediaData, null, 2), 'utf8');

console.log('\n✅ Done');
console.log('quotes.json - hall:', hall.length, '| themes:', Object.keys(byTheme).length, '| years:', Object.keys(byYear).length);
