/* 终极独立版 KTV 悬浮歌词显示 */
(function () {
  'use strict';

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
    @media (max-width: 768px) { #global-lyric-box { top: 8vh; gap: 8px; } .lyric-line { font-size: 16px; } }
  `;
  document.head.appendChild(style);

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

  function init() {
    player = window.meteorAP;
    if (!player || !player.list || !player.audio) return;

    const song = player.list.audios[player.list.index];
    if (!song) return;

    if (lastSongIndex !== player.list.index) {
      lastSongIndex = player.list.index;
      currentIndex = -1;
      parsedLrc = []; 
      lyricBox.classList.remove('show');

      if (song.lrc) {
        // 如果是字符串歌词 (lrcType: 1)
        if (!song.lrc.startsWith('http') && !song.lrc.startsWith('/')) {
            parsedLrc = parseLrcText(song.lrc);
            console.log("✅ 成功解析文本歌词，共", parsedLrc.length, "句");
        } else {
            // 如果是外链
            fetch(song.lrc)
              .then(res => res.text())
              .then(text => { 
                  parsedLrc = parseLrcText(text); 
                  console.log("✅ 成功获取并解析外链歌词，共", parsedLrc.length, "句");
              })
              .catch((err) => {
                  console.error("❌ 外链歌词加载失败:", song.lrc);
                  parsedLrc = [];
              });
        }
      } else {
          console.log("⚠️ 当前歌曲没有配置 lrc 字段");
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
      lyricBox.classList.remove('show'); 
      return;
    }

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

  setInterval(init, 200);

  document.addEventListener('pjax:complete', () => {
    currentIndex = -1;
    lastSongIndex = -1;
    lyricBox.classList.remove('show');
  });

})();