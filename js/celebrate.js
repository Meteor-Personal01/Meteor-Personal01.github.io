(function (global) {
  'use strict';
  var Z = 9998, ROCKETS = 8, SPLASH = 104, TOTAL = 7600, GRAVITY = 900, DEFAULT_COLORS = ['#ffd166', '#ff6b6b', '#4dabf7', '#b197fc', '#69db7c', '#ffa94d'];
  function motionOff() { try { return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
  function fire(opt) {
    if (motionOff() || typeof document === 'undefined') return;
    var body = document.body || document.documentElement;
    var colors = (opt && opt.colors) ? opt.colors : DEFAULT_COLORS;
    var cv = document.createElement('canvas'); cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:' + Z; body.appendChild(cv);
    var ctx = cv.getContext('2d'); var W, H;
    function resize() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * 2; cv.height = H * 2; ctx.scale(2, 2); ctx.globalCompositeOperation = 'lighter'; }
    resize(); window.addEventListener('resize', resize);
    var parts = [], rockets = [], start = Date.now();
    function pick() { return colors[(Math.random() * colors.length) | 0]; }
    for (var i = 0; i < ROCKETS; i++) { rockets.push({ at: 100 + i * 500 + Math.random() * 300, x: W * (0.16 + Math.random() * 0.68), y: H + 6, vx: (Math.random() - 0.5) * W * 0.06, vy: -(H * (0.8 + Math.random() * 0.3)), color: pick() }); }
    function burst(x, y, color) { for (var n = 0; n < SPLASH; n++) { var a = Math.random() * Math.PI * 2, sp = H * (0.16 + Math.random() * 0.5); parts.push({ x: x, y: y, px: x, py: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.5 + Math.random() * 0.9, max: 2.4, w: 2, color: color }); } }
    function frame() {
      var now = Date.now(); var el = now - start; ctx.clearRect(0, 0, W, H);
      for (var i = rockets.length - 1; i >= 0; i--) {
        var r = rockets[i]; if (el < r.at) continue; r.vy += GRAVITY * 0.016; r.x += r.vx * 0.016; r.y += r.vy * 0.016;
        ctx.strokeStyle = r.color; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - r.vx * 0.03, r.y - r.vy * 0.03); ctx.stroke();
        if (r.vy >= 0 || r.y <= H * 0.16) { burst(r.x, r.y, r.color); rockets.splice(i, 1); }
      }
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i]; p.life -= 0.016; if (p.life <= 0) { parts.splice(i, 1); continue; }
        p.px = p.x; p.py = p.y; p.vx *= 0.98; p.vy = p.vy * 0.98 + GRAVITY * 0.36 * 0.016; p.x += p.vx * 0.016; p.y += p.vy * 0.016;
        ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.strokeStyle = p.color; ctx.lineWidth = p.w; ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      if (el < TOTAL && (parts.length || rockets.length)) requestAnimationFrame(frame);
      else { cv.remove(); window.removeEventListener('resize', resize); }
    }
    requestAnimationFrame(frame);
  }
  global.fomalCelebrate = fire;
})(window);