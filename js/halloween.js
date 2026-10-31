(function() {
  'use strict';

  // 移动端不加载，防止卡顿
  if (window.innerWidth <= 768) return;

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99;';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  
  var w, h, bats = [], pumpkins = [];
  var pumpkinImg = new Image();
  pumpkinImg.src = '/img/pumpkin.png'; // 你的本地南瓜灯路径
  
  function resize() { 
    w = canvas.width = window.innerWidth; 
    h = canvas.height = window.innerHeight; 
  }
  window.addEventListener('resize', resize); resize();

  // 使用 Path2D 绘制精细的蝙蝠轮廓
  const batPath = new Path2D(`
    M 0,-12
    Q -5,-20 -8,-12
    C -15,-18 -25,-18 -28,-5
    C -20,-5 -22,8 -12,10
    Q -8,5 -6,15
    Q 0,20 6,15
    Q 8,5 12,10
    C 22,8 20,-5 28,-5
    C 25,-18 15,-18 8,-12
    Q 5,-20 0,-12 Z
  `);

  // 初始化 12 只蝙蝠
  for (var i = 0; i < 12; i++) {
    bats.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.5, 
      vy: Math.random() * 1.5 + 0.8,   
      angle: Math.random() * Math.PI,
      size: Math.random() * 0.4 + 0.8  
    });
  }

  // 初始化 6 个南瓜灯
  for (var j = 0; j < 6; j++) {
    pumpkins.push({
      x: Math.random() * w,
      y: Math.random() * h, // 初始随机分布
      vy: Math.random() * 0.8 + 0.5, // 上浮速度
      size: Math.random() * 40 + 40, // 40px 到 80px
      angle: Math.random() * Math.PI * 2,
      rotateSpeed: (Math.random() - 0.5) * 0.02, // 旋转速度
      swingSpeed: Math.random() * 0.002 + 0.001, // 左右摇摆频率
      phase: Math.random() * Math.PI * 2, // 摇摆相位
      opacity: Math.random() * 0.4 + 0.4 // 0.4 到 0.8 的透明度
    });
  }

  function drawBat(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    ctx.scale(b.size, b.size); 
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1;

    ctx.fill(batPath);
    ctx.stroke(batPath);
    ctx.restore();
  }

  function drawPumpkin(p) {
    // 如果图片还没加载完，先不画
    if (!pumpkinImg.complete || pumpkinImg.naturalWidth === 0) return;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    
    ctx.globalAlpha = p.opacity;
    
    // 绘制南瓜（居中）
    ctx.drawImage(pumpkinImg, -p.size / 2, -p.size / 2, p.size, p.size);
    
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    // 1. 更新并绘制蝙蝠（下坠）
    bats.forEach(function(b) {
      b.x += b.vx;
      b.y += b.vy;
      b.angle = Math.sin(Date.now() * 0.003 + b.y * 0.01) * 0.4; 
      
      if (b.y > h + 40) { b.y = -40; b.x = Math.random() * w; }
      if (b.x < -40) b.x = w + 40;
      if (b.x > w + 40) b.x = -40;
      
      drawBat(b);
    });

    // 2. 更新并绘制南瓜灯（上浮）
    pumpkins.forEach(function(p) {
      p.y -= p.vy; // 向上飘
      p.angle += p.rotateSpeed; // 自转
      
      // 左右摇摆 (利用正弦波让 x 轴产生偏移)
      p.x += Math.sin(Date.now() * p.swingSpeed + p.phase) * 0.5; 
      
      // 飘出屏幕顶部后，重置到屏幕底部
      if (p.y < -p.size) {
        p.y = h + p.size;
        p.x = Math.random() * w;
      }
      
      drawPumpkin(p);
    });

    requestAnimationFrame(animate);
  }
  
  animate();
})();