/* ==================== 1. 侧边栏作者状态胶囊 ==================== */
function updateAuthorStatus() {
  const box = document.querySelector('.card-info .author-status');
  if (!box) return;
  const now = new Date(); 
  const h = now.getHours();
  
  // 调用 holidays.js 里的高级判断：自动识别法定节假日、调休和周末
  const isRest = typeof isRestDay === 'function' ? isRestDay(now) : (now.getDay() === 0 || now.getDay() === 6);
  
  let emoji = '', text = '';
  if (h >= 23 || h < 7) { emoji = '😴'; text = '睡觉中zzz'; }
  else if (isRest) { emoji = '🏖️'; text = '放假摸鱼中'; }
  else if (h >= 7 && h < 18) { emoji = '🐟'; text = '上班摸鱼中'; }
  else { emoji = '🎮'; text = '下班玩耍中'; }
  
  box.innerHTML = `${emoji} ${text}`;
}

/* ==================== 2. 节日表 & 通知特效 ==================== */
const FESTIVALS = [
  { id: 'halloween', m: 10, d: 31, title: '万圣节', msg: 'Trick or Treat! 不给糖就捣蛋🎃', type: 'warning', fire: true },
  { id: 'christmas', m: 12, d: 25, title: '圣诞节', msg: 'Merry Christmas! 圣诞快乐🎄', type: 'success', fire: true },
  { id: 'newyear', m: 1, d: 1, title: '元旦', msg: 'Happy New Year! 新年快乐🎉', type: 'success', fire: true },
  { id: 'valentine', m: 2, d: 14, title: '情人节', msg: 'Happy Valentine\'s Day! 情人节快乐❤️', type: 'info', fire: true },
  { id: 'aprilfool', m: 4, d: 1, title: '愚人节', msg: '今天你说的话，我连标点符号都不信。🤡', type: 'warning', fire: false }
];

function checkFestival() {
  const now = new Date();
  const m = now.getMonth() + 1, d = now.getDate();
  const hit = FESTIVALS.find(f => f.m === m && f.d === d);
  if (hit && !sessionStorage.getItem('festival_' + hit.id)) {
    sessionStorage.setItem('festival_' + hit.id, '1');
    if (typeof fomalNotify === 'function') {
      fomalNotify({ title: hit.title, message: hit.msg, type: hit.type, duration: 8000 });
    }
    if (hit.fire && typeof fomalCelebrate === 'function') {
      setTimeout(() => fomalCelebrate(), 500);
    }
  }
}

/* ==================== 3. 超级日历与倒计时 ==================== */
document.addEventListener('DOMContentLoaded', initWidgets);
document.addEventListener('pjax:complete', initWidgets);

function initWidgets() {
  var aside = document.getElementById("aside-content");
  if (!aside) return;
  var authorCard = document.querySelector(".card-widget.card-info");

  // 注入时间卡片
  if (!document.getElementById("widget-clock")) {
    var clockCard = document.createElement("div");
    clockCard.id = "widget-clock"; clockCard.className = "card-widget";
    clockCard.innerHTML = `
      <div class="widget-clock-row"><span class="widget-clock-label">协调世界时 (UTC)</span><span id="clock-utc" class="widget-clock-time">--:--:--</span></div>
      <div class="widget-clock-row"><span class="widget-clock-label">北京时间 (UTC+8)</span><span id="clock-bjt" class="widget-clock-time">--:--:--</span></div>`;
    if (authorCard) authorCard.after(clockCard); else aside.prepend(clockCard);
  }

  // 注入日历卡片
  if (!document.getElementById("widget-calendar")) {
    var calCard = document.createElement("div");
    calCard.id = "widget-calendar"; calCard.className = "card-widget";
    calCard.innerHTML = `
      <div class="cal-main">
        <div class="cal-left">
          <div class="cal-week">第<span id="cal-week">--</span>周 周<span id="cal-dow">-</span></div>
          <div class="cal-daynum" id="cal-day">--</div>
          <div class="cal-solar" id="cal-month">--月</div>
          <div class="cal-lunar" id="cal-lunar" style="color:var(--theme-color);font-weight:bold;">--</div>
        </div>
        <div class="cal-grid" id="cal-grid"></div>
      </div>
      <div class="cal-extra" id="cal-extra"></div>
    `;
    var clockEl = document.getElementById("widget-clock");
    if (clockEl) clockEl.after(calCard); else aside.prepend(calCard);
  }

  // 注入倒计时卡片
  if (!document.getElementById("widget-countdown")) {
    var cdCard = document.createElement("div");
    cdCard.id = "widget-countdown"; cdCard.className = "card-widget";
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
      </div>`;
    var calEl = document.getElementById("widget-calendar");
    if (calEl) calEl.after(cdCard); else aside.prepend(cdCard);
  }

  updateTime();
  if (window.clockTimer) clearInterval(window.clockTimer);
  window.clockTimer = setInterval(updateTime, 1000);
  updateDateInfo();
}

function updateTime() {
  var utcEl = document.getElementById('clock-utc'), bjtEl = document.getElementById('clock-bjt');
  if (!utcEl || !bjtEl) return;
  var now = new Date(), pad = n => n.toString().padStart(2, '0');
  utcEl.textContent = pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds());
  var bj = now.getUTCHours() + 8; if (bj >= 24) bj -= 24;
  bjtEl.textContent = pad(bj) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds());
}

function updateDateInfo() {
  var now = new Date();
  var year = now.getFullYear(), month = now.getMonth(), date = now.getDate(), day = now.getDay();
  
  if(document.getElementById('cal-week')) {
    var start = new Date(year, 0, 1);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000);
    var week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
    document.getElementById('cal-week').textContent = week;
    document.getElementById('cal-dow').textContent = ['日','一','二','三','四','五','六'][day];
    document.getElementById('cal-day').textContent = date;
    document.getElementById('cal-month').textContent = (month + 1) + '月';

    // 调用 lunar.js 获取农历和节气
    if (typeof solar2lunar === 'function') {
      var lu = solar2lunar(year, month + 1, date);
      if (lu) {
        document.getElementById('cal-lunar').textContent = lu.gzYear + lu.Animal + '年 ' + lu.IMonthCn + lu.IDayCn;
        if (lu.isTerm) document.getElementById('cal-extra').innerHTML = '🌟 今天是 <b>' + lu.Term + '</b>';
        else document.getElementById('cal-extra').innerHTML = '';
      }
    }

    var calGrid = document.getElementById('cal-grid');
    if (calGrid && !calGrid.innerHTML) {
      var html = '';
      ['日','一','二','三','四','五','六'].forEach(d => html += `<div class="cal-hd">${d}</div>`);
      var firstDay = new Date(year, month, 1).getDay();
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      for (var i = 0; i < firstDay; i++) html += '<div></div>';
      for (var i = 1; i <= daysInMonth; i++) html += `<div class="cal-cell ${i===date?'is-today':''}">${i}</div>`;
      calGrid.innerHTML = html;
    }
  }

  if (document.getElementById('cd-days')) {
    var targetDate = new Date("2027-02-06T00:00:00");
    document.getElementById('cd-days').textContent = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
    var yS=new Date(year,0,1), yE=new Date(year+1,0,1), mS=new Date(year,month,1), mE=new Date(year,month+1,1), wS=new Date(now);
    wS.setDate(date-day); wS.setHours(0,0,0,0);
    var yP=((now-yS)/(yE-yS)*100).toFixed(1), mP=((now-mS)/(mE-mS)*100).toFixed(1), wP=((now-wS)/(7*86400000)*100).toFixed(1);
    document.getElementById('cd-year-fill').style.width = yP + '%'; document.getElementById('cd-year-txt').textContent = yP + '%';
    document.getElementById('cd-month-fill').style.width = mP + '%'; document.getElementById('cd-month-txt').textContent = mP + '%';
    document.getElementById('cd-week-fill').style.width = wP + '%'; document.getElementById('cd-week-txt').textContent = wP + '%';
  }
}

// 启动附加功能
document.addEventListener('DOMContentLoaded', () => {
  updateAuthorStatus();
  checkFestival();
  const cardInfo = document.querySelector('.card-info .author-info-name');
  if (cardInfo && !document.querySelector('.author-status')) {
    const status = document.createElement('div');
    status.className = 'author-status';
    cardInfo.after(status);
    updateAuthorStatus();
  }
});