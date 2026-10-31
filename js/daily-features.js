/* ==================== 0. 公祭日 / 伟人祭日变灰与提示 ==================== */
(function() {
  // 获取今天的日期
  var d = new Date();
  // 补齐两位数，确保格式是 '09-09' 而不是 '9-9'
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  var dateStr = m + '-' + dd;

  // 定义需要变灰的日子及对应的提示文案
  var grayDays = {
    '12-13': { title: '国家公祭日', message: '铭记历史，缅怀先烈，悼念南京大屠杀死难同胞。' },
    '09-18': { title: '九一八事变', message: '勿忘国耻，吾辈自强。' },
    '05-12': { title: '汶川地震纪念日', message: '缅怀逝者，致敬重生。' },
    '09-09': { title: '毛泽东逝世纪念日', message: '吃水不忘挖井人，缅怀伟大领袖毛主席。' },
    '05-05': { title: '拿破仑逝世纪念日', message: '一代军事奇才，长眠于塞纳河畔。' },
    '10-31': { title: '测试', message: '测试测试测试' } // 👈 记得测试完把这一行删掉
  };

  // 检查今天是否在列表中
  if (grayDays[dateStr]) {
    var info = grayDays[dateStr];

    // 1. 网页变灰逻辑
    var html = document.documentElement;
    html.style.transition = 'filter 1.5s ease';
    html.style.filter = 'grayscale(80%)'; 

    // 2. 弹窗提示逻辑（利用 sessionStorage 保证本次访问只弹一次）
    var storageKey = 'grayDayShown_' + dateStr;
    if (!sessionStorage.getItem(storageKey)) {
      setTimeout(function() {
        if (typeof fomalNotify === 'function') {
          fomalNotify({
            type: 'info',
            title: info.title,
            message: info.message,
            duration: 6000, 
            offset: 80      
          });
          sessionStorage.setItem(storageKey, '1');
        }
      }, 1500);
    }
  }
})();

/* ==================== 1. 侧边栏作者状态胶囊 ==================== */
function updateAuthorStatus() {
  const box = document.querySelector('.card-info .author-status');
  if (!box) return;
  
  const now = new Date(); 
  const h = now.getHours();
  const day = now.getDay(); // 0是周日，1-6是周一到周六
  
  const isRest = typeof isRestDay === 'function' ? isRestDay(now) : (day === 0 || day === 6);
  
  let emoji = '', text = '';

  if (h >= 23 || h < 6) { 
    emoji = '😴'; text = '深度睡眠中zzz'; 
  } else if (day === 0 && h >= 17 && h < 22) { 
    emoji = '📚'; text = '上课无聊中'; 
  } else if (isRest) { 
    emoji = '🎮'; text = '放假休息中'; 
  } else {
    if ((h >= 6 && h < 12) || (h >= 14 && h < 22)) { 
      emoji = '📚'; text = '上课无聊中'; 
    } else if (h >= 12 && h < 14) { 
      emoji = '🍜'; text = '回家吃饭休整中'; 
    } else if (h >= 22 && h < 23) { 
      emoji = '🚶'; text = '下课玩耍中'; 
    }
  }

  box.innerHTML = `<span class="st-emoji">${emoji}</span><span class="st-text"> ${text}</span>`;
}

/* ==================== 2. 节日表 & 通知特效 ==================== */
const FESTIVALS = [
  { id: 'halloween', m: 10, d: 31, title: '万圣节', msg: 'TRICKS AND TREATS APLENTY 给一堆糖，捣好多蛋🎃', type: 'warning', fire: true },
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
      fomalNotify({ title: hit.title, message: hit.msg, type: hit.type, duration: 8000, offset: 80 }); // 👈 加个 offset 往下移
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
  
  // 安全获取元素的方法
  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  function setWidth(id, width) {
    var el = document.getElementById(id);
    if (el) el.style.width = width;
  }

  if(document.getElementById('cal-week')) {
    var start = new Date(year, 0, 1);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000);
    var week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
    setText('cal-week', week);
    setText('cal-dow', ['日','一','二','三','四','五','六'][day]);
    setText('cal-day', date);
    setText('cal-month', (month + 1) + '月');

    // 调用 lunar.js 获取农历和节气
    if (typeof solar2lunar === 'function') {
      var lu = solar2lunar(year, month + 1, date);
      if (lu) {
        setText('cal-lunar', lu.gzYear + lu.Animal + '年 ' + lu.IMonthCn + lu.IDayCn);
        var extra = document.getElementById('cal-extra');
        if (extra) extra.innerHTML = lu.isTerm ? '🌟 今天是 <b>' + lu.Term + '</b>' : '';
      }
    }

    var calGrid = document.getElementById('cal-grid');
    if (calGrid) {
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
    setText('cd-days', Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
    var yS=new Date(year,0,1), yE=new Date(year+1,0,1), mS=new Date(year,month,1), mE=new Date(year,month+1,1), wS=new Date(now);
    wS.setDate(date-day); wS.setHours(0,0,0,0);
    var yP=((now-yS)/(yE-yS)*100).toFixed(1), mP=((now-mS)/(mE-mS)*100).toFixed(1), wP=((now-wS)/(7*86400000)*100).toFixed(1);
    
    // 这里就是之前报错的地方，全部用安全方法包裹
    setWidth('cd-year-fill', yP + '%'); setText('cd-year-txt', yP + '%');
    setWidth('cd-month-fill', mP + '%'); setText('cd-month-txt', mP + '%');
    setWidth('cd-week-fill', wP + '%'); setText('cd-week-txt', wP + '%');
  }
}

// 启动附加功能
document.addEventListener('DOMContentLoaded', () => {
  updateAuthorStatus();
  checkFestival();
  const card = document.querySelector('.card-widget.card-info');
  if (card && !document.querySelector('.author-status')) {
    const status = document.createElement('div');
    status.className = 'author-status';
    card.appendChild(status); 
    updateAuthorStatus();
  }
});