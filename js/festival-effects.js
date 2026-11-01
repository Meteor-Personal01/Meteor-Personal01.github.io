/* ==================== 全节日 Canvas 漂浮特效引擎 ==================== */
(function() {
  'use strict';

  // 移动端性能有限，不加载
  if (window.innerWidth <= 768) return;

  // ================= 节日判断 =================
  var d = new Date();
  var m = d.getMonth() + 1;
  var dd = d.getDate();
  var y = d.getFullYear();
  var themeType = '';

  // 1. 公历节日判断
  if (m === 2 && dd === 14) themeType = 'valentine'; // 情人节
  else if (m === 5 && dd === 20) themeType = 'valentine'; // 520
  else if (m === 6 && dd === 1) themeType = 'childrensday'; // 儿童节
  else if (m === 10 && dd === 1) themeType = 'national'; // 国庆
  else if ((m === 12 && dd === 24) || (m === 12 && dd === 25)) themeType = 'christmas'; // 平安夜/圣诞
  else if (m === 10 && dd === 31) themeType = 'halloween'; // 万圣节

  // 2. 农历/节气节日判断 (利用你引入的 lunar.js)
  if (!themeType && typeof solar2lunar === 'function') {
    var lunar = solar2lunar();
    if (lunar) {
      if (lunar.IMonthCn === "七月" && lunar.IDayCn === "初七") themeType = 'valentine'; // 七夕
      if (lunar.IMonthCn === "八月" && lunar.IDayCn === "十五") themeType = 'midautumn'; // 中秋
      if ((lunar.IMonthCn === "腊月" && ["三十","廿九"].includes(lunar.IDayCn)) || 
          (lunar.IMonthCn === "正月" && ["初一","初二","初三","初四","初五","初六"].includes(lunar.IDayCn))) {
        themeType = 'springfestival'; // 春节
      }
    }
  }

  // 如果不是节日，直接退出，什么都不加载
  if (!themeType) return;

  // ================= 初始化 Canvas =================
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99;';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var w, h, particles = [];

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  // ================= 节日专属配置 =================
  var config = {
    valentine: { count: 15, speedY: -1.5, size: [15, 30] }, // 爱心向上飘
    childrensday: { count: 12, speedY: -1.2, size: [30, 50] }, // 气球向上飘
    midautumn: { count: 15, speedY: -1, size: [20, 40] }, // 月亮光点向上
    national: { count: 20, speedY: 1.5, size: [15, 25] }, // 五角星下落
    christmas: { count: 40, speedY: 1.5, size: [10, 20] }, // 雪花下落
    springfestival: { count: 15, speedY: 1.2, size: [20, 30] }, // 红包/福字下落
    halloween: { count: 12, speedY: 1.5, size: [20, 40] } // 蝙蝠/南瓜
  };

  var curConfig = config[themeType];

  // ================= 初始化粒子 =================
  for (var i = 0; i < curConfig.count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.5,
      vy: curConfig.speedY * (Math.random() * 0.5 + 0.8),
      size: Math.random() * (curConfig.size[1] - curConfig.size[0]) + curConfig.size[0],
      angle: Math.random() * Math.PI * 2,
      rotateSpeed: (Math.random() - 0.5) * 0.05,
      color: '',
      emoji: ''
    });
  }

  // 万圣节专属图片
  var pumpkinImg = new Image();
  if (themeType === 'halloween') pumpkinImg.src = '/img/pumpkin.png';

  // ================= 绘制底层 (纯代码绘制) =================
  function drawHeart(x, y, size, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 20, size / 20);
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(0, 5); ctx.bezierCurveTo(-10, -10, -20, 5, 0, 20);
    ctx.bezierCurveTo(20, 5, 10, -10, 0, 5); ctx.fill(); ctx.restore();
  }

  function drawStar(x, y, size, color) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = color; ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * size, -Math.sin((18 + i * 72) / 180 * Math.PI) * size);
      ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * size * 0.5, -Math.sin((54 + i * 72) / 180 * Math.PI) * size * 0.5);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function drawSnowflake(x, y, size) {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, size); ctx.stroke();
    }
    ctx.restore();
  }

  function drawBalloon(x, y, size, color) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.6, size, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, size); ctx.lineTo(0, size + 20); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.stroke();
    ctx.restore();
  }

  function drawText(x, y, text, size, color) {
    ctx.save(); ctx.translate(x, y); ctx.font = `bold ${size}px Arial`;
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0); ctx.restore();
  }

  // 蝙蝠路径
  const batPath = new Path2D(`
    M 0,-12 Q -5,-20 -8,-12 C -15,-18 -25,-18 -28,-5 C -20,-5 -22,8 -12,10
    Q -8,5 -6,15 Q 0,20 6,15 Q 8,5 12,10 C 22,8 20,-5 28,-5
    C 25,-18 15,-18 8,-12 Q 5,-20 0,-12 Z
  `);

  // ================= 动画渲染 =================
  function drawParticle(p) {
    if (themeType === 'valentine') {
      p.color = p.size > 22 ? '#ff69b4' : '#ff1493';
      drawHeart(p.x, p.y, p.size, p.color);
    } 
    else if (themeType === 'childrensday') {
      p.color = ['#ff4d4f', '#ffd700', '#00bfff', '#32cd32', '#ff69b4'][Math.floor(p.size) % 5];
      drawBalloon(p.x, p.y, p.size, p.color);
    }
    else if (themeType === 'midautumn') {
      p.color = '#f2b94b';
      ctx.save(); ctx.translate(p.x, p.y);
      ctx.shadowBlur = 15; ctx.shadowColor = '#f2b94b'; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    else if (themeType === 'national') {
      p.color = p.size > 20 ? '#ffd700' : '#e60000';
      drawStar(p.x, p.y, p.size, p.color);
    }
    else if (themeType === 'christmas') {
      drawSnowflake(p.x, p.y, p.size / 2);
    }
    else if (themeType === 'springfestival') {
      drawText(p.x, p.y, '🧧', p.size, '#e60000');
    }
    else if (themeType === 'halloween') {
      // 一半蝙蝠，一半南瓜
      if (p.size > 30 && pumpkinImg.complete && pumpkinImg.naturalWidth > 0) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = 0.7;
        ctx.drawImage(pumpkinImg, -p.size / 2, -p.size / 2, p.size, p.size); ctx.restore();
      } else {
        ctx.save(); ctx.translate(p.x, p.y);
        ctx.shadowBlur = 10; ctx.shadowColor = '#fff'; ctx.fillStyle = '#000'; ctx.strokeStyle = '#fff';
        ctx.fill(batPath); ctx.stroke(batPath); ctx.restore();
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach(function(p) {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.rotateSpeed;

      // 边界循环
      if (p.vy > 0 && p.y > h + 50) { p.y = -50; p.x = Math.random() * w; } // 下落的
      if (p.vy < 0 && p.y < -50) { p.y = h + 50; p.x = Math.random() * w; } // 上浮的
      if (p.x < -50) p.x = w + 50;
      if (p.x > w + 50) p.x = -50;

      drawParticle(p);
    });

    requestAnimationFrame(animate);
  }

  // 确保万圣节图片加载完后再开始渲染
  if (themeType === 'halloween') {
    pumpkinImg.onload = function() { animate(); };
  } else {
    animate();
  }

})();