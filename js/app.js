// ========================================
// 王兴饭否思想库 - 核心应用逻辑
// ========================================

// 全局状态
const KB = {
  companies: {},
  people: {},
  currentYearData: null,
  currentFilters: []
};

// ========================================
// 语料库相关功能
// ========================================

/**
 * 加载年度语料数据
 */
async function loadYearData(year) {
  try {
    const response = await fetch(`data/${year}.json`);
    KB.currentYearData = await response.json();
    return KB.currentYearData;
  } catch (error) {
    console.error(`Failed to load year ${year}:`, error);
    return null;
  }
}

/**
 * 加载语料索引
 */
async function loadCorpusIndex() {
  try {
    const response = await fetch('data/corpus-index.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to load corpus index:', error);
    return null;
  }
}

// ========================================
// 公司档案相关功能
// ========================================

/**
 * 从语料中筛选提及特定公司的语录
 */
function filterQuotesByCompany(quotes, companyName) {
  if (!quotes || !companyName) return [];

  const searchTerms = getCompanySearchTerms(companyName);

  return quotes.filter(quote => {
    const content = quote.content || '';
    return searchTerms.some(term => content.includes(term));
  });
}

/**
 * 获取公司的搜索词
 */
function getCompanySearchTerms(companyName) {
  const termMap = {
    '美团': ['美团', 'meituan'],
    '苹果': ['苹果', 'Apple', 'Jobs', '乔布斯', 'iPhone', 'iPad', 'Mac'],
    '亚马逊': ['亚马逊', 'Amazon', '贝索斯', 'Bezos', 'AWS'],
    '腾讯': ['腾讯', 'Tencent', '马化腾', 'Pony Ma', '微信', 'WeChat'],
    '阿里': ['阿里', 'Alibaba', '马云', 'Jack Ma', '淘宝', '天猫'],
    '百度': ['百度', 'Baidu', '李彦宏'],
    '谷歌': ['谷歌', 'Google', 'Google', '佩奇', 'Page', '布林', 'Brin'],
    '微软': ['微软', 'Microsoft', '盖茨', 'Gates', '纳德拉', 'Nadella'],
    '华为': ['华为', 'Huawei', '任正非'],
    '京东': ['京东', 'JD.com', '刘强东'],
    '小米': ['小米', 'Xiaomi', '雷军'],
    '字节': ['字节', 'ByteDance', '张一鸣', '抖音', 'TikTok', '头条'],
    '滴滴': ['滴滴', 'Didi', '程维'],
    '网易': ['网易', 'NetEase', '丁磊'],
    '360': ['360', '奇虎', '周鸿祎'],
    '携程': ['携程', 'Ctrip', '梁建章'],
    '拼多多': ['拼多多', 'PDD', '黄峥'],
    '饭否': ['饭否', 'Fanfou'],
    '微信': ['微信', 'WeChat', '张小龙'],
    '微博': ['微博', 'Weibo', '新浪'],
    '快手': ['快手', 'Kuaishou', '宿华', '程一笑'],
    '红杉资本': ['红杉', 'Sequoia', '沈南鹏']
  };

  return termMap[companyName] || [companyName];
}

/**
 * 为公司详情页加载关联语录
 */
async function loadCompanyRelatedQuotes(companyName, limit = 20) {
  const allQuotes = [];

  // 优先加载提及次数高的年份
  const yearPriority = [2017, 2016, 2011, 2018, 2015, 2012, 2019, 2009, 2020, 2010, 2013, 2014, 2021, 2007, 2008];

  for (const year of yearPriority) {
    if (allQuotes.length >= limit) break;

    try {
      const yearData = await loadYearData(year);
      if (yearData) {
        const matches = filterQuotesByCompany(yearData, companyName);
        matches.forEach(q => q.year = year);
        allQuotes.push(...matches);
      }
    } catch (e) {
      console.log(`Failed to load ${year}`);
    }
  }

  return allQuotes.slice(0, limit);
}

// ========================================
// 工具函数
// ========================================

/**
 * HTML 转义
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
}

/**
 * 高亮提及关键词
 */
function highlightMentions(text, terms) {
  if (!text || !terms || terms.length === 0) return escapeHtml(text);

  let result = escapeHtml(text);
  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    result = result.replace(regex, '<mark style="background-color: rgba(217, 119, 87, 0.3); padding: 2px 4px; border-radius: 3px;">$1</mark>');
  });

  return result;
}

// ========================================
// UI 组件渲染
// ========================================

/**
 * 渲染语录卡片
 */
function renderQuoteCard(quote, index, highlightTerms = []) {
  const content = highlightTerms.length > 0
    ? highlightMentions(quote.content, highlightTerms)
    : escapeHtml(quote.content);

  return `
    <div class="quote-card" style="
      padding: 20px;
      margin-bottom: 16px;
      background: white;
      border-radius: 10px;
      border: 1px solid var(--color-light-gray);
      box-shadow: var(--shadow-soft);
    ">
      <div style="display: flex; align-items: flex-start; gap: 16px;">
        <div style="
          min-width: 36px;
          height: 36px;
          background: var(--color-orange);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.9rem;
        ">${index + 1}</div>
        <div style="flex: 1;">
          <p style="font-size: 1.05rem; line-height: 1.7; margin-bottom: 12px;">${content}</p>
          <div style="display: flex; gap: 12px; font-size: 0.85rem; color: var(--color-mid-gray);">
            <span style="display: flex; align-items: center; gap: 4px;">📅 ${quote.date}</span>
            ${quote.time ? `<span>🕐 ${quote.time}</span>` : ''}
            ${quote.year ? `<span style="color: var(--color-orange);">📍 ${quote.year}年</span>` : ''}
            ${quote.has_forward ? '<span style="color: var(--color-blue);">↩️ 转发</span>' : ''}
            ${quote.is_reply ? '<span style="color: var(--color-green);">💬 回复</span>' : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染语录列表
 */
function renderQuoteList(quotes, containerId, highlightTerms = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (quotes.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--color-mid-gray);">
        <p>暂无相关语录</p>
      </div>
    `;
    return;
  }

  container.innerHTML = quotes.map((q, i) => renderQuoteCard(q, i, highlightTerms)).join('');
}

// ========================================
// 初始化
// ========================================

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('王兴思想库 App 已加载');

  // 初始化工具提示
  initTooltips();

  // 初始化搜索功能（如果存在）
  initSearch();
});

function initTooltips() {
  // 实现工具提示逻辑
}

function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      const query = e.target.value;
      if (query.length >= 2) {
        performSearch(query);
      }
    }, 300));
  }
}

function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function performSearch(query) {
  console.log('搜索:', query);
  // 实现搜索逻辑
}

// 导出全局函数
window.KB = KB;
window.loadYearData = loadYearData;
window.loadCorpusIndex = loadCorpusIndex;
window.loadCompanyRelatedQuotes = loadCompanyRelatedQuotes;
window.filterQuotesByCompany = filterQuotesByCompany;
window.renderQuoteList = renderQuoteList;
window.renderQuoteCard = renderQuoteCard;
window.escapeHtml = escapeHtml;
window.highlightMentions = highlightMentions;
