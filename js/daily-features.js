/* ==================== 0. 公祭日 / 伟人祭日变灰与提示 ==================== */
(function() {
  var d = new Date();
  // 补齐两位数
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  var y = d.getFullYear();
  var dateStr = m + '-' + dd;

  // 变灰与提示字典
  var grayDays = {
    '09-18': { title: '九一八事变', msg: '警钟长鸣，吾辈自强。铭记历史，不是为了延续仇恨，而是为了和平与未来。🕯️', since: 1931 },
    '07-07': { title: '卢沟桥事变', msg: '山河破碎，先辈浴血。铭记烽火岁月，吾辈当自强不息。🕯️', since: 1937 },
    '12-13': { title: '南京大屠杀死难者国家公祭日', msg: '金陵泣血，三十万亡魂。昭昭前事，惕惕后人。愿逝者安息，世界和平。🕯️', since: 1937 },
    '08-14': { title: '世界慰安妇纪念日', msg: '铭记苦难，守望和平。致敬那些在黑暗中坚韧不屈的灵魂。🕯️' },
    '05-12': { title: '汶川地震纪念日', msg: '山川永纪，浩气长存。缅怀逝者，致敬重生与坚强。🕯️' },
    '09-09': { title: '毛泽东逝世纪念日', msg: '雄关漫道真如铁，而今迈步从头越。缅怀伟人，不忘初心。🕯️' },
    '05-05': { title: '拿破仑逝世纪念日', msg: '滑铁卢的黄昏，圣赫勒拿的孤岛。一代传奇，终归沉寂。🕯️' }
  };

  if (grayDays[dateStr]) {
    var info = grayDays[dateStr];
    
    // 1. 网页变灰
    var html = document.documentElement;
    html.style.transition = 'filter 1.5s ease';
    html.style.filter = 'grayscale(80%)';

    // 2. 弹窗提示
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      var yearStr = info.since ? (' ' + (y - info.since) + '周年') : '';
      setTimeout(function() {
        if (typeof fomalNotify === 'function') {
          fomalNotify({
            type: 'warning',
            title: info.title + yearStr,
            message: info.msg,
            duration: 8000,
            offset: 80
          });
          sessionStorage.setItem("isPopupWindow", "1");
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
  const day = now.getDay();
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

/* ==================== 2. 节假日与特殊纪念日弹窗 ==================== */
function checkFestival() {
  var d = new Date();
  var m = d.getMonth() + 1;
  var dd = d.getDate();
  var y = d.getFullYear();

  // 愚人节随机文案库
  var aprilFoolList = [
    "非常抱歉，因为不可控原因，博客将于明天停止运营！", 
    "好消息，日本没了！", 
    "美国垮了，原因竟然是川普！", 
    "微软垮了！", 
    "你的电脑已经过载，建议立即关机！", 
    "你知道吗？站长很喜欢你哦！", 
    "一分钟有61秒哦", 
    "你喜欢的人跟别人跑了！"
  ];

  // 公历节日配置表
  var solarFestivals = {
    '1-1': { title: '元旦节', msg: y.toString() + '年元旦快乐！🎉', type: 'success', fire: true },
    '3-8': { title: '妇女节', msg: '妇女节快乐！👩', type: 'info' },
    '4-1': { title: '愚人节', msg: aprilFoolList[Math.floor(Math.random() * aprilFoolList.length)], type: 'warning' },
    '5-1': { title: '劳动节', msg: '劳动节快乐\n为各行各业辛勤工作的人们致敬！', type: 'success', fire: true },
    '5-4': { title: '青年节', msg: '青年节快乐\n青春不是回忆逝去,而是把握现在！', type: 'success' },
    '5-20': { title: '520情人节', msg: '今年是520情人节\n快和你喜欢的人一起过吧！💑', type: 'success', fire: true },
    '7-1': { title: '建党节', msg: '祝中国共产党' + (y - 1921).toString() + '岁生日快乐！', type: 'success', fire: true },
    '8-15': { title: '日本投降纪念日', msg: '日本已经投降' + (y - 1945).toString() + '年了😃', type: 'info' },
    '9-10': { title: '教师节', msg: '各位老师们教师节快乐！👩‍🏫', type: 'success' },
    '10-1': { title: '国庆节', msg: '祝祖国' + (y - 1949).toString() + '岁生日快乐！🇨🇳', type: 'success', fire: true },
    '10-2': { title: '国庆节', msg: '祝祖国' + (y - 1949).toString() + '岁生日快乐！🇨🇳', type: 'success', fire: true },
    '10-3': { title: '国庆节', msg: '祝祖国' + (y - 1949).toString() + '岁生日快乐！🇨🇳', type: 'success', fire: true },
    '12-25': { title: '圣诞节', msg: '圣诞节快乐！🎄', type: 'success', fire: true }
  };

  var todayKey = m + '-' + dd;
  var hit = solarFestivals[todayKey];

  // 检查农历节日和二十四节气
  if (!hit && typeof solar2lunar === 'function') {
    var lunar = solar2lunar();
    if (lunar) {
      // 利用 lunar.js 自动识别节气
      if (lunar.isTerm) {
        if (lunar.Term === '清明') {
          hit = { title: '清明节', msg: '清明时节雨纷纷,一束鲜花祭故人💐', type: 'info' };
        } else if (lunar.Term === '冬至') {
          hit = { title: '冬至', msg: '冬至快乐\n快吃上一碗热热的汤圆和饺子吧🧆', type: 'info' };
        }
      }

      // 农历节日判断
      if (!hit) {
        if ((lunar.IMonthCn === "正月" && ["初六","初五","初四","初三","初二","初一"].includes(lunar.IDayCn)) || (lunar.IMonthCn === "腊月" && ["三十","廿九"].includes(lunar.IDayCn))) {
          hit = { title: '春节', msg: y.toString() + '年新年快乐\n🎊祝你心想事成，诸事顺利🎊', type: 'success', fire: true };
        } else if (lunar.IMonthCn === "正月" && lunar.IDayCn === "十五") {
          hit = { title: '元宵节', msg: '元宵节快乐\n送你一个大大的灯笼🏮', type: 'success', fire: true };
        } else if (lunar.IMonthCn === "五月" && lunar.IDayCn === "初五") {
          hit = { title: '端午节', msg: '端午节快乐\n请你吃一条粽子🍙', type: 'success', fire: true };
        } else if (lunar.IMonthCn === "七月" && lunar.IDayCn === "初七") {
          hit = { title: '七夕节', msg: '七夕节快乐\n黄昏后,柳梢头,牛郎织女来碰头', type: 'success', fire: true };
        } else if (lunar.IMonthCn === "八月" && lunar.IDayCn === "十五") {
          hit = { title: '中秋节', msg: '中秋节快乐\n请你吃一块月饼🍪', type: 'success', fire: true };
        } else if (lunar.IMonthCn === "九月" && lunar.IDayCn === "初九") {
          hit = { title: '重阳节', msg: '重阳节快乐\n独在异乡为异客，每逢佳节倍思亲', type: 'info' };
        }
      }
    }
  }

  // 触发弹窗和特效
  if (hit && sessionStorage.getItem("isPopupWindow") != "1") {
    if (typeof fomalNotify === 'function') {
      fomalNotify({
        type: hit.type || 'info',
        title: hit.title,
        message: hit.msg,
        duration: 8000,
        offset: 80
      });
      sessionStorage.setItem("isPopupWindow", "1");
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