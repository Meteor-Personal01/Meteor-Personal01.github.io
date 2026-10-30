(function() {
  'use strict';
  // ==================== 1. 自定义右键菜单 ====================
  window.rmf = {};
  var mouseMode = localStorage.getItem('mouse') || 'on';

  rmf.showRightMenu = function(isTrue, x = 0, y = 0) {
    let $rightMenu = document.getElementById('rightMenu');
    if(!$rightMenu) return;
    $rightMenu.style.top = x + 'px';
    $rightMenu.style.left = y + 'px';
    $rightMenu.style.display = isTrue ? 'block' : 'none';
    let mask = document.querySelector('.rmMask');
    if(!mask) {
        mask = document.createElement('div');
        mask.className = 'rmMask';
        document.body.appendChild(mask);
        mask.onclick = () => rmf.showRightMenu(false);
    }
    mask.style.display = isTrue ? 'block' : 'none';
  };

  rmf.copyWordsLink = function() {
    navigator.clipboard.writeText(window.location.href);
  };
  rmf.copySelect = function() { document.execCommand('Copy', false, null); };
  rmf.scrollToTop = function() { btf.scrollToDest(0, 500); };
  
  rmf.switchReadMode = function() {
    document.body.classList.add('read-mode');
    const newEle = document.createElement('button');
    newEle.type = 'button';
    newEle.className = 'fas fa-sign-out-alt exit-readmode';
    document.body.appendChild(newEle);
    newEle.onclick = function() {
      document.body.classList.remove('read-mode');
      newEle.remove();
    };
  };

  // 👇 新增的三个功能 👇
  
  // 切换日夜模式
  rmf.toggleDarkMode = function() {
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (!isDark) {
      if (typeof activateDarkMode === 'function') activateDarkMode();
      else { document.documentElement.setAttribute('data-theme', 'dark'); document.body.classList.add('DarkMode'); }
      localStorage.setItem('theme', 'dark');
    } else {
      if (typeof activateLightMode === 'function') activateLightMode();
      else { document.documentElement.setAttribute('data-theme', 'light'); document.body.classList.remove('DarkMode'); }
      localStorage.setItem('theme', 'light');
    }
    rmf.showRightMenu(false);
  };

  // 切换全屏
  rmf.toggleFullScreen = function() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    rmf.showRightMenu(false);
  };

  // 随便逛逛
  rmf.goRandom = function() {
    if (typeof randomPost === 'function') {
      randomPost();
    } else {
      window.location.href = '/archives/'; 
    }
    rmf.showRightMenu(false);
  };
  // 👆 新增功能结束 👆

  document.oncontextmenu = function(event) {
    if (mouseMode === 'off') return true;
    let el = event.target;
    if (!document.getElementById('rightMenu')) return true;

    // 隐藏所有组
    document.querySelectorAll('.rightMenu-group').forEach(g => g.classList.add('hide'));
    document.getElementById('menu-post').classList.remove('hide');

    if (document.getSelection().toString()) document.getElementById('menu-text').classList.remove('hide');
    
    if (el.tagName === 'A') {
      document.getElementById('menu-to').classList.remove('hide');
      rmf.open = () => { window.location.href = el.href; };
      rmf.openWithNewTab = () => { window.open(el.href); };
      rmf.copyLink = () => { navigator.clipboard.writeText(el.href); };
    } else if (el.tagName === 'IMG') {
      document.getElementById('menu-img').classList.remove('hide');
      rmf.openWithNewTab = () => { window.open(el.src); };
      rmf.copyLink = () => { navigator.clipboard.writeText(el.src); };
    }

    let pageX = event.clientX + 10;
    let pageY = event.clientY;
    if (pageX + 160 > window.innerWidth) pageX -= 170;
    if (pageY + 200 > window.innerHeight) pageY -= 200;
    
    rmf.showRightMenu(true, pageY, pageX);
    return false;
  };
  window.addEventListener('click', () => rmf.showRightMenu(false));


  // ==================== 2. F12 防扒站提示 (FomalNotify 版) ====================
  let lastWarnTime = 0;

  document.addEventListener('keydown', function(e) {
    const key = e.key || '';
    const keyCode = e.keyCode || e.which;

    // 1. 拦截 Ctrl+U (查看源码) 和 Ctrl+S (保存网页)
    if (e.ctrlKey && (key.toUpperCase() === 'U' || key.toUpperCase() === 'S')) {
      e.preventDefault();
      e.returnValue = false;
      printWarning();
      return false;
    }

    // 2. 检测 F12 / Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
    const isDevTools = (keyCode === 123) || 
                       (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(key.toUpperCase()));

    if (isDevTools) {
      // 加个 1 秒的防抖，防止狂按 F12 导致弹窗疯狂弹出
      const now = new Date().getTime();
      if (now - lastWarnTime > 1000) {
        printWarning();
        lastWarnTime = now;
      }
    }
  });

  function printWarning() {
    // 如果 fomalNotify 没加载出来，回退到控制台输出
    if (typeof fomalNotify === 'undefined') {
      console.log("%c ⚠️ 警告！扒源记得遵循协议！", "color: #e3b341; font-size: 16px; font-weight: bold;");
      return;
    }

    // 调用你自己的轻量级通知组件
    fomalNotify({
      type: 'warning', // 如果你自己的 notify.js 没写 warning 样式，可以改成 'info'
      title: '你已被发现 🥴',
      message: '小同志，扒源记住要遵循 GPL 协议！',
      duration: 3500
    });
  }


  // ==================== 3. 恶搞标题 ====================
  var OriginTitile = document.title;
  var titleTime;
  
  // 监听 PJAX 更新标题
  document.addEventListener('pjax:complete', function() {
    setTimeout(() => { OriginTitile = document.title; }, 100);
  });

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      document.title = 'WHERE ARE YOU?';
      clearTimeout(titleTime);
    } else {
      document.title = 'GOTCHA!';
      titleTime = setTimeout(function() {
        document.title = OriginTitile;
      }, 2000);
    }
  });


  // ==================== 4. 控制台字符画 ====================
  var ascii = String.raw`
     __  __ _____ _____ _____ ___  ____  
    |  \/  | ____|_   _| ____/ _ \|  _ \ 
    | |\/| |  _|   | | |  _|| | | | |_) |
    | |  | | |___  | | | |__| |_| |  _ < 
    |_|  |_|_____| |_| |_____\___/|_| \_\
  Meteor's Blog 🚀
  `;
  console.log(`%c${ascii}`, "color:#58a6ff; font-weight: bold; font-family: monospace;");
  console.log("%c ⚡ Powered by Meteor %c 你正在访问 Meteor 的博客", "color:white; background-color:#f0ad4e; padding: 4px; border-radius: 4px 0 0 4px;", "color:white; background-color:#23c682; padding: 4px; border-radius: 0 4px 4px 0;");
  console.log("%c W23-12 %c 系统监测到你已打开控制台", "color:white; background-color:#4f90d9; padding: 4px; border-radius: 4px 0 0 4px;", "");


  // ==================== 5. 开发者工具打开检测 ====================
  let devtoolsOpened = false;
  const threshold = 160; // 窗口宽高变化阈值

  setInterval(function() {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
      if (!devtoolsOpened) {
        devtoolsOpened = true;
        
        // 改用温和的金色提示
        console.log("%c 别看了，快关掉吧！", "color: #e3b341; font-size: 14px; padding: 4px; border: 1px solid #e3b341; border-radius: 4px;");
      }
    } else {
      if (devtoolsOpened) {
        devtoolsOpened = false;
        document.body.style.filter = "none"; // 恢复原样
      }
    }
  }, 1000);

})(); // 确保所有的代码都在这对括号里面