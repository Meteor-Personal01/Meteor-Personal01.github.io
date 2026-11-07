document.addEventListener('DOMContentLoaded', initWidgets);
document.addEventListener('pjax:complete', initWidgets);

function initWidgets() {
  var aside = document.getElementById("aside-content");
  if (!aside) return;
  var authorCard = document.querySelector(".card-widget.card-info");

  if (!document.getElementById("widget-clock")) {
    var clockCard = document.createElement("div");
    clockCard.id = "widget-clock";
    clockCard.className = "card-widget";
    clockCard.innerHTML = `
      <div class="widget-clock-row">
        <span class="widget-clock-label">协调世界时 (UTC)</span>
        <span id="clock-utc" class="widget-clock-time">--:--:--</span>
      </div>
      <div class="widget-clock-row">
        <span class="widget-clock-label">北京时间 (UTC+8)</span>
        <span id="clock-bjt" class="widget-clock-time">--:--:--</span>
      </div>
      <div class="widget-clock-row" id="widget-local-row">
        <span class="widget-clock-label" id="clock-local-label">你的时间</span>
        <span id="clock-local" class="widget-clock-time" style="color:var(--theme-color);">--:--:--</span>
      </div>
    `;
    if (authorCard) authorCard.after(clockCard); else aside.prepend(clockCard);
  }

  if (!document.getElementById("widget-calendar")) {
    var calCard = document.createElement("div");
    calCard.id = "widget-calendar";
    calCard.className = "card-widget";
    calCard.innerHTML = `
      <div class="cal-main">
        <div class="cal-left">
          <div class="cal-week">第<span id="cal-week">--</span>周 周<span id="cal-dow">-</span></div>
          <div class="cal-daynum" id="cal-day">--</div>
          <div class="cal-solar" id="cal-month">--月</div>
          <div class="cal-lunar">日常打卡</div>
        </div>
        <div class="cal-grid" id="cal-grid"></div>
      </div>
    `;
    var clockEl = document.getElementById("widget-clock");
    if (clockEl) clockEl.after(calCard); else aside.prepend(calCard);
  }

  if (!document.getElementById("widget-countdown")) {
    var cdCard = document.createElement("div");
    cdCard.id = "widget-countdown";
    cdCard.className = "card-widget";
    cdCard.innerHTML = `
      <div class="cd-wrapper">
        <div class="cd-left">
          <div class="cd-title">距离春节</div>
          <div class="cd-num" id="cd-days">--</div>
        </div>
        <div class="cd-right">
          <div class="cd-row"><span class="cd-label">本年</span><div class="cd-bar"><div id="cd-year-fill" class="cd-bar-fill"></div><span id="cd-year-txt" class="cd-bar-text">--</span></div></div>
          <div class="cd-row"><span class="cd-label">本月</span><div class="cd-bar"><div id="cd-month-fill" class="cd-bar-fill"></div><span id="cd-month-txt" class="cd-bar-text">--</span></div></div>
          <div class="cd-row"><span class="cd-label">本周</span><div class="cd-bar"><div id="cd-week-fill" class="cd-bar-fill"></div><span id="cd-week-txt" class="cd-bar-text">--</span></div></div>
        </div>
      </div>
    `;
    var calEl = document.getElementById("widget-calendar");
    if (calEl) calEl.after(cdCard); else aside.prepend(cdCard);
  }

  updateWidgets();
  
  if (window.clockTimer) clearInterval(window.clockTimer);
  window.clockTimer = setInterval(updateTime, 1000);

  if (window.calTimer) clearInterval(window.calTimer);
  window.calTimer = setInterval(updateWidgets, 60000);
}

// 安全获取时间的统一方法
function getSafeNow() {
  var offset = window.networkTimeOffset;
  if (typeof offset !== 'number' || isNaN(offset)) offset = 0;
  var now = new Date(Date.now() + offset);
  if (isNaN(now.getTime())) now = new Date();
  return now;
}

window.updateSidebarTime = function() {
  var utcEl = document.getElementById('clock-utc');
  var bjtEl = document.getElementById('clock-bjt');
  var localEl = document.getElementById('clock-local');
  var localLabel = document.getElementById('clock-local-label');
  
  if (!utcEl || !bjtEl) return;

  try {
    var now = getSafeNow();
    var pad = n => n.toString().padStart(2, '0');
    
    // 1. 协调世界时
    utcEl.textContent = pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds());
    
    // 2. 北京时间
    var bjHours = now.getUTCHours() + 8;
    if (bjHours >= 24) bjHours -= 24;
    bjtEl.textContent = pad(bjHours) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds());

    // 3. 你的时间
    if (localEl && localLabel) {
      var tz = window.visitorTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      try {
        // 使用现代 API，绝对安全的获取 UTC+X
        var formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
        var parts = formatter.formatToParts(now);
        var offsetStr = 'UTC';
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].type === 'timeZoneName') {
            offsetStr = parts[i].value.replace('GMT', 'UTC');
            break;
          }
        }
        
        localLabel.textContent = `你的时间 (${offsetStr})`;
        localEl.textContent = now.toLocaleTimeString('zh-CN', { timeZone: tz, hour12: false });
      } catch (e) {
        // 降级方案，绝不卡死
        localLabel.textContent = `你的时间`;
        localEl.textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
      }
    }
  } catch(err) {
    console.error("时间更新异常", err);
  }
};

function updateTime() {
  window.updateSidebarTime();
}

// 更新日历和倒计时
function updateWidgets() {
  var now = getSafeNow();
  var year = now.getFullYear(), month = now.getMonth(), date = now.getDate(), day = now.getDay();

  if(document.getElementById('cal-week')) {
    var start = new Date(year, 0, 1);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000);
    var week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
    
    document.getElementById('cal-week').textContent = week;
    document.getElementById('cal-dow').textContent = ['日','一','二','三','四','五','六'][day];
    document.getElementById('cal-day').textContent = date;
    document.getElementById('cal-month').textContent = (month + 1) + '月';

    var calGrid = document.getElementById('cal-grid');
    if (calGrid && !calGrid.innerHTML) {
      var html = '';
      ['日','一','二','三','四','五','六'].forEach(d => html += `<div class="cal-hd">${d}</div>`);
      var firstDay = new Date(year, month, 1).getDay();
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      for (var i = 0; i < firstDay; i++) html += '<div></div>';
      for (var i = 1; i <= daysInMonth; i++) {
        html += `<div class="cal-cell ${i===date?'is-today':''}">${i}</div>`;
      }
      calGrid.innerHTML = html;
    }
  }

  if (document.getElementById('cd-days')) {
    var targetDate = new Date("2027-02-06T00:00:00");
    var diff = targetDate - now;
    document.getElementById('cd-days').textContent = Math.ceil(diff / (1000 * 60 * 60 * 24));

    var yStart = new Date(year, 0, 1), yEnd = new Date(year + 1, 0, 1);
    var mStart = new Date(year, month, 1), mEnd = new Date(year, month + 1, 1);
    var wStart = new Date(now); wStart.setDate(date - day); wStart.setHours(0,0,0,0);

    var yPct = ((now - yStart) / (yEnd - yStart) * 100).toFixed(1);
    var mPct = ((now - mStart) / (mEnd - mStart) * 100).toFixed(1);
    var wPct = ((now - wStart) / (7 * 86400000) * 100).toFixed(1);

    document.getElementById('cd-year-fill').style.width = yPct + '%';
    document.getElementById('cd-year-txt').textContent = yPct + '%';
    document.getElementById('cd-month-fill').style.width = mPct + '%';
    document.getElementById('cd-month-txt').textContent = mPct + '%';
    document.getElementById('cd-week-fill').style.width = wPct + '%';
    document.getElementById('cd-week-txt').textContent = wPct + '%';
  }
}