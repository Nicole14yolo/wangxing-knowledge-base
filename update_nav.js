const fs = require('fs');

// Map: filename -> which nav item is "active"
const pages = {
  'index.html':          'index',
  'corpus.html':         'corpus',
  'year-detail.html':    'corpus',
  'companies.html':      'companies',
  'company-detail.html': 'companies',
  'people.html':         'people',
  'person-detail.html':  'people',
  'search.html':         'search',
  'models.html':         'models',
  'model-detail.html':   'models',
  'quotes.html':         'quotes',
};

function navItem(href, label, activeKey, thisKey) {
  const cls = activeKey === thisKey ? ' class="active"' : '';
  return `        <li><a href="${href}"${cls}>${label}</a></li>`;
}

function buildNav(activeKey) {
  return [
    navItem('index.html',     '首页',     activeKey, 'index'),
    navItem('corpus.html',    '语料库',   activeKey, 'corpus'),
    navItem('companies.html', '公司档案', activeKey, 'companies'),
    navItem('people.html',    '人物档案', activeKey, 'people'),
    navItem('search.html',    '搜索',     activeKey, 'search'),
    navItem('models.html',    '思维模型', activeKey, 'models'),
    navItem('quotes.html',    '金句',     activeKey, 'quotes'),
  ].join('\n');
}

for (const [file, activeKey] of Object.entries(pages)) {
  let content = fs.readFileSync(file, 'utf8');
  // Replace everything between <ul class="nav-links"> and </ul>
  const newNav = `<ul class="nav-links">\n${buildNav(activeKey)}\n      </ul>`;
  content = content.replace(/<ul class="nav-links">[\s\S]+?<\/ul>/, newNav);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated nav:', file);
}
