/* 法定休息日判断（自动识别周末、法定节假日、调休） */
(function (w) {
  'use strict';
  
  // 2024 ~ 2026 年的法定节假日与调休（内置离线数据）
  var HOLIDAY_TABLE = {
    "2024": { off: "01-01,02-10,02-11,02-12,02-13,02-14,02-15,02-16,02-17,04-04,04-05,04-06,05-01,05-02,05-03,05-04,05-05,06-10,09-15,09-16,09-17,10-01,10-02,10-03,10-04,10-05,10-06,10-07", work: "02-04,02-18,04-07,04-28,05-11,09-14,09-29,10-12" },
    "2025": { off: "01-01,01-28,01-29,01-30,01-31,02-01,02-02,02-03,02-04,04-04,04-05,04-06,05-01,05-02,05-03,05-04,05-05,05-31,06-01,06-02,10-01,10-02,10-03,10-04,10-05,10-06,10-07,10-08", work: "01-26,02-08,04-27,09-28,10-11" },
    "2026": { off: "01-01,01-02,01-03,02-15,02-16,02-17,02-18,02-19,02-20,02-21,02-22,02-23,04-04,04-05,04-06,05-01,05-02,05-03,05-04,05-05,06-19,06-20,06-21,09-25,09-26,09-27,10-01,10-02,10-03,10-04,10-05,10-06,10-07", work: "01-04,02-14,02-28,05-09,09-20,10-10" }
  };
  
  // 2027 及以后，从 CDN 拉取最新数据
  var HOLIDAY_CDN = "https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master/";
  var HOLIDAY_TRIED = {}; 
  
  function holidayKey(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return (m < 10 ? "0" + m : "" + m) + "-" + (day < 10 ? "0" + day : "" + day);
  }
  
  // 只在"未知年份"时联网补齐
  function ensureHolidayYear(year) {
    if (HOLIDAY_TABLE[year] || HOLIDAY_TRIED[year]) return;
    HOLIDAY_TRIED[year] = true;
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem("holiday_" + year) || "null"); } catch (e) { cached = null; }
    if (cached && cached.off) { HOLIDAY_TABLE[year] = cached; return; }
    
    try {
      fetch(HOLIDAY_CDN + year + ".json").then(function (r) { return r.json(); }).then(function (data) {
        if (!data || !data.days || !data.days.length) return;
        var off = [], work = [];
        data.days.forEach(function (it) { (it.isOffDay ? off : work).push(it.date.slice(5)); });
        var t = { off: off.join(","), work: work.join(",") };
        HOLIDAY_TABLE[year] = t;
        try { localStorage.setItem("holiday_" + year, JSON.stringify(t)); } catch (e) {}
      }).catch(function () {});
    } catch (e) {}
  }
  
  // 核心判断函数
  function isRestDay(d) {
    ensureHolidayYear(d.getFullYear());
    var key = holidayKey(d), t = HOLIDAY_TABLE[d.getFullYear()];
    if (t) {
      if (t.work && t.work.split(",").indexOf(key) >= 0) return false; // 调休上班
      if (t.off && t.off.split(",").indexOf(key) >= 0) return true;   // 法定放假
    }
    var w = d.getDay();
    return w === 0 || w === 6; // 普通周末
  }
  
  // 暴露到全局，供 daily-features.js 调用
  w.isRestDay = isRestDay;
  
})(window);