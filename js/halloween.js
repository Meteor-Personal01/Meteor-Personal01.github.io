(function() {
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99;';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var w, h, bats = [];
  
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  // 绘制带白光的蝙蝠
  function drawBat(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    
    // 核心修改：放大 1.8 倍
    ctx.scale(1.8, 1.8); 
    
    // 核心修改：开启白色发光特效
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    
    // 黑色实体填充
    ctx.fillStyle = '#000000';
    // 白色描边
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    // 简易蝙蝠轮廓
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-10, -5, -15, 5);
    ctx.quadraticCurveTo(-5, 5, 0, 0);
    ctx.quadraticCurveTo(5, 5, 15, 5);
    ctx.quadraticCurveTo(10, -5, 0, 0);
    
    ctx.fill();
    ctx.stroke(); // 执行描边，让白光更明显
    ctx.restore();
  }

  // 因为蝙蝠变大了，稍微减少一点数量，防止太密集
  for (var i = 0; i < 12; i++) {
    bats.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.5, // 稍微放慢一点水平速度
      vy: Math.random() * 1.5 + 0.8,   // 稍微放慢一点下落速度
      angle: Math.random() * Math.PI
    });
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    bats.forEach(function(b) {
      b.x += b.vx;
      b.y += b.vy;
      // 扇动翅膀的动画
      b.angle = Math.sin(Date.now() * 0.002 + b.y * 0.01) * 0.3; 
      
      if (b.y > h + 40) { b.y = -40; b.x = Math.random() * w; }
      if (b.x < -40) b.x = w + 40;
      if (b.x > w + 40) b.x = -40;
      
      drawBat(b);
    });
    requestAnimationFrame(animate);
  }
  animate();
})();