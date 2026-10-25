document.addEventListener('DOMContentLoaded', initClockCard);
document.addEventListener('pjax:complete', initClockCard);

function initClockCard() {
  var aside = document.getElementById("aside-content");
  if (!aside) return;

  // 如果已经存在了就不重复创建
  if (document.getElementById("custom-clock-card")) return;

  var card = document.createElement("div");
  card.id = "custom-clock-card";
  card.className = "card-widget";
  
  // 移除了底部的日期 div，修改了中文字段
  card.innerHTML = `
    <div class="item-headline"><i class="fas fa-clock"></i><span>时间</span></div>
    <div class="card-content">
      <div class="clock-row">
        <span class="clock-label">协调世界时 (UTC)</span>
        <span id="clock-utc" class="clock-time">--:--:--</span>
      </div>
      <div class="clock-row">
        <span class="clock-label">北京时间 (UTC+8)</span>
        <span id="clock-bjt" class="clock-time">--:--:--</span>
      </div>
    </div>
  `;

  // 关键修复：Butterfly 主题的作者卡片类名通常是 .card-info
  // 我们直接找作者卡片，插在它后面。如果找不到，再退而求其次插在公告前面。
  var authorCard = document.querySelector(".card-widget.card-info");
  var announcementCard = document.querySelector(".card-widget.card-announcement");
  
  if (authorCard) {
    authorCard.after(card);
  } else if (announcementCard) {
    announcementCard.before(card);
  } else {
    aside.prepend(card);
  }

  // 启动时间更新
  updateClockTime();
  if (window.clockTimer) clearInterval(window.clockTimer);
  window.clockTimer = setInterval(updateClockTime, 1000);
}

function updateClockTime() {
  var utcEl = document.getElementById('clock-utc');
  var bjtEl = document.getElementById('clock-bjt');
  if (!utcEl || !bjtEl) return;

  var now = new Date();
  var pad = function(n) { return n.toString().padStart(2, '0'); };

  // UTC 时间
  utcEl.textContent = pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds());

  // 北京时间 (UTC+8)
  var bjHours = now.getUTCHours() + 8;
  if (bjHours >= 24) bjHours -= 24;
  bjtEl.textContent = pad(bjHours) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds());
}