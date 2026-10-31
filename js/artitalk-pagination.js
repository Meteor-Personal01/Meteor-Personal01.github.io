/* Artitalk 静态版 自动分页（限制 10 条/页） */
(function () {
  'use strict';

  const PAGE_SIZE = 10; // 每页显示数量
  let currentPage = 1;

  function initPagination() {
    const container = document.getElementById('artitalk_main');
    // 如果页面上没有说说容器，或者还没加载出数据，就等一会
    if (!container) return;
    
    // 获取所有说说卡片（排除掉加载中和提示节点）
    const items = Array.from(container.querySelectorAll('.artitalk-item'));
    if (items.length === 0) {
      setTimeout(initPagination, 500);
      return;
    }

    // 如果已经分过页了，就不要重复初始化
    if (container.getAttribute('data-paginated') === 'true') return;
    container.setAttribute('data-paginated', 'true');

    // 1. 计算总页数
    const totalPages = Math.ceil(items.length / PAGE_SIZE);

    // 2. 如果只有一页，就不需要分页按钮了
    if (totalPages <= 1) return;

    // 3. 创建分页按钮容器
    const pageBox = document.createElement('div');
    pageBox.className = 'artitalk-pagination';
    pageBox.style.cssText = 'display: flex; justify-content: center; gap: 8px; margin-top: 20px; margin-bottom: 10px; flex-wrap: wrap;';

    // 渲染第一页
    renderPage(1);

    // 生成按钮
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.style.cssText = 'padding: 5px 12px; border-radius: 6px; border: 1px solid var(--theme-color); background: transparent; color: var(--font-color); cursor: pointer; transition: all 0.2s; font-size: 14px;';
      
      // 默认第一页高亮
      if (i === 1) {
        btn.style.background = 'var(--theme-color)';
        btn.style.color = '#fff';
      }

      btn.onclick = () => {
        currentPage = i;
        renderPage(i);
        // 更新按钮样式
        Array.from(pageBox.children).forEach(b => {
          b.style.background = 'transparent';
          b.style.color = 'var(--font-color)';
        });
        btn.style.background = 'var(--theme-color)';
        btn.style.color = '#fff';
      };
      pageBox.appendChild(btn);
    }

    // 把分页按钮追加到说说容器后面
    container.parentNode.insertBefore(pageBox, container.nextSibling);

    // 核心渲染函数
    function renderPage(page) {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      
      items.forEach((item, index) => {
        if (index >= start && index < end) {
          item.style.display = 'block'; // 显示当前页
        } else {
          item.style.display = 'none';  // 隐藏其他页
        }
      });
    }
  }

  // 应对 PJAX 切页和首次加载
  document.addEventListener('DOMContentLoaded', () => setTimeout(initPagination, 1000));
  document.addEventListener('pjax:complete', () => {
    // 切页后重置状态
    currentPage = 1;
    const container = document.getElementById('artitalk_main');
    if (container) container.removeAttribute('data-paginated');
    setTimeout(initPagination, 1000);
  });

})();