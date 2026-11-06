/* APlayer 播放列表分页控制（每页3首） */
(function () {
  'use strict';

  const PAGE_SIZE = 3;
  let currentPage = 1;
  let totalPages = 1;
  let listContainer = null;
  let allItems = [];

  function initPagination() {
    const aplayer = document.querySelector('.aplayer');
    if (!aplayer) return;

    const list = aplayer.querySelector('.aplayer-list');
    if (!list) return;

    // 如果已经存在分页框，说明已经初始化过了，直接返回（防 Pjax 重复注入）
    if (document.getElementById('aplayer-page-box')) return;

    // 防止重复绑定
    if (list.getAttribute('data-paginated') === 'true') return;
    list.setAttribute('data-paginated', 'true');
    
    listContainer = list;
    allItems = Array.from(list.querySelectorAll('li'));

    // 如果歌曲不超过3首，就不需要分页
    if (allItems.length <= PAGE_SIZE) return;

    totalPages = Math.ceil(allItems.length / PAGE_SIZE);

    // 注入分页按钮容器
    const pageBox = document.createElement('div');
    pageBox.id = 'aplayer-page-box';
    pageBox.innerHTML = `
      <button id="ap-prev">❮</button>
      <span id="ap-page-text">1 / ${totalPages}</span>
      <button id="ap-next">❯</button>
    `;
    listContainer.appendChild(pageBox);

    // 绑定翻页事件
    document.getElementById('ap-prev').onclick = (e) => {
      e.stopPropagation();
      if (currentPage > 1) {
        currentPage--;
        renderPage();
      }
    };
    document.getElementById('ap-next').onclick = (e) => {
      e.stopPropagation();
      if (currentPage < totalPages) {
        currentPage++;
        renderPage();
      }
    };

    renderPage();

    // 监听 APlayer 的切歌事件，如果切到别的页，自动跳页
    // 注意：这里绑定在 aplayer 实例上，防止重复
    if (window.meteorAP) {
        window.meteorAP.on('listswitch', function(ev) {
          const index = ev.index;
          const targetPage = Math.floor(index / PAGE_SIZE) + 1;
          if (targetPage !== currentPage) {
            currentPage = targetPage;
            renderPage();
          }
        });
    }
  }

  function renderPage() {
    if (!listContainer) return;
    
    // 隐藏所有，只显示当前页的
    allItems.forEach((item, index) => {
      if (index >= (currentPage - 1) * PAGE_SIZE && index < currentPage * PAGE_SIZE) {
        item.style.display = 'flex'; // APlayer 的 li 默认是 flex 布局
      } else {
        item.style.display = 'none';
      }
    });

    // 更新页码文本
    const text = document.getElementById('ap-page-text');
    if (text) text.textContent = `${currentPage} / ${totalPages}`;
  }

  // 注入一点基础样式
  const style = document.createElement('style');
  style.textContent = `
    #aplayer-page-box {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      padding: 10px 0;
      border-top: 1px solid rgba(255,255,255,0.05);
      background: rgba(0,0,0,0.1);
    }
    #aplayer-page-box button {
      background: transparent;
      border: none;
      color: var(--theme-color, #58a6ff);
      font-size: 14px;
      cursor: pointer;
      padding: 2px 8px;
    }
    #aplayer-page-box button:hover {
      color: #fff;
    }
    #aplayer-page-box button:disabled {
      color: rgba(255,255,255,0.2);
      cursor: not-allowed;
    }
    #ap-page-text {
      font-size: 12px;
      color: #8b949e;
      font-family: monospace;
    }
  `;
  document.head.appendChild(style);

  // 初始化与 PJAX 兼容
  document.addEventListener('DOMContentLoaded', () => setTimeout(initPagination, 1000));
  
  // 修改：Pjax 切换页面时，不需要重置！因为播放器容器没被销毁，直接防止重复初始化即可
  document.addEventListener('pjax:complete', () => {
    setTimeout(initPagination, 1000);
  });
})();