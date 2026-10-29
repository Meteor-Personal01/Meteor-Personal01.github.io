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


  // ==================== 2. F12 防扒站提示 (Toastr 版) ====================
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
        // 如果控制台没开，我们依然可以弹窗提示
        printWarning();
        lastWarnTime = now;
      }
    }
  });

  function printWarning() {
    // 如果 toastr 没加载出来（比如被广告拦截器屏蔽了），回退到 console 输出
    if (typeof toastr === 'undefined') {
      console.clear();
      console.log("%c ⚠️ 警告！扒源记得遵循协议！", "color: red; font-size: 20px;");
      return;
    }

    // 配置 Fomalhaut 风格左上角弹窗
    toastr.options = {
      closeButton: true,        // 显示右上角关闭按钮
      progressBar: true,        // 底部进度条
      positionClass: "toast-top-left", // 固定在左上角
      timeOut: "3500",          // 3.5 秒后自动消失
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
      onShown: function() {
        // 自定义细边框和毛玻璃底色
        let toast = document.querySelector('#toast-container .toast');
        if (toast) {
          toast.style.background = 'rgba(255, 255, 255, 0.95)';
          toast.style.color = '#333333';
          toast.style.borderRadius = '8px';
          toast.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
          toast.style.border = '1px solid rgba(0, 0, 0, 0.08)';
          toast.style.backdropFilter = 'blur(10px)';
          
          // 替换图标为黄色感叹号
          let icon = toast.querySelector('.toast-icon');
          if (icon) {
            icon.outerHTML = '<span style="color: #eab308; font-size: 18px; margin-right: 8px;">⚠️</span>';
          }
        }
      }
    };

    // 弹出提示
    toastr.warning("小伙子，扒源记住要遵循GPL协议！", "你已被发现🥴");
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


  // ==================== 5. 开发者工具打开检测 ====================
  let devtoolsOpened = false;
  const threshold = 160; // 窗口宽高变化阈值

  setInterval(function() {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
      if (!devtoolsOpened) {
        devtoolsOpened = true;
        // 发现了开发者工具打开，给页面加上模糊滤镜
        document.body.style.filter = "blur(5px)"; 
        console.clear();
        console.log("%c 别看了，快关掉吧！", "color:red; font-size:30px;");
      }
    } else {
      if (devtoolsOpened) {
        devtoolsOpened = false;
        document.body.style.filter = "none"; // 关掉后恢复正常
      }
    }
  }, 1000);

})(); // 确保所有的代码都在这对括号里面