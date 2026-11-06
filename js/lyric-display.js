/* 终极独立版 KTV 悬浮歌词显示 & 词字开关 (精简两句+渐变版) */
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
      font-family: "LXGW WenKai", sans-serif; font-weight: 800;
      letter-spacing: 2px; transition: all 0.3s ease; line-height: 1.5;
      text-align: center;
    }
    
    /* 当前句：KTV 蓝色渐变 + 霓虹发光 */
    #lyric-curr {
      font-size: 26px;
      /* 初始状态设定，随后由 JS 动态替换 */
      background-image: linear-gradient(90deg, #00e1ff 0%, #58a6ff 0%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.3) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      /* 使用 drop-shadow 才能对背景裁切的文字生效，产生赛博发光感 */
      filter: drop-shadow(0 0 10px rgba(88, 166, 255, 0.7)) drop-shadow(0 0 20px rgba(0, 225, 255, 0.4));
      transform: scale(1.1);
    }
    
    /* 下一句：暗色微透 */
    #lyric-next {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.4);
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
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
      #lyric-curr { font-size: 20px; } 
      #lyric-next { font-size: 15px; }
    }
  `;
  document.head.appendChild(style);

  const lyricBox = document.createElement('div');
  lyricBox.id = 'global-lyric-box';
  // 只有当前句和下一句
  lyricBox.innerHTML = `
    <div class="lyric-line" id="lyric-curr"></div>
    <div class="lyric-line" id="lyric-next"></div>
  `;
  document.body.appendChild(lyricBox);

  const elCurr = document.getElementById('lyric-curr');
  const elNext = document.getElementById('lyric-next');

  let isLrcOn = true;
  let parsedLrc = []; 
  let currentIndex = -1;
  let lastSongIndex = -1;
  let player = null;
  let currentProgress = 0;

  // 解析器：兼容 [0:25] 和 [00:25.00]
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

  // 注入“词”字按钮
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
      currentProgress = 0;

      if (song.lrc) {
        if (!song.lrc.startsWith('http') && !song.lrc.startsWith('/')) {
            parsedLrc = parseLrcText(song.lrc);
            console.log("✅ 成功解析文本歌词，共", parsedLrc.length, "句");
        } else {
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
      }
    }

    if (parsedLrc.length === 0 || !isLrcOn) {
      lyricBox.classList.remove('show');
      return;
    }

    // 暂停时不更新进度，但保留显示
    if (player.audio.paused) {
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

    // 切句时更新文字
    if (idx !== currentIndex) {
      currentIndex = idx;
      lyricBox.classList.add('show');
      elCurr.textContent = parsedLrc[idx].text;
      elNext.textContent = idx < parsedLrc.length - 1 ? parsedLrc[idx+1].text : '';
    }

    // 核心：计算进度并应用 KTV 渐变
    const startTime = parsedLrc[idx].time;
    const endTime = (idx + 1 < parsedLrc.length) ? parsedLrc[idx + 1].time : (player.audio.duration || startTime + 5);
    const duration = endTime - startTime;
    let p = ((time - startTime) / duration) * 100;

    if (p < 0) p = 0;
    if (p > 100) p = 100;

    // 为了防止过度重绘，进度变化大于 0.5% 才更新样式
    if (Math.abs(p - currentProgress) > 0.5 || currentProgress === 0) {
      currentProgress = p;
      // 动态绘制：从左到右的蓝色渐变，剩下部分为暗色透明
      elCurr.style.backgroundImage = `linear-gradient(90deg, #00e1ff 0%, #58a6ff ${p}%, rgba(255, 255, 255, 0.3) ${p}%, rgba(255, 255, 255, 0.3) 100%)`;
    }
  }

  // 原有轮询间隔
  setInterval(init, 200);

  document.addEventListener('pjax:complete', () => {
    currentIndex = -1;
    lastSongIndex = -1;
    currentProgress = 0;
    lyricBox.classList.remove('show');
  });

})();