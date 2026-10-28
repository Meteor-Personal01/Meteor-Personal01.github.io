(function() {
  var fpsEle = document.createElement('div');
  fpsEle.id = 'fps';
  fpsEle.innerHTML = 'FPS: <span style="color:#3fb950">60</span> · 流畅';
  document.body.appendChild(fpsEle);

  var lastTime = performance.now(), frames = 0, lastFpsTime = lastTime;
  function loop() {
    var now = performance.now();
    frames++;
    if (now - lastFpsTime >= 1000) {
      var fps = Math.round((frames * 1000) / (now - lastFpsTime));
      var color = fps > 50 ? '#3fb950' : (fps > 30 ? '#d29922' : '#f85149');
      var text = fps > 50 ? '流畅' : (fps > 30 ? '一般' : '卡顿');
      fpsEle.innerHTML = 'FPS: <span style="color:' + color + '">' + fps + '</span> · ' + text;
      frames = 0;
      lastFpsTime = now;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();