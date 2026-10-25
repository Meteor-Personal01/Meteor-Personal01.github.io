(function() {
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99;';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var w, h, bats = [];
  
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  // 小蝙蝠的绘制逻辑 (纯黑剪影)
  function drawBat(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    // 简易蝙蝠轮廓
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-10, -5, -15, 5);
    ctx.quadraticCurveTo(-5, 5, 0, 0);
    ctx.quadraticCurveTo(5, 5, 15, 5);
    ctx.quadraticCurveTo(10, -5, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  for (var i = 0; i < 15; i++) {
    bats.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1,
      angle: Math.random() * Math.PI,
      speed: Math.random() * 0.05
    });
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    bats.forEach(function(b) {
      b.x += b.vx;
      b.y += b.vy;
      b.angle = Math.sin(Date.now() * 0.002 + b.y * 0.01) * 0.3; // 扇动翅膀
      if (b.y > h + 20) { b.y = -20; b.x = Math.random() * w; }
      if (b.x < -20) b.x = w + 20;
      if (b.x > w + 20) b.x = -20;
      drawBat(b);
    });
    requestAnimationFrame(animate);
  }
  animate();
})();