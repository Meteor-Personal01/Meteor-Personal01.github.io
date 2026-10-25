document.addEventListener('DOMContentLoaded', initWidgets);
document.addEventListener('pjax:complete', initWidgets);

function initWidgets() {
  var aside = document.getElementById("aside-content");
  if (!aside) return;

  var authorCard = document.querySelector(".card-widget.card-info");

  // ==========================================
  // 卡片 1：时间卡片
  // ==========================================
  if (!document.getElementById("widget-clock")) {
    var clockCard = document.createElement("div");
    clockCard.id = "widget-clock";
    clockCard.className = "card-widget";
    clockCard.innerHTML = `
      <div class="item-headline"><i class="fas fa-clock"></i><span>时间</span></div>
      <div class="card-content" style="padding: 10px 15px;">
        <div class="widget-clock-row">
          <span class="widget-clock-label">协调世界时 (UTC)</span>
          <span id="clock-utc" class="widget-clock-time">--:--:--</span>
        </div>
        <div class="widget-clock-row">
          <span class="widget-clock-label">北京时间 (UTC+8)</span>
          <span id="clock-bjt" class="widget-clock-time">--:--:--</span>
        </div>
      </div>
    `;
    if (authorCard) authorCard.after(clockCard);
    else aside.prepend(clockCard);
  }

  // ==========================================
  // 卡片 2：日历卡片 (去掉大字，左侧文字分行)
  // ==========================================
  if (!document.getElementById("widget-calendar")) {
    var calCard = document.createElement("div");
    calCard.id = "widget-calendar";
    calCard.className = "card-widget";
    calCard.innerHTML = `
      <div class="card-content" style="padding: 15px; display: flex; justify-content: space-between;">
        
        <!-- 左侧：信息 -->
        <div style="display: flex; flex-direction: column; width: 42%; justify-content: flex-start;">
          
          <!-- 周数 -->
          <div style="font-size: 14px; font-weight: bold; color: #c9d1d9; margin-bottom: 12px;">
            第<span id="cal-week-num">--</span>周 <span id="cal-day-of-week">周--</span>
          </div>
          
          <!-- 年月 -->
          <div style="font-size: 12px; color: #8b949e; margin-bottom: 4px;">
            <span id="cal-year-month">--年--月</span>
          </div>
          
          <!-- 第几天 -->
          <div style="font-size: 12px; color: #8b949e; margin-bottom: 12px;">
            第<span id="cal-day-of-year">--</span>天
          </div>
          
          <!-- 农历信息 -->
          <div style="font-size: 12px; color: #8b949e; opacity: 0.7; line-height: 1.6;">
            丙午马年<br>农历九月十六
          </div>
          
        </div>

        <!-- 右侧：日历网格 -->
        <div style="width: 55%;" id="cal-grid"></div>
        
      </div>
    `;
    var clockEl = document.getElementById("widget-clock");
    if (clockEl) clockEl.after(calCard);
    else if (authorCard) authorCard.after(calCard);
    else aside.prepend(calCard);
  }

  // ==========================================
  // 卡片 3：倒计时卡片 (左右结构)
  // ==========================================
  if (!document.getElementById("widget-countdown")) {
    var cdCard = document.createElement("div");
    cdCard.id = "widget-countdown";
    cdCard.className = "card-widget";
    cdCard.innerHTML = `
      <div class="item-headline"><i class="fas fa-hourglass-half"></i><span>倒计时</span></div>
      <div class="card-content" style="padding: 10px 15px; display: flex; justify-content: space-between; align-items: stretch;">
        
        <!-- 左侧：天数 -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 38%; border-right: 1px dashed #30363d; padding-right: 10px;">
          <div style="font-size: 12px; color: #8b949e; margin-bottom: 2px;">距离春节</div>
          <div style="font-size: 26px; font-weight: bold; color: #e6edf3; line-height: 1;"><span id="cd-days-num">--</span></div>
          <div style="font-size: 11px; color: #8b949e; margin-top: 4px;">2027-02-06</div>
        </div>

        <!-- 右侧：进度条 -->
        <div style="display: flex; flex-direction: column; justify-content: center; width: 58%; gap: 6px; padding-left: 10px;">
          <div style="display: flex; align-items: center; font-size: 11px;">
            <span style="width: 24px; color: #8b949e;">本年</span>
            <span style="flex-grow: 1; height: 6px; background: #30363d; border-radius: 3px; margin: 0 6px; overflow: hidden;">
              <span id="cd-year-bar" style="display: block; height: 100%; background: #58a6ff; border-radius: 3px;"></span>
            </span>
            <span id="cd-year-text" style="width: 36px; text-align: right; color: #8b949e;">--</span>
          </div>
          <div style="display: flex; align-items: center; font-size: 11px;">
            <span style="width: 24px; color: #8b949e;">本月</span>
            <span style="flex-grow: 1; height: 6px; background: #30363d; border-radius: 3px; margin: 0 6px; overflow: hidden;">
              <span id="cd-month-bar" style="display: block; height: 100%; background: #58a6ff; border-radius: 3px;"></span>
            </span>
            <span id="cd-month-text" style="width: 36px; text-align: right; color: #8b949e;">--</span>
          </div>
          <div style="display: flex; align-items: center; font-size: 11px;">
            <span style="width: 24px; color: #8b949e;">本周</span>
            <span style="flex-grow: 1; height: 6px; background: #30363d; border-radius: 3px; margin: 0 6px; overflow: hidden;">
              <span id="cd-week-bar" style="display: block; height: 100%; background: #58a6ff; border-radius: 3px;"></span>
            </span>
            <span id="cd-week-text" style="width: 36px; text-align: right; color: #8b949e;">--</span>
          </div>
        </div>

      </div>
    `;
    var calEl = document.getElementById("widget-calendar");
    if (calEl) calEl.after(cdCard);
    else if (authorCard) authorCard.after(cdCard);
    else aside.prepend(cdCard);
  }

  updateWidgets();
  if (window.widgetTimer) clearInterval(window.widgetTimer);
  window.widgetTimer = setInterval(updateWidgets, 1000);
}

function updateWidgets() {
  var now = new Date();
  var pad = function(n) { return n.toString().padStart(2, '0'); };

  // 1. 更新时钟
  var utcEl = document.getElementById('clock-utc');
  var bjtEl = document.getElementById('clock-bjt');
  if (utcEl && bjtEl) {
    utcEl.textContent = pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds());
    var bjHours = now.getUTCHours() + 8;
    if (bjHours >= 24) bjHours -= 24;
    bjtEl.textContent = pad(bjHours) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds());
  }

  // 2. 更新日历
  var calGrid = document.getElementById('cal-grid');
  if (calGrid && !calGrid.innerHTML) {
    var year = now.getFullYear(), month = now.getMonth() + 1, date = now.getDate();
    var firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    document.getElementById('cal-week-num').textContent = Math.ceil((((now - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
    document.getElementById('cal-day-of-week').textContent = "周" + ["日","一","二","三","四","五","六"][now.getDay()];
    document.getElementById('cal-year-month').textContent = year + "年" + month + "月";
    
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    document.getElementById('cal-day-of-year').textContent = Math.floor(diff / oneDay);

    // 右侧网格
    var html = '<div style="display: flex; flex-wrap: wrap; text-align: center; font-size: 11px;">';
    ['日','一','二','三','四','五','六'].forEach(d => { 
      html += `<div style="width: 14.28%; color: #8b949e; margin-bottom: 4px;">${d}</div>`; 
    });
    for (var i = 0; i < firstDay; i++) {
      html += '<div style="width: 14.28%; padding: 2px 0;"></div>';
    }
    for (var i = 1; i <= daysInMonth; i++) {
      var isToday = i === date;
      var style = isToday 
        ? 'background:#58a6ff; color:#fff; font-weight:bold; border-radius: 50%;' 
        : 'color: #c9d1d9;';
      html += `<div style="width: 14.28%; padding: 2px 0; display: flex; justify-content: center;"><span style="display: inline-block; width: 18px; height: 18px; line-height: 18px; ${style}">${i}</span></div>`;
    }
    html += '</div>';
    calGrid.innerHTML = html;
  }

  // 3. 更新倒计时
  if (document.getElementById('cd-days-num')) {
    var targetDate = new Date("2027-02-06T00:00:00");
    var diff = targetDate - now;
    document.getElementById('cd-days-num').textContent = Math.ceil(diff / (1000 * 60 * 60 * 24));

    var startOfYear = new Date(now.getFullYear(), 0, 1);
    var endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    var yearPct = ((now - startOfYear) / (endOfYear - startOfYear) * 100).toFixed(2);
    
    var startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    var endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    var monthPct = ((now - startOfMonth) / (endOfMonth - startOfMonth) * 100).toFixed(2);
    
    var weekPct = ((now.getDay() === 0 ? 7 : now.getDay()) / 7 * 100).toFixed(2);

    document.getElementById('cd-year-bar').style.width = yearPct + '%';
    document.getElementById('cd-year-text').textContent = yearPct + '%';
    
    document.getElementById('cd-month-bar').style.width = monthPct + '%';
    document.getElementById('cd-month-text').textContent = monthPct + '%';
    
    document.getElementById('cd-week-bar').style.width = weekPct + '%';
    document.getElementById('cd-week-text').textContent = weekPct + '%';
  }
}