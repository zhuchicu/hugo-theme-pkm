document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const searchInput = document.querySelector('.search-input');
  const closeBtn = document.querySelector('.popup-btn-close');
  const searchPopup = document.querySelector('.search-popup');
  const searchResults = document.querySelector('.search-result-list');

  // 校验元素是否存在（避免报错）
  // if (!searchInput || !searchResults) return;

  // 存储搜索数据和 Fuse 实例
  let searchData = [];
  let fuse;

  // 从 index.json 加载搜索数据
  fetch('/index.json')
    .then(response => {
      if (!response.ok) throw new Error('索引文件加载失败');
      return response.json();
    })
    .then(data => {
      searchData = data.map(item => ({
        ...item,
        content: stripHtml(item.content) // 新增：移除HTML标签
      }));
      // 初始化 Fuse 搜索实例
      fuse = new Fuse(searchData, {
        // 配置搜索字段及权重（根据你的 index.json 字段调整）
        keys: [
          { name: 'title', weight: 0.8 },   // 标题权重最高
          { name: 'content', weight: 0.3 }, // 内容权重较低
          { name: 'section', weight: 0.1 }  // 分类权重最低
        ],
        threshold: 0.4, // 匹配精度（0 最严格，1 最宽松）
        ignoreLocation: true // 忽略匹配位置（全文匹配）
      });
      console.log('搜索初始化成功')
    })
    .catch(error => console.error('搜索初始化失败:', error));

  // 监听搜索输入
  searchInput.addEventListener('input', debounce(handleSearch, 300));

  // 控制关闭按钮显示
  function searchCloseBtnDisplay(query) {
    if (query) {
        closeBtn.classList.add('visible');
        searchPopup.classList.add('visible');
    } else {
        closeBtn.classList.remove('visible');
        searchPopup.classList.remove('visible');
        resultList.innerHTML = '';
    }
  }

  // 关闭按钮点击事件
  closeBtn.addEventListener('click', function() {
      searchInput.value = '';
      closeBtn.classList.remove('visible');
      searchPopup.classList.remove('visible');
      resultList.innerHTML = '';
      searchInput.focus();
  });

  // 点击外部关闭搜索结果
  document.addEventListener('click', function(e) {
      const isInside = e.target.closest('.search-container');
      if (!isInside) {
          searchPopup.classList.remove('visible');
      }
  });

  // ESC键关闭搜索结果
  document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
          searchPopup.classList.remove('visible');
      }
  });

  // ========================================================
  // start
  // 处理搜索逻辑
  function handleSearch(e) {
    const query = e.target.value.trim();
  
    searchCloseBtnDisplay(query);
  
    // 清空输入时隐藏结果
    if (query.length === 0) {
      searchResults.innerHTML = '';
      return;
    }
    
    // 未加载完成时不执行搜索
    if (!fuse) return;
    
    // 执行搜索并显示结果
    const results = fuse.search(query);
    renderResults(results , query);
  }
  
  // 渲染搜索结果
  function renderResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-result">没有找到匹配内容</div>';
      console.log('searchResults.innerHTML=""');
      return;
    }

    // 拼接结果 HTML
    const html = results.map(result => {
      const item = result.item;
      // 提取包含关键词的上下文片段（核心功能）
      const context = extractContext(item.content, query, 200); // 100 字符上下文
      
      return `
        <li class="search-result-item">
          <a href="${item.url}" class="search-result-title">
            ${highlightMatch(item.title, query)}
          </a>
          <div class="search-result-meta">
            <span>${formatDate(item.date)}</span>
            <span>${item.section}</span>
          </div>
          <p class="search-result-context">${context}</p>
        </li>
      `;
    }).join('');

    // 拼接结果 HTML
    // const html = results.map(result => {
    //   const item = result.item;
    //   return `
    //     <li class="search-result-item">
    //       <a href="${item.url}" class="search-result-title">${highlightMatch(item.title, searchInput.value)}</a>
    //       <p class="search-result-date">${formatDate(item.date)}</p>
    //       <p class="search-result-summary">${item.summary || '无摘要'}</p>
    //       <span class="search-result-section">${item.section}</span>
    //     </li>
    //   `;
    // }).join('');
    
    searchResults.innerHTML = html;
  }
  
  // 核心函数：提取包含关键词的上下文
  function extractContext(text, keyword, maxLength) {
    if (!text || !keyword) return '';
    
    // 转为小写便于匹配
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerText.indexOf(lowerKeyword);
    
    if (index === -1) {
      // 未找到关键词时返回开头片段
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }
    
    // 计算上下文范围（关键词前后各取一半长度）
    const half = Math.floor(maxLength / 2);
    const start = Math.max(0, index - half);
    const end = Math.min(text.length, index + keyword.length + half);
    
    // 提取片段并添加省略号
    let context = text.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < text.length) context += '...';
    
    // 高亮关键词
    return highlightMatch(context, keyword);
  }
  
  // 辅助函数：去除HTML标签
  function stripHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }

  // 工具函数：格式化日期(Jan. 3, 2025)
  // zh-CN （2025年1月3日）
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // 工具函数：高亮匹配文本（可选）
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    // const regex = new RegExp(`(${query})`, 'gi');
    // return text.replace(regex, '<mark>$1</mark>');
    return text.replace(regex, '<span class="search-keyword">$1</span>');
  }
  
  // 工具函数：防抖动（避免输入频繁触发搜索）
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  // 工具函数：转义正则特殊字符
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // end
  // ========================================================

  // 初始聚焦
  searchInput.focus();

});