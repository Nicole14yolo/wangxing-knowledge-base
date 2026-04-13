const fs = require('fs');
const path = require('path');

const baseDir = 'D:/ZT180/Documents/obsidian趣味导图/王兴饭否语录库/03_应用/金句';

function extractQuotesFromYearFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8').replace(/\r\n/g, '\n');
  const quotes = [];

  // Extract background info
  const bgMatch = content.match(/> \*\*商业环境\*\*：(.+)/);
  const perspMatch = content.match(/> \*\*王兴视角\*\*：(.+)/);

  // Find ### 1. position and cut there
  const startIdx = content.indexOf('### 1.');
  if (startIdx < 0) return { quotes, background: bgMatch?.[1] || '', perspective: perspMatch?.[1] || '' };

  let remaining = content.slice(startIdx);

  // Split by ### indicators (quote boundaries)
  const quoteBlocks = remaining.split(/### \d+\.\s*/).slice(1);

  for (const block of quoteBlocks) {
    // Find the date line
    const dateMatch = block.match(/>?\s*—\s*`([^`]+)`/);
    if (!dateMatch) continue;

    const date = dateMatch[1];

    // Get text before date line
    const beforeDate = block.slice(0, block.indexOf(dateMatch[0]));

    // Extract quote lines (lines starting with >)
    const lines = beforeDate.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('>'))
      .map(l => l.slice(1).trim())  // Remove >
      .filter(l => l.length > 0 && !l.includes('[[年度语录'));

    if (lines.length === 0) continue;

    let text = lines.join(' ');
    // Clean wikilinks [[xxx|yyy]] or [[xxx]]
    text = text.replace(/\[\[[^\]]+\|([^\]]+)\]\]/g, '$1');
    text = text.replace(/\[\[([^\]]+)\]\]/g, '$1');

    if (text.length > 10 && text.length < 800) {
      quotes.push({ text, date });
    }
  }

  return {
    quotes,
    background: bgMatch?.[1]?.trim() || '',
    perspective: perspMatch?.[1]?.trim() || ''
  };
}

function extractQuotesFromThemeFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8').replace(/\r\n/g, '\n');
  const quotes = [];

  const quoteBlocks = content.split(/### \d+\.\s*/).slice(1);

  for (const block of quoteBlocks) {
    const dateMatch = block.match(/>?\s*—\s*`([^`]+)`/);
    if (!dateMatch) continue;

    const date = dateMatch[1];
    const beforeDate = block.slice(0, block.indexOf(dateMatch[0]));

    const lines = beforeDate.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('>'))
      .map(l => l.slice(1).trim())
      .filter(l => l.length > 0 && !l.includes('[[年度语录'));

    if (lines.length === 0) continue;

    let text = lines.join(' ');
    text = text.replace(/\[\[[^\]]+\|([^\]]+)\]\]/g, '$1');
    text = text.replace(/\[\[[^\]]+\]\]/g, '');

    if (text.length > 10 && text.length < 800) {
      quotes.push({ text, date });
    }
  }

  return quotes;
}

const output = {
  hall: [],
  byTheme: {},
  byYear: {}
};

// 金句堂
console.log('=== Processing 金句堂.md ===');
output.hall = extractQuotesFromThemeFile(path.join(baseDir, '金句堂.md'));
console.log('金句堂:', output.hall.length, 'quotes');
if (output.hall[0]) console.log('First:', output.hall[0].text.slice(0, 80));

// 按主题
const themeFiles = fs.readdirSync(baseDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md' && f !== '金句堂.md');
for (const fname of themeFiles) {
  const name = fname.slice(0, -3);
  const quotes = extractQuotesFromThemeFile(path.join(baseDir, fname));
  output.byTheme[name] = { name, quotes };
}
console.log('Theme files:', Object.keys(output.byTheme).length);

// 按年
const yearDir = path.join(baseDir, '按年');
const yearFiles = fs.readdirSync(yearDir).filter(f => f.endsWith('.md'));
for (const fname of yearFiles) {
  const year = fname.slice(0, -3);
  const result = extractQuotesFromYearFile(path.join(yearDir, fname));
  output.byYear[year] = {
    year,
    background: result.background,
    perspective: result.perspective,
    quotes: result.quotes
  };
}

// Verify
console.log('\n=== Verification ===');
console.log('2017 quotes:', output.byYear['2017'].quotes.length);
console.log('2017 first:', output.byYear['2017'].quotes[0]?.text?.slice(0, 100));
console.log('2017 background:', output.byYear['2017'].background?.slice(0, 50));

fs.writeFileSync('data/quotes.json', JSON.stringify(output, null, 2), 'utf8');
console.log('\n✓ Saved to data/quotes.json');
