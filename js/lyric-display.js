/* 全局顶部 KTV 歌词显示 & APlayer 控制按钮 */
(function () {
  'use strict';

  // 1. 注入样式（页面顶部歌词 + 播放器上的开关按钮）
  const style = document.createElement('style');
  style.textContent = `
    /* 全局歌词框 */
    #global-lyric-box {
      position: fixed;
      top: 12vh;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 800px;
      text-align: center;
      z-index: 999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    #global-lyric-box.show { opacity: 1; }

    .lyric-line {
      font-family: "LXGW WenKai", sans-serif;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 2px;
      color: rgba(255, 255, 255, 0.3); /* 未播放：暗色 */
      transition: all 0.3s ease;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .lyric-line.passed { /* 播放过：蓝色 */
      color: #58a6ff !important; 
      text-shadow: 0 0 10px rgba(88, 166, 255, 0.4);
    }
    .lyric-line.active { /* 正在播：白色放大 */
      color: #ffffff !important;
      text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
      transform: scale(1.15);
      font-weight: 800;
    }

    /* APlayer 上的“词”字按钮 */
    .my-aplayer-btn {
      font-family: "LXGW WenKai", sans-serif;
      font-size: 13px;
      font-weight: bold;
      color: var(--theme-color, #58a6ff);
      border: 1px solid var(--theme-color, #58a6ff);
      border-radius: 4px;
      padding: 0 6px;
      margin-left: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 22px;
      line-height: 1;
      transition: all 0.2s;
      user-select: none;
    }
    .my-aplayer-btn:hover {
      background: rgba(88, 166, 255, 0.1);
    }
    .my-aplayer-btn.active {
      background: var(--theme-color, #58a6ff);
      color: #fff;
    }

    @media (max-width: 768px) {
      #global-lyric-box { top: 8vh; gap: 8px; }
      .lyric-line { font-size: 16px; }
    }
  `;
  document.head.appendChild(style);

  // 2. 注入顶部歌词 HTML
  const lyricBox = document.createElement('div');
  lyricBox.id = 'global-lyric-box';
  lyricBox.innerHTML = `
    <div class="lyric-line" id="lyric-prev"></div>
    <div class="lyric-line" id="lyric-curr"></div>
    <div class="lyric-line" id="lyric-next"></div>
  `;
  document.body.appendChild(lyricBox);

  const elPrev = document.getElementById('lyric-prev');
  const elCurr = document.getElementById('lyric-curr');
  const elNext = document.getElementById('lyric-next');

  let isLrcOn = true; // 歌词默认开启状态
  let lastIndex = -1;

  // 3. 动态注入按钮到 APlayer
  function injectBtn() {
    const aplayer = document.querySelector('.aplayer');
    if (!aplayer) return;
    
    // 防止重复注入
    if (document.querySelector('.my-aplayer-btn')) return;

    // 找到 APlayer 的右侧图标控制栏（小齿轮/循环模式旁边）
    const controlBar = aplayer.querySelector('.aplayer-icon-lrc')?.parentNode;
    if (!controlBar) return;

    const btn = document.createElement('div');
    btn.className = 'my-aplayer-btn active';
    btn.textContent = '词';
    btn.title = '开启/关闭悬浮歌词';

    btn.onclick = function(e) {
      e.stopPropagation();
      isLrcOn = !isLrcOn;
      if (isLrcOn) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
        lyricBox.classList.remove('show'); // 关掉时直接隐藏
      }
    };

    // 插入到原生控制栏中
    controlBar.appendChild(btn);
  }

  // 4. 从 APlayer 的 DOM 中扒取歌词并渲染
  function syncLyric() {
    if (!isLrcOn) return; // 如果关了，就不处理了

    const aplayer = document.querySelector('.aplayer');
    if (!aplayer) return;

    const lrcRows = aplayer.querySelectorAll('.aplayer-lrc p');
    if (!lrcRows || lrcRows.length === 0) {
      lyricBox.classList.remove('show');
      return;
    }

    let currentIndex = -1;
    lrcRows.forEach((row, index) => {
      if (row.classList.contains('aplayer-lrc-current')) {
        currentIndex = index;
      }
    });

    // 只有当前行发生变化时才更新 DOM
    if (currentIndex !== -1 && currentIndex !== lastIndex) {
      lastIndex = currentIndex;
      lyricBox.classList.add('show');

      const textCurr = lrcRows[currentIndex].textContent.trim();
      const textPrev = currentIndex > 0 ? lrcRows[currentIndex - 1].textContent.trim() : '';
      const textNext = currentIndex < lrcRows.length - 1 ? lrcRows[currentIndex + 1].textContent.trim() : '';

      elCurr.textContent = textCurr;
      elPrev.textContent = textPrev;
      elNext.textContent = textNext;

      // 设置颜色
      elCurr.className = 'lyric-line active';
      elPrev.className = 'lyric-line passed';
      elNext.className = 'lyric-line';
    }

    // 暂停或者隐藏时
    if (aplayer.classList.contains('aplayer-paused') || aplayer.classList.contains('aplayer-lrc-hide')) {
      lyricBox.classList.remove('show');
    }
  }

  // 5. 使用 requestAnimationFrame 循环监听
  function loop() {
    injectBtn(); // 每次循环都检查一下按钮是否在，防止 PJAX 换页丢失
    syncLyric();
    requestAnimationFrame(loop);
  }
  loop();

  // PJAX 兼容：切页时清空状态
  document.addEventListener('pjax:complete', () => {
    lastIndex = -1;
    lyricBox.classList.remove('show');
  });

})();