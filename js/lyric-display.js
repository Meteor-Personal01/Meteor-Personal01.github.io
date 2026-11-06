/* 终极独立版 KTV 悬浮歌词显示 & 词字开关 (中英分行+仅英文扫光版) */
(function () {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    #global-lyric-box {
      position: fixed; top: 12vh; left: 50%; transform: translateX(-50%);
      width: 90%; max-width: 800px; text-align: center; z-index: 999;
      pointer-events: none; display: flex; flex-direction: column;
      align-items: center; gap: 24px; opacity: 0; transition: opacity 0.5s ease;
    }
    #global-lyric-box.show { opacity: 1; }
    
    .lyric-line {
      font-family: "LXGW WenKai", sans-serif; letter-spacing: 2px; 
      text-align: center; transition: all 0.3s ease;
    }
    
    /* 当前句容器 */
    #lyric-curr {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      transform: scale(1.1);
    }

    /* 当前句：英文（承担扫光与霓虹发光） */
    #lyric-curr-en {
      font-size: 26px; font-weight: 800;
      background-image: linear-gradient(90deg, #00e1ff 0%, #58a6ff 0%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.25) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      filter: drop-shadow(0 0 10px rgba(88, 166, 255, 0.7)) drop-shadow(0 0 20px rgba(0, 225, 255, 0.4));
    }

    /* 当前句：中文（缩小一倍，放在下方，不参与扫光） */
    #lyric-curr-zh {
      font-size: 13px; font-weight: 500; color: rgba(255, 255, 255, 0.8);
      text-shadow: 0 2px 4px rgba(0,0,0,0.5); letter-spacing: 1px;
    }
    
    /* 下一句容器 */
    #lyric-next {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
    }

    /* 下一句：英文 */
    #lyric-next-en {
      font-size: 18px; font-weight: 600; color: rgba(255, 255, 255, 0.4);
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    /* 下一句：中文 */
    #lyric-next-zh {
      font-size: 11px; font-weight: 500; color: rgba(255, 255, 255, 0.2);
    }
    
    /* 👇 词字按钮样式 */
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
    
    @media (max-width: 768px) { 
      #global-lyric-box { top: 8vh; gap: 16px; } 
      #lyric-curr-en { font-size: 20px; } 
      #lyric-curr-zh { font-size: 11px; }
      #lyric-next-en { font-size: 15px; }
      #lyric-next-zh { font-size: 9px; }
    }
  `;
  document.head.appendChild(style);

  const lyricBox = document.createElement('div');
  lyricBox.id = 'global-lyric-box';
  lyricBox.innerHTML = `
    <div class="lyric-line" id="lyric-curr">
      <div id="lyric-curr-en"></div>
      <div id="lyric-curr-zh"></div>
    </div>
    <div class="lyric-line" id="lyric-next">
      <div id="lyric-next-en"></div>
      <div id="lyric-next-zh"></div>
    </div>
  `;
  document.body.appendChild(lyricBox);

  const elCurrEn = document.getElementById('lyric-curr-en');
  const elCurrZh = document.getElementById('lyric-curr-zh');
  const elNextEn = document.getElementById('lyric-next-en');
  const elNextZh = document.getElementById('lyric-next-zh');

  let isLrcOn = true;
  let parsedLrc = []; 
  let currentIndex = -1;
  let lastSongIndex = -1;
  let player = null;
  let currentProgress = -1; 

  function parseLrcText(text) {
    if (!text) return [];
    let lines = text.split('\n');
    let result = [];
    let reg = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/;
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

  function injectBtn() {
    const aplayer = document.querySelector('.aplayer');
    if (!aplayer || document.querySelector('.my-aplayer-btn')) return;
    const controlBar = aplayer.querySelector('.aplayer-time');
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

  function init() {
    injectBtn(); 
    player = window.meteorAP;
    if (!player || !player.list || !player.audio) return;

    const song = player.list.audios[player.list.index];
    if (!song) return;

    if (lastSongIndex !== player.list.index) {
      lastSongIndex = player.list.index;
      currentIndex = -1;
      parsedLrc = []; 
      lyricBox.classList.remove('show');
      currentProgress = -1;

      if (song.lrc) {
        if (!song.lrc.startsWith('http') && !song.lrc.startsWith('/')) {
            parsedLrc = parseLrcText(song.lrc);
        } else {
            fetch(song.lrc).then(res => res.text()).then(text => { parsedLrc = parseLrcText(text); }).catch(() => { parsedLrc = []; });
        }
      }
    }

    if (parsedLrc.length === 0 || !isLrcOn || player.audio.paused) return;

    const time = player.audio.currentTime;
    let idx = -1;
    for (let i = 0; i < parsedLrc.length; i++) {
      if (time >= parsedLrc[i].time) idx = i;
      else break;
    }

    if (idx === -1) {
      lyricBox.classList.remove('show'); 
      return;
    }

    if (idx !== currentIndex) {
      currentIndex = idx;
      lyricBox.classList.add('show');
      
      // 拆分当前句：以 "/" 分割英文和中文
      const currParts = parsedLrc[idx].text.split('/');
      elCurrEn.textContent = currParts[0] ? currParts[0].trim() : parsedLrc[idx].text;
      if (currParts[1]) {
        elCurrZh.textContent = currParts[1].trim();
        elCurrZh.style.display = 'block';
      } else {
        elCurrZh.style.display = 'none';
      }

      // 拆分下一句
      if (idx < parsedLrc.length - 1) {
        const nextParts = parsedLrc[idx+1].text.split('/');
        elNextEn.textContent = nextParts[0] ? nextParts[0].trim() : parsedLrc[idx+1].text;
        if (nextParts[1]) {
          elNextZh.textContent = nextParts[1].trim();
          elNextZh.style.display = 'block';
        } else {
          elNextZh.style.display = 'none';
        }
      } else {
        elNextEn.textContent = '';
        elNextZh.textContent = '';
      }
    }

    const startTime = parsedLrc[idx].time;
    const endTime = (idx + 1 < parsedLrc.length) ? parsedLrc[idx + 1].time : (player.audio.duration || startTime + 5);
    const duration = endTime - startTime;
    let p = duration > 0 ? ((time - startTime) / duration) * 100 : 100;
    if (p < 0) p = 0;
    if (p > 100) p = 100;

    if (Math.abs(p - currentProgress) > 0.5 || currentProgress === -1) {
      currentProgress = p;
      const softEdge = Math.max(0, p - 6);
      // 扫光效果只赋予 elCurrEn
      elCurrEn.style.backgroundImage = `linear-gradient(90deg, #00e1ff 0%, #58a6ff ${softEdge}%, rgba(255, 255, 255, 0.25) ${p}%, rgba(255, 255, 255, 0.25) 100%)`;
    }
  }

  setInterval(init, 200);

  document.addEventListener('pjax:complete', () => {
    currentIndex = -1;
    lastSongIndex = -1;
    currentProgress = -1;
    lyricBox.classList.remove('show');
  });

})();