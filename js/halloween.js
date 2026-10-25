(function() {
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99;';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var w, h, bats = [];
  
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  // 使用 Path2D 绘制精细的蝙蝠轮廓
  // 包含：尖耳朵、圆润的躯干、以及翅膀下边缘的波浪形褶皱
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

  function drawBat(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    
    // 调整大小（因为新的路径坐标范围更宽，所以缩放系数改小一点）
    ctx.scale(b.size, b.size); 
    
    // 发光特效：白色光晕
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    
    // 蝙蝠主体：纯黑填充
    ctx.fillStyle = '#000000';
    // 边缘描边：白色半透明，增强轮廓
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1;

    ctx.fill(batPath);
    ctx.stroke(batPath);
    
    ctx.restore();
  }

  for (var i = 0; i < 12; i++) {
    bats.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.5, // 水平飘动
      vy: Math.random() * 1.5 + 0.8,   // 垂直下落
      angle: Math.random() * Math.PI,
      size: Math.random() * 0.4 + 0.8  // 随机大小缩放 (0.8 到 1.2 倍)
    });
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    bats.forEach(function(b) {
      b.x += b.vx;
      b.y += b.vy;
      
      // 扇动翅膀的动画（基于正弦波改变旋转角度）
      b.angle = Math.sin(Date.now() * 0.003 + b.y * 0.01) * 0.4; 
      
      // 边界循环
      if (b.y > h + 40) { b.y = -40; b.x = Math.random() * w; }
      if (b.x < -40) b.x = w + 40;
      if (b.x > w + 40) b.x = -40;
      
      drawBat(b);
    });
    requestAnimationFrame(animate);
  }
  animate();
})();