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


  // ==================== 2. F12 防扒站提示 ====================
  document.onkeydown = function(e) {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 74 || e.keyCode == 73 || e.keyCode == 67)) || (e.ctrlKey && e.keyCode == 85)) {
      // 这里因为没有引入第三方弹窗库，我们用原生弹窗或者控制台警告替代
      console.clear();
      console.log("%c ⚠️ 喂喂，小同志你在干嘛！", "color:white; background-color:#d9534f; padding: 5px; border-radius: 5px; font-size: 20px;");
      console.log("%c 扒源记得遵循协议哦！", "color:#333; font-size: 16px;");
      // 如果想用浏览器的弹窗提醒，取消下面这行的注释：
      // alert("你已被发现😜 小同志，扒源记住要遵循协议！");
    }
  };


  // ==================== 3. 恶搞标题 ====================
  var OriginTitile = document.title;
  var titleTime;
  
  // 监听 PJAX 更新标题
  document.addEventListener('pjax:complete', function() {
    setTimeout(() => { OriginTitile = document.title; }, 100);
  });

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      document.title = '👀 跑哪里去了~';
      clearTimeout(titleTime);
    } else {
      document.title = '🐖 抓到你啦～';
      titleTime = setTimeout(function() {
        document.title = OriginTitile;
      }, 2000);
    }
  });


  // ==================== 4. 控制台字符画 ====================
  var ascii = `
   _____ _____ _____ 
  |     |  _  |     |
  | | | |     |  |  |
  |_|_|_|__|__|_____|
  Meteor's Blog 🚀
  `;
  console.log(`%c${ascii}`, "color:#58a6ff; font-weight: bold; font-family: monospace;");
  console.log("%c ⚡ Powered by Meteor %c 你正在访问 Meteor 的博客", "color:white; background-color:#f0ad4e; padding: 4px; border-radius: 4px 0 0 4px;", "color:white; background-color:#23c682; padding: 4px; border-radius: 0 4px 4px 0;");
  console.log("%c W23-12 %c 系统监测到你已打开控制台", "color:white; background-color:#4f90d9; padding: 4px; border-radius: 4px 0 0 4px;", "");
  
})();