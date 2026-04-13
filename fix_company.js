const fs = require('fs');

// Read the file
let content = fs.readFileSync('company-detail.html', 'utf8');

// Find and replace the renderContent function
const newRenderContent = `
    function renderContent(markdown) {
      // Remove YAML frontmatter (everything between first --- and next ---)
      const body = markdown.replace(/^---\n[\s\S]*?\n---\n*/, '').trim();

      // Configure marked to handle wikilinks
      const renderer = new marked.Renderer();
      renderer.link = function(href, title, text) {
        // Handle wikilinks [[target|text]]
        if (href.startsWith('[[')) {
          const match = href.match(/\\[\\[([^\\]]+)\\]\\]/);
          if (match) {
            const parts = match[1].split('|');
            const target = parts[0];
            const displayText = parts[1] || parts[0];
            return \`<a href="search.html?q=\${encodeURIComponent(displayText)}" style="color: var(--color-orange);">\${displayText}</a>\`;
          }
        }
        return \`<a href="\${href}"\${title ? \` title="\${title}"\` : ''}>\${text}</a>\`;
      };

      marked.setOptions({ renderer });
      document.getElementById('markdown-content').innerHTML = marked.parse(body);
    }
  </script>`;

// Replace from "function renderContent(markdown)" to the closing </script>
const regex = /function renderContent\(markdown\)[\s\S]*?<\/script>/;
content = content.replace(regex, newRenderContent.trim());

// Write back
fs.writeFileSync('company-detail.html', content, 'utf8');
console.log('Fixed!');
