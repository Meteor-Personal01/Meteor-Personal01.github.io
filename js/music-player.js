// 防止 PJAX 导致脚本重复执行时的全局变量污染
if (!window.meteorMusicInitialized) {
  window.meteorMusicInitialized = true;

  // 提取图标 SVG，方便调用
  const ICON_ON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
  const ICON_OFF = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';

  // 初始化容器和播放器
  function initMeteorMusicPlayer() {
    // 如果已经有了，就不重复创建
    if (document.getElementById('aplayer')) {
      return; 
    }

    var musicEnabled = localStorage.getItem('music_enabled');
    if (musicEnabled === null) musicEnabled = 'true';

    // 1. 创建播放器容器
    var playerContainer = document.createElement('div');
    playerContainer.id = 'aplayer';
    playerContainer.className = 'no-destroy'; // 防止 PJAX 销毁
    playerContainer.style.cssText = 'position:fixed;bottom:90px;right:20px;width:300px;z-index:9999;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.4);transition:transform 0.3s ease;';
    
    if (musicEnabled === 'false') {
      playerContainer.style.transform = 'translateX(320px)';
    }
    
    document.body.appendChild(playerContainer);

    // 2. 创建切换按钮
    var toggleBtn = document.createElement('div');
    toggleBtn.id = 'music-toggle';
    toggleBtn.className = 'no-destroy';
    toggleBtn.style.cssText = 'position:fixed;bottom:30px;right:20px;width:48px;height:48px;background:#1f6feb;border:2px solid #58a6ff;border-radius:50%;cursor:pointer;z-index:10000;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(88,166,255,0.4);transition:all 0.3s ease;';
    
    toggleBtn.innerHTML = musicEnabled === 'true' ? ICON_ON : ICON_OFF;
    
    if (musicEnabled === 'false') {
      toggleBtn.style.background = '#484f58';
      toggleBtn.style.borderColor = '#6e7681';
      toggleBtn.style.boxShadow = 'none';
    }
    
    document.body.appendChild(toggleBtn);

    // 3. 初始化 APlayer
    window.meteorAP = new APlayer({
      container: document.getElementById('aplayer'),
      fixed: false,
      mini: false,
      autoplay: false, 
      loop: 'all',
      order: 'random',
      preload: 'metadata',
      volume: 0.5,
      mutex: true,
      lrcType: 0,
      audio: [
          {
              name: 'Emo Type Beat',
              artist: '落泪河南神',
              url: '/music/song1.mp3',
              cover: '/img/Music/music-cover1.jpg'
          },
          {
              name: '千年之后（氛围版）',
              artist: '艾拉拉/Luv4',
              url: '/music/song2.mp3',
              cover: '/img/Music/music-cover2.jpg',
          },
          {
              name: 'Past Lives（纯音乐）',
              artist: 'Slushii',
              url: '/music/song3.mp3',
              cover: '/img/Music/music-cover3.jpg',
          },
      ]
    });
  }

  // 【核心修复】：使用事件委托监听全局点击，彻底解决 PJAX 后点不动的问题
  document.addEventListener('click', function(e) {
    // 判断点击的是不是切换按钮（或者它里面的 SVG）
    var btn = e.target.closest('#music-toggle');
    if (!btn) return;

    var playerContainer = document.getElementById('aplayer');
    if (!playerContainer || !window.meteorAP) return;

    var isOpen = playerContainer.style.transform !== 'translateX(320px)';
    
    if (isOpen) {
      // 关闭逻辑
      playerContainer.style.transform = 'translateX(320px)';
      window.meteorAP.pause();
      localStorage.setItem('music_enabled', 'false');
      btn.innerHTML = ICON_OFF;
      btn.style.background = '#484f58';
      btn.style.borderColor = '#6e7681';
      btn.style.boxShadow = 'none';
    } else {
      // 打开逻辑
      playerContainer.style.transform = 'translateX(0)';
      window.meteorAP.play();
      localStorage.setItem('music_enabled', 'true');
      btn.innerHTML = ICON_ON;
      btn.style.background = '#1f6feb';
      btn.style.borderColor = '#58a6ff';
      btn.style.boxShadow = '0 0 15px rgba(88,166,255,0.4)';
    }
  });

  // 使用事件委托处理悬停缩放效果
  document.addEventListener('mouseover', function(e) {
    var btn = e.target.closest('#music-toggle');
    if (btn) btn.style.transform = 'scale(1.1)';
  });
  document.addEventListener('mouseout', function(e) {
    var btn = e.target.closest('#music-toggle');
    if (btn) btn.style.transform = 'scale(1)';
  });

  // 初始化执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMeteorMusicPlayer);
  } else {
    initMeteorMusicPlayer();
  }

  // 兼容 Butterfly 的不同版本 PJAX 事件，确保切页后能重新检查初始化
  document.addEventListener('pjax:complete', initMeteorMusicPlayer);
  document.addEventListener('pjax:success', initMeteorMusicPlayer);
}