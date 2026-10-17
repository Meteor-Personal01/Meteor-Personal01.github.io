// 将初始化逻辑封装在一个函数中
function initMeteorMusicPlayer() {
  // 防止 PJAX 切换页面时重复创建播放器
  if (document.getElementById('aplayer')) {
    return; 
  }

  // 记住用户选择（默认开启）
  var musicEnabled = localStorage.getItem('music_enabled');
  if (musicEnabled === null) musicEnabled = 'true';

  // 创建播放器容器
  var playerContainer = document.createElement('div');
  playerContainer.id = 'aplayer';
  // 加上 no-destroy 类，这是防止 PJAX 销毁它的关键
  playerContainer.className = 'no-destroy'; 
  playerContainer.style.cssText = 'position:fixed;bottom:90px;right:20px;width:300px;z-index:9999;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.4);transition:transform 0.3s ease;';
  
  if (musicEnabled === 'false') {
    playerContainer.style.transform = 'translateX(320px)';
  }
  
  document.body.appendChild(playerContainer);

  // 创建切换按钮
  var toggleBtn = document.createElement('div');
  toggleBtn.id = 'music-toggle';
  toggleBtn.className = 'no-destroy'; // 同样加上 no-destroy
  toggleBtn.style.cssText = 'position:fixed;bottom:30px;right:20px;width:48px;height:48px;background:#1f6feb;border:2px solid #58a6ff;border-radius:50%;cursor:pointer;z-index:10000;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(88,166,255,0.4);transition:all 0.3s ease;';
  
  toggleBtn.innerHTML = musicEnabled === 'true' 
    ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>'
    : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  
  document.body.appendChild(toggleBtn);

  // 初始化 APlayer
  var ap = new APlayer({
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
            url: '/music/song1.mp3', // 确保前面有斜杠
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
  
  // 将 ap 挂载到全局，防止 PJAX 切换时被垃圾回收
  window.meteorAP = ap;

  // 按钮点击事件
  toggleBtn.addEventListener('click', function() {
    var isOpen = playerContainer.style.transform !== 'translateX(320px)';
    
    if (isOpen) {
      playerContainer.style.transform = 'translateX(320px)';
      window.meteorAP.pause();
      localStorage.setItem('music_enabled', 'false');
      toggleBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
      toggleBtn.style.background = '#484f58';
      toggleBtn.style.borderColor = '#6e7681';
      toggleBtn.style.boxShadow = 'none';
    } else {
      playerContainer.style.transform = 'translateX(0)';
      window.meteorAP.play();
      localStorage.setItem('music_enabled', 'true');
      toggleBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
      toggleBtn.style.background = '#1f6feb';
      toggleBtn.style.borderColor = '#58a6ff';
      toggleBtn.style.boxShadow = '0 0 15px rgba(88,166,255,0.4)';
    }
  });

  toggleBtn.addEventListener('mouseenter', function() {
    toggleBtn.style.transform = 'scale(1.1)';
  });
  toggleBtn.addEventListener('mouseleave', function() {
    toggleBtn.style.transform = 'scale(1)';
  });
}

// 首次加载时执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMeteorMusicPlayer);
} else {
  initMeteorMusicPlayer();
}

// 兼容 PJAX：每次 PJAX 切换完成后，检查播放器是否还在，不在就重新初始化
if (typeof window.pjax !== 'undefined') {
  document.addEventListener('pjax:complete', initMeteorMusicPlayer);
}