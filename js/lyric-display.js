/* 终极独立版 KTV 悬浮歌词显示 */
(function () {
  'use strict';

  // 1. 注入样式
  const style = document.createElement('style');
  style.textContent = `
    #global-lyric-box {
      position: fixed; top: 12vh; left: 50%; transform: translateX(-50%);
      width: 90%; max-width: 800px; text-align: center; z-index: 999;
      pointer-events: none; display: flex; flex-direction: column;
      align-items: center; gap: 12px; opacity: 0; transition: opacity 0.5s ease;
    }
    #global-lyric-box.show { opacity: 1; }
    .lyric-line {
      font-family: "LXGW WenKai", sans-serif; font-size: 22px; font-weight: 600;
      letter-spacing: 2px; color: rgba(255, 255, 255, 0.3); transition: all 0.3s ease;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .lyric-line.passed { color: #58a6ff !important; text-shadow: 0 0 10px rgba(88, 166, 255, 0.4); }
    .lyric-line.active { color: #ffffff !important; text-shadow: 0 0 15px rgba(255, 255, 255, 0.8); transform: scale(1.15); font-weight: 800; }
    
    .my-aplayer-btn {
      font-family: "LXGW WenKai", sans-serif; font-size: 13px; font-weight: bold;
      color: var(--theme-color, #58a6ff); border: 1px solid var(--theme-color, #58a6ff);
      border-radius: 4px; padding: 0 6px; margin-left: 8px; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      height: 22px; line-height: 1; transition: all 0.2s; user-select: none;
      vertical-align: middle;
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
  let parsedLrc = []; 
  let currentIndex = -1;
  let lastSongIndex = -1;
  let player = null;

  // 3. 解析 LRC 文本工具
  function parseLrcText(text) {
    if (!text) return [];
    let lines = text.split('\n');
    let result = [];
    let reg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      let match = reg.exec(line);
      if (match) {
        let m = parseInt(match[1]);
        let s = parseInt(match[2]);
        let ms = match[3] ? parseInt(match[3]) / (match[3].length === 2 ? 100 : 1000) : 0;
        let time = m * 60 + s + ms;
        let content = match[4].trim();
        if (content) result.push({ time: time, text: content });
      }
    }
    return result.sort((a, b) => a.time - b.time);
  }

  // 4. 注入“词”字按钮（强行找位置注入）
  function injectBtn() {
    const aplayer = document.querySelector('.aplayer');
    if (!aplayer || document.querySelector('.my-aplayer-btn')) return;
    
    // 直接找时间进度那栏，把按钮塞进去
    const timeBar = aplayer.querySelector('.aplayer-time-inner')?.parentNode || aplayer.querySelector('.aplayer-time');
    if (!timeBar) return;

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
    timeBar.appendChild(btn);
  }

  // 5. 核心逻辑循环
  function init() {
    injectBtn();
    player = window.meteorAP;
    if (!player || !player.list || !player.audio) return;

    const song = player.list.audios[player.list.index];
    if (!song) return;

    // 切歌了，重新解析
    if (lastSongIndex !== player.list.index) {
      lastSongIndex = player.list.index;
      currentIndex = -1;
      parsedLrc = []; 
      lyricBox.classList.remove('show');

      // 如果带有 lrc 字段
      if (song.lrc) {
        if (song.lrc.startsWith('http') || song.lrc.startsWith('/')) {
          // 是外链，去 fetch
          fetch(song.lrc)
            .then(res => res.text())
            .then(text => { parsedLrc = parseLrcText(text); })
            .catch(() => parsedLrc = []);
        } else {
          // 是直接写的文本
          parsedLrc = parseLrcText(song.lrc);
        }
      }
    }

    if (parsedLrc.length === 0 || !isLrcOn || player.audio.paused) {
      lyricBox.classList.remove('show');
      return;
    }

    const time = player.audio.currentTime;
    let idx = -1;
    for (let i = 0; i < parsedLrc.length; i++) {
      if (time >= parsedLrc[i].time) idx = i;
      else break;
    }

    if (idx === -1) {
      lyricBox.classList.remove('show'); // 前奏
      return;
    }

    // 更新 UI
    if (idx !== currentIndex) {
      currentIndex = idx;
      lyricBox.classList.add('show');
      elCurr.textContent = parsedLrc[idx].text;
      elPrev.textContent = idx > 0 ? parsedLrc[idx-1].text : '';
      elNext.textContent = idx < parsedLrc.length - 1 ? parsedLrc[idx+1].text : '';
      
      elCurr.className = 'lyric-line active';
      elPrev.className = 'lyric-line passed';
      elNext.className = 'lyric-line';
    }
  }

  // 定时器循环，比 requestAnimationFrame 更稳妥，不卡主线程
  setInterval(init, 200);

  document.addEventListener('pjax:complete', () => {
    currentIndex = -1;
    lastSongIndex = -1;
    lyricBox.classList.remove('show');
  });

})();