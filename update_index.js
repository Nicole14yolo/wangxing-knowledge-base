const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Update Layer 2 card link companies.html -> models.html
content = content.replace(
  /(<div class="category-card">\s+<div class="category-icon">💡<\/div>\s+<h3>02 · 智库层<\/h3>[\s\S]+?<a href=")companies.html(" class="btn btn-primary">探索智库<\/a>)/,
  '$1models.html$2'
);

// 2. Update Layer 3 card link # -> quotes.html
content = content.replace(
  /(<div class="category-card">\s+<div class="category-icon">🎯<\/div>\s+<h3>03 · 应用层<\/h3>[\s\S]+?<a href=")#(" class="btn btn-primary">查看应用<\/a>)/,
  '$1quotes.html$2'
);

// 3. Update 智库分析 cards - 年度商业分析、思维模型、思维演变时间轴
content = content.replace(
  /<a href="#" style="color: var\(--color-orange\);">查看分析 →<\/a>/,
  '<a href="models.html" style="color: var(--color-orange);">查看分析 →</a>'
);

content = content.replace(
  /<a href="#" style="color: var\(--color-orange\);">探索模型 →<\/a>/,
  '<a href="models.html" style="color: var(--color-orange);">探索模型 →</a>'
);

content = content.replace(
  /<a href="#" style="color: var\(--color-orange\);">查看时间轴 →<\/a>/,
  '<a href="corpus.html" style="color: var(--color-orange);">查看时间轴 →</a>'
);

// 4. Update stats row - add 金句精选
content = content.replace(
  /<div class="stat-item">\s+<div class="stat-number">16<\/div>\s+<div class="stat-label">思维模型<\/div>\s+<\/div>/,
  `<div class="stat-item">
          <div class="stat-number">16</div>
          <div class="stat-label">思维模型</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">595</div>
          <div class="stat-label">金句精选</div>
        </div>`
);

// 5. Update hero subtitle
content = content.replace(
  /结构化为四层知识图谱/,
  '结构化为三层知识图谱'
);

// 6. Update footer links
content = content.replace(
  /<div class="footer-links">\s+<a href="index.html">首页<\/a>\s+<a href="companies.html">公司<\/a>\s+<a href="people.html">人物<\/a>\s+<a href="#">关于<\/a>\s+<\/div>/,
  `<div class="footer-links">
          <a href="index.html">首页</a>
          <a href="corpus.html">语料</a>
          <a href="companies.html">公司</a>
          <a href="people.html">人物</a>
          <a href="models.html">思维模型</a>
          <a href="quotes.html">金句</a>
        </div>`
);

fs.writeFileSync('index.html', content, 'utf8');
console.log('index.html updated successfully!');
