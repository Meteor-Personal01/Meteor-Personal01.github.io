/* 轻量级通知组件 */
(function (global) {
  var STYLE_ID = 'fomal-notify-style';
  // 👇 修改点1：把 top:0 改成了 top:80px，如果外部传了 offset，JS 会动态覆盖它
  var CSS = '.fomal-notify-wrap{position:fixed;z-index:9999;display:flex;flex-direction:column;gap:16px;pointer-events:none}.fomal-notify-wrap.top-left{top:80px;left:16px}.fomal-notify{position:relative;display:flex;width:330px;padding:14px 26px 14px 13px;box-sizing:border-box;border:1px solid #ebeef5;border-radius:8px;background:rgba(33,38,45,.95);box-shadow:0 4px 16px rgba(0,0,0,.4);overflow:hidden;pointer-events:auto;transition:opacity .3s,transform .3s;backdrop-filter:blur(10px)}.fomal-notify.is-enter{opacity:0;transform:translateX(-100%)}.fomal-notify.is-leave{opacity:0;transform:translateX(-100%)}.fomal-notify__icon{flex:0 0 24px;width:24px;height:24px;line-height:0}.fomal-notify__icon svg{width:24px;height:24px;display:block}.fomal-notify--success .fomal-notify__icon{color:#3fb950}.fomal-notify--info .fomal-notify__icon{color:#58a6ff}.fomal-notify--warning .fomal-notify__icon{color:#d29922}.fomal-notify__group{margin-left:13px;margin-right:8px;flex:1 1 auto;min-width:0}.fomal-notify__title{margin:0;font-size:16px;font-weight:700;color:#e6edf3;line-height:1.4}.fomal-notify__content{margin:6px 0 0;font-size:14px;line-height:21px;color:#8b949e;white-space:pre-line}.fomal-notify__close{position:absolute;top:15px;right:15px;cursor:pointer;color:#8b949e;}.fomal-notify__close svg{width:14px;height:14px;display:block}';
  
  // 👇 修改点2：补充了 warning 的感叹号图标
  var ICONS = { 
    success: '<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M7.2 12.4l3.1 3.1 6.4-6.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>', 
    info: '<circle cx="12" cy="12" r="10" fill="currentColor"/><circle cx="12" cy="7.4" r="1.35" fill="#fff"/><path d="M12 10.6v7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>',
    warning: '<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 6.6v7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.35" fill="#fff"/>'
  };
  
  var CLOSE = '<svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
  
  function ensureStyle() { if (!document.getElementById(STYLE_ID)) { var el = document.createElement('style'); el.id = STYLE_ID; el.textContent = CSS; document.head.appendChild(el); } }
  
  var wraps = {};
  function fomalNotify(opt) {
    ensureStyle();
    var type = ICONS[opt.type] ? opt.type : 'info';
    var position = 'top-left';
    var wrap = wraps[position];
    
    if (!wrap || !wrap.isConnected) { 
      wrap = document.createElement('div'); 
      wrap.className = 'fomal-notify-wrap ' + position; 
      document.body.appendChild(wrap); 
      wraps[position] = wrap; 
    }
    
    // 👇 修改点3：支持外部动态传入 offset，如果传了就实时改样式，没传就用默认的 80px
    if (typeof opt.offset === 'number') {
      wrap.style.top = opt.offset + 'px';
    } else {
      wrap.style.top = ''; // 恢复默认 CSS 的 80px
    }

    var box = document.createElement('div'); 
    box.className = 'fomal-notify fomal-notify--' + type + ' is-enter';
    box.innerHTML = '<div class="fomal-notify__icon"><svg viewBox="0 0 24 24">' + ICONS[type] + '</svg></div><div class="fomal-notify__group">' + (opt.title ? '<h2 class="fomal-notify__title">' + opt.title + '</h2>' : '') + (opt.message ? '<div class="fomal-notify__content">' + opt.message + '</div>' : '') + '</div><div class="fomal-notify__close">' + CLOSE + '</div>';
    wrap.appendChild(box);
    
    requestAnimationFrame(() => box.classList.remove('is-enter'));
    var timer = setTimeout(close, opt.duration || 5000);
    function close() { clearTimeout(timer); box.classList.add('is-leave'); setTimeout(() => { if (box.parentNode) box.parentNode.removeChild(box); }, 320); }
    box.querySelector('.fomal-notify__close').onclick = close;
    box.onmouseenter = () => clearTimeout(timer);
    box.onmouseleave = () => timer = setTimeout(close, 2000);
  }
  global.fomalNotify = fomalNotify;
})(window);