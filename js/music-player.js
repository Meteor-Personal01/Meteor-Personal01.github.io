// 防止 PJAX 导致脚本重复执行时的全局变量污染
if (!window.meteorMusicInitialized) {
  window.meteorMusicInitialized = true;

  const ICON_ON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
  const ICON_OFF = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';

  function initMeteorMusicPlayer() {
    // 👇 修改点1：加强守卫，防止 Pjax 切页重建实例导致卡顿
    if (window.meteorAP || document.getElementById('aplayer')) return; 

    var musicEnabled = localStorage.getItem('music_enabled');
    if (musicEnabled === null) musicEnabled = 'true';

    var playerContainer = document.createElement('div');
    playerContainer.id = 'aplayer';
    playerContainer.className = 'no-destroy';
    playerContainer.style.cssText = 'position:fixed;bottom:90px;left:20px;width:300px;z-index:9999;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.4);transition:transform 0.3s ease;';
    
    if (musicEnabled === 'false') {
      playerContainer.style.transform = 'translateX(-320px)';
    }
    
    document.body.appendChild(playerContainer);

    var toggleBtn = document.createElement('div');
    toggleBtn.id = 'music-toggle';
    toggleBtn.className = 'no-destroy';
    toggleBtn.style.cssText = 'position:fixed;bottom:30px;left:20px;width:48px;height:48px;background:#1f6feb;border:2px solid #58a6ff;border-radius:50%;cursor:pointer;z-index:10000;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(88,166,255,0.4);transition:all 0.3s ease;';
    
    toggleBtn.innerHTML = musicEnabled === 'true' ? ICON_ON : ICON_OFF;
    
    if (musicEnabled === 'false') {
      toggleBtn.style.background = '#484f58';
      toggleBtn.style.borderColor = '#6e7681';
      toggleBtn.style.boxShadow = 'none';
    }
    
    document.body.appendChild(toggleBtn);

    // 👇 修改点2：重构歌词文本，中英合并到同一行，修复上下句错位
    var lrcText1 = `[00:00] lucy~ - Corbon Amodio
[00:08] Lyrics by：Corbon Amodio
[00:16] Composed by：Corbon Amodio
[00:25] Lucy laid on her back / 当我的思绪飞到天边时。
[00:29] While my head spun off the track / 露西趁机躺了下来。
[00:33] Laying still on the grass / 一起躺在草坪上。
[00:37] When did days move so damn fast? / 为什么这一切发展得如此之快?
[00:48] Ooh ah / 哦 啊
[00:57] Hearing the words that I want / 你的心里话我都听到了。
[01:01] But was still caught so off guard / 但我们仍然来了个措手不及。
[01:05] Sunny sky stiff smile / 晴朗的天空，僵硬的笑容。
[01:09] While the beats race in my heart / 我的心在奔腾不止。
[01:20] Bingo Bingo baby / Bingo！Bingo！宝贝。
[01:21] I love you ain't that crazy? / 我爱你，这很疯狂不是吗？
[01:23] I want you I want you over again / >_<我好想你，我想要再爱你一次！
[01:28] Bingo Bingo baby / Bingo！Bingo！宝贝。
[01:29] I love you ain't that crazy? / 我爱你，这很疯狂不是吗？
[01:31] I want you I want you over again / >_<我好想你，我想要再爱你一次！
[01:36] Oh-oh yeah-yeah / 哦~耶~
[01:40] Oh-oh yeah-yeah / 哦~耶~
[01:44] Oh-oh yeah-yeah / 哦~耶~
[01:47] Oh-oh yeah-yeah / 哦~耶~`;

    window.meteorAP = new APlayer({
      container: document.getElementById('aplayer'),
      fixed: false,
      mini: false,
      autoplay: false, 
      loop: 'all',
      order: 'random',
      preload: 'none', // 👈 修改点3：改为 none，不自动预加载，点哪首加载哪首
      volume: 0.5,
      mutex: true,
      lrcType: 1,
      audio: [
          {
              name: 'Emo Type Beat',
              artist: '落泪河南神',
              url: '/music/song1.mp3',
              cover: '/img/Music/music-cover1.jpg'
          },
          {
              name: '若如初见（氛围版）',
              artist: '纯音乐',
              url: '/music/song2.mp3',
              cover: '/img/Music/music-cover2.jpg'
          },
          {
              name: 'Past Lives（纯音乐）',
              artist: 'Slushii',
              url: '/music/song3.mp3',
              cover: '/img/Music/music-cover3.jpg'
          },
          { 
              name: 'lucy~',
              artist: 'Corbon Amodio',
              url: '/music/song4.mp3',
              cover: '/img/Music/music-cover4.jpg',
              lrc: lrcText1 
          } 
      ]
    });
  }

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('#music-toggle');
    if (!btn) return;

    var playerContainer = document.getElementById('aplayer');
    if (!playerContainer || !window.meteorAP) return;

    var isOpen = playerContainer.style.transform !== 'translateX(-320px)';
    
    if (isOpen) {
      playerContainer.style.transform = 'translateX(-320px)';
      window.meteorAP.pause();
      localStorage.setItem('music_enabled', 'false');
      btn.innerHTML = ICON_OFF;
      btn.style.background = '#484f58';
      btn.style.borderColor = '#6e7681';
      btn.style.boxShadow = 'none';
    } else {
      playerContainer.style.transform = 'translateX(0)';
      window.meteorAP.play();
      localStorage.setItem('music_enabled', 'true');
      btn.innerHTML = ICON_ON;
      btn.style.background = '#1f6feb';
      btn.style.borderColor = '#58a6ff';
      btn.style.boxShadow = '0 0 15px rgba(88,166,255,0.4)';
    }
  });

  document.addEventListener('mouseover', function(e) {
    var btn = e.target.closest('#music-toggle');
    if (btn) btn.style.transform = 'scale(1.1)';
  });
  document.addEventListener('mouseout', function(e) {
    var btn = e.target.closest('#music-toggle');
    if (btn) btn.style.transform = 'scale(1)';
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMeteorMusicPlayer);
  } else {
    initMeteorMusicPlayer();
  }
  document.addEventListener('pjax:complete', initMeteorMusicPlayer);
  document.addEventListener('pjax:success', initMeteorMusicPlayer);
}