const fs = require('fs');

// New navigation structure matching Obsidian vault
const navTemplate = (active) => `
      <ul class="nav-links">
        <li><a href="index.html"${active === 'index' ? ' class="active"' : ''}>首页</a></li>
        <li><a href="corpus.html"${active === 'corpus' ? ' class="active"' : ''}>语料库</a></li>
        <li><a href="insights.html"${active === 'insights' || active === 'years' || active === 'companies' || active === 'people' || active === 'models' ? ' class="active"' : ''}>智库</a></li>
        <li><a href="library.html"${active === 'library' || active === 'media' ? ' class="active"' : ''}>书影</a></li>
        <li><a href="quotes.html"${active === 'quotes' ? ' class="active"' : ''}>金句</a></li>
        <li><a href="search.html"${active === 'search' ? ' class="active"' : ''}>搜索</a></li>
      </ul>`;

// Map files to their active nav state
const activeMap = {
  'index.html': 'index',
  'corpus.html': 'corpus',
  'year-detail.html': 'corpus',
  'years.html': 'years',
  'year-analysis.html': 'years',
  'companies.html': 'companies',
  'company-detail.html': 'companies',
  'people.html': 'people',
  'person-detail.html': 'people',
  'models.html': 'models',
  'model-detail.html': 'models',
  'insights.html': 'insights',
  'library.html': 'library',
  'media.html': 'media',
  'quotes.html': 'quotes',
  'search.html': 'search'
};

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const active = activeMap[file] || '';

  // Replace nav section
  content = content.replace(
    /<ul class="nav-links">[\s\S]*?<\/ul>/,
    navTemplate(active).trim()
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated', file);
}
