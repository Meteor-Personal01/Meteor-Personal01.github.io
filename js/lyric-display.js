/* 独立解析版 KTV 悬浮歌词显示 */
(function () {
  'use strict';

  // 1. 注入样式
  const style = document.createElement('style');
  style.textContent = `
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

    /* “词”字按钮 */
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
    .my-aplayer-btn:hover { background: rgba(88, 166, 255, 0.1); }
    .my-aplayer-btn.active { background: var(--theme-color, #58a6ff); color: #fff; }
    @media (max-width: 768px) { #global-lyric-box { top: 8vh; gap: 8px; } .lyric-line { font-size: 16px; } }
  `;
  document.head.appendChild(style);

  // 2. 注入 HTML 骨架
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

  let isLrcOn = true;
  let parsedLrc = []; // 存储解析后的 [{time: 10, text: "..."}]
  let currentIndex = -1;
  let lastSongIndex = -1;
  let player = null;

  // 3. 解析 LRC 文本（兼容外链文件和直接文本）
  function parseLrc(lrcText) {
    if (!lrcText) return [];
    const lines = lrcText.split('\n');
    const result = [];
    const timeReg = /\[(\d{2}):(\d{2})(\.\d{2,3})?\]/;

    lines.forEach(line => {
      const match = timeReg.exec(line);
      if (match) {
        const m = parseInt(match[1]);
        const s = parseInt(match[2]);
        const ms = match[3] ? parseFloat(match[3]) * 1000 : 0;
        const time = m * 60 + s + ms / 1000;
        const text = line.replace(timeReg, '').trim();
        if (text) result.push({ time, text });
      }
    });
    return result.sort((a, b) => a.time - b.time);
  }

  // 4. 动态注入“词”字按钮
  function injectBtn() {
    const aplayer = document.querySelector('.aplayer');
    if (!aplayer || document.querySelector('.my-aplayer-btn')) return;
    
    // 找到 APlayer 的右侧图标控制栏
    const controlBar = aplayer.querySelector('.aplayer-icon-lrc')?.parentNode || aplayer.querySelector('.aplayer-time');
    if (!controlBar) return;

    const btn = document.createElement('div');
    btn.className = 'my-aplayer-btn active';
    btn.textContent = '词';
    btn.title = '开启/关闭悬浮歌词';
    btn.onclick = function(e) {
      e.stopPropagation();
      isLrcOn = !isLrcOn;
      btn.classList.toggle('active', isLrcOn);
      if (!isLrcOn) lyricBox.classList.remove('show');
    };
    controlBar.appendChild(btn);
  }

  // 5. 切歌时重新加载歌词
  function loadLyrics() {
    if (!player) return;
    const currentSong = player.list.audios[player.list.index];
    if (!currentSong) return;

    currentIndex = -1;
    
    // 如果歌曲自带歌词文本 (lrcType: 1 或 0)
    if (currentSong.lrc) {
      parsedLrc = parseLrc(currentSong.lrc);
    } 
    // 如果歌曲带的是 lrc 外链 (lrcType: 3)
    else if (player.options.lrcType === 3 && currentSong.lrc) {
      fetch(currentSong.lrc).then(res => res.text()).then(text => {
        parsedLrc = parseLrc(text);
      }).catch(() => parsedLrc = []);
    } else {
      parsedLrc = [];
    }
  }

  // 6. 监听时间更新，实时渲染
  function updateLyric(time) {
    if (!isLrcOn || parsedLrc.length === 0) {
      lyricBox.classList.remove('show');
      return;
    }

    // 找到当前时间对应的歌词索引
    let idx = -1;
    for (let i = 0; i < parsedLrc.length; i++) {
      if (time >= parsedLrc[i].time) {
        idx = i;
      } else {
        break;
      }
    }

    if (idx === -1) {
      lyricBox.classList.remove('show'); // 前奏部分不显示
      return;
    }

    // 只有当索引发生变化时才更新 DOM
    if (idx !== currentIndex) {
      currentIndex = idx;
      lyricBox.classList.add('show');

      elCurr.textContent = parsedLrc[idx].text;
      elPrev.textContent = idx > 0 ? parsedLrc[idx - 1].text : '';
      elNext.textContent = idx < parsedLrc.length - 1 ? parsedLrc[idx + 1].text : '';

      elCurr.className = 'lyric-line active';
      elPrev.className = 'lyric-line passed';
      elNext.className = 'lyric-line';
    }
  }

  // 7. 初始化与监听
  function init() {
    injectBtn();
    player = window.meteorAP;
    if (!player) return;

    // 绑定 APlayer 事件
    if (lastSongIndex !== player.list.index) {
      lastSongIndex = player.list.index;
      loadLyrics();
    }

    // 获取当前播放时间
    const time = player.audio ? player.audio.currentTime : 0;
    updateLyric(time);

    // 如果处于暂停状态，隐藏歌词
    if (player.audio && player.audio.paused) {
      lyricBox.classList.remove('show');
    }
  }

  // 使用 requestAnimationFrame 高频监听（比 setInterval 更顺滑）
  function loop() {
    init();
    requestAnimationFrame(loop);
  }
  loop();

  // PJAX 兼容
  document.addEventListener('pjax:complete', () => {
    currentIndex = -1;
    lastSongIndex = -1;
    lyricBox.classList.remove('show');
  });

})();