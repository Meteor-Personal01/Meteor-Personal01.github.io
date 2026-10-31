/* Bongo Cat 网页互动桌宠 */
(function () {
  'use strict';

  // 移动端或平板不加载
  if (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) return;
  if (window.innerWidth <= 768) return;

  // ================= CSS =================
  const style = document.createElement('style');
  style.textContent = `
    #bongo-cat {
      position: fixed;
      bottom: 20px;
      right: 80px; /* 放在音乐播放器左边，或者自己调 */
      width: 120px;
      height: 100px;
      z-index: 999;
      pointer-events: none; /* 绝不阻挡访客点击网页 */
      user-select: none;
      transition: transform 0.2s;
    }
    /* 鼠标悬停时猫咪稍微放大互动 */
    #bongo-cat:hover { transform: scale(1.05); }

    /* 基础样式：用 div 拼出一个极简像素猫 */
    .bc-head {
      position: absolute; bottom: 30px; left: 35px;
      width: 50px; height: 40px;
      background: #e5e5e5; border-radius: 25px 25px 10px 10px;
      border: 3px solid #333; box-sizing: border-box;
    }
    .bc-ear-l, .bc-ear-r {
      position: absolute; top: -10px; width: 0; height: 0;
      border-left: 8px solid transparent; border-right: 8px solid transparent;
      border-bottom: 15px solid #333;
    }
    .bc-ear-l { left: 0; }
    .bc-ear-r { right: 0; }
    .bc-face {
      position: absolute; top: 12px; left: 10px;
      width: 30px; height: 15px;
      border-bottom: 3px solid #333; border-radius: 0 0 15px 15px;
    }
    .bc-face::before, .bc-face::after {
      content: ''; position: absolute; top: 0; width: 4px; height: 4px; background: #333; border-radius: 50%;
    }
    .bc-face::before { left: 4px; }
    .bc-face::after { right: 4px; }

    .bc-body {
      position: absolute; bottom: 0; left: 25px;
      width: 70px; height: 35px;
      background: #e5e5e5; border-radius: 20px 20px 0 0;
      border: 3px solid #333; border-bottom: none; box-sizing: border-box;
    }

    .bc-paw {
      position: absolute; bottom: 10px; width: 20px; height: 15px;
      background: #e5e5e5; border: 3px solid #333; border-radius: 10px;
      transition: transform 0.05s;
    }
    .bc-paw-l { left: 15px; transform-origin: bottom left; }
    .bc-paw-r { right: 15px; transform-origin: bottom right; }

    /* 鼠标移动时，让猫的脸部稍微有点偏移 */
    .bc-eye-tracking {
      transition: transform 0.1s;
    }
    
    /* 按下按键的动画 */
    .bc-paw.active { transform: translateY(5px) scaleY(0.8); }
  `;
  document.head.appendChild(style);

  // ================= HTML =================
  const catHTML = `
    <div class="bc-body">
      <div class="bc-paw bc-paw-l"></div>
      <div class="bc-paw bc-paw-r"></div>
    </div>
    <div class="bc-head">
      <div class="bc-ear-l"></div>
      <div class="bc-ear-r"></div>
      <div class="bc-face bc-eye-tracking"></div>
    </div>
  `;
  const cat = document.createElement('div');
  cat.id = 'bongo-cat';
  cat.innerHTML = catHTML;
  document.body.appendChild(cat);

  const pawL = cat.querySelector('.bc-paw-l');
  const pawR = cat.querySelector('.bc-paw-r');
  const face = cat.querySelector('.bc-face');

  // ================= 核心逻辑 =================

  // 1. 键盘互动 (只识别左右半区，绝不侵犯输入隐私)
  let isTyping = false;
  document.addEventListener('keydown', function (e) {
    if (e.repeat) return;
    // 如果焦点在输入框里，或者随便敲个键，就开始拍
    // 根据按键在键盘的左半边还是右半边，判断哪只爪子抬起
    // 这里做一个简单的映射：左边字母/数字，或者特殊键 -> 左爪；右边 -> 右爪
    const keyStr = e.key.toUpperCase();
    const leftKeys = 'QWERTASDFGZXCVB12345`~!@#$%'.split('');
    const rightKeys = 'YUIOPHJKLNM67890-=[]\\;\',./'.split('');
    
    if (leftKeys.includes(keyStr) || keyStr === 'Shift' || keyStr === 'Control') {
      pawL.classList.add('active');
      setTimeout(() => pawL.classList.remove('active'), 100);
    } else if (rightKeys.includes(keyStr) || keyStr === 'Enter' || keyStr === 'Backspace') {
      pawR.classList.add('active');
      setTimeout(() => pawR.classList.remove('active'), 100);
    } else {
      // 其他键（比如空格、方向键），两只一起按
      pawL.classList.add('active');
      pawR.classList.add('active');
      setTimeout(() => {
        pawL.classList.remove('active');
        pawR.classList.remove('active');
      }, 100);
    }
  });

  // 2. 鼠标追踪互动 (让猫的眼神跟着鼠标)
  let lastMouseX = 0, lastMouseY = 0;
  let ticking = false;

  document.addEventListener('mousemove', function (e) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    if (!ticking) {
      window.requestAnimationFrame(function () {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        // 计算鼠标相对屏幕中心的偏移量，映射到眼睛的微调
        const offsetX = (lastMouseX - cx) / cx * 3; 
        const offsetY = (lastMouseY - cy) / cy * 2;
        
        face.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        ticking = false;
      });
      ticking = true;
    }
  });

  // 3. 鼠标点击时，猫咪也会拍一下键盘
  document.addEventListener('mousedown', function () {
    pawL.classList.add('active');
    pawR.classList.add('active');
    setTimeout(() => {
      pawL.classList.remove('active');
      pawR.classList.remove('active');
    }, 150);
  });

})();