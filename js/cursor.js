/* 听话鼠标 / 自定义光点（提取自 Fomalhaut） */
(function () {
  'use strict';
  
  // 移动端/平板不启用
  if (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) return;

  const Cursor = {
    pos: { curr: null, prev: null },
    target: null,
    raf: null,
    layer: null,
    cursor: null,
    styleTag: null,
    pointerCache: new WeakMap(),
    controlCache: new WeakMap(),
    ancestorPointerCache: new WeakMap(),
    __hoverDirty: false,
    __styleInvalid: true,

    init() {
      this.create();
      this.bindEvents();
      this.updateColor();
      
      // 监听 PJAX 换页和主题色变化
      document.addEventListener('pjax:complete', () => this.refresh());
      // 如果博客有切换主题色的按钮，这里简单用定时器兜底，防止光点颜色不更新
      setInterval(() => this.updateColor(), 1000);
    },

    create() {
      if (!this.cursor) {
        this.layer = document.createElement('div');
        this.layer.id = 'cursor-position';
        this.layer.style.cssText = 'position:fixed;left:0;top:0;width:16px;height:16px;pointer-events:none;z-index:10086;';
        
        this.cursor = document.createElement('div');
        this.cursor.id = 'cursor';
        this.cursor.className = 'hidden';
        this.layer.appendChild(this.cursor);
      }
      if (!this.layer.isConnected) document.body.appendChild(this.layer);
      
      if (!this.styleTag) {
        this.styleTag = document.createElement('style');
        document.head.appendChild(this.styleTag);
      }
      
      // 注入光点的基础 CSS
      this.updateColor();
    },

    updateColor() {
      const color = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#39c5bb';
      if (this.color === color) return;
      this.color = color;

      // 1. 替换系统光标为极小的透明点（保留点击功能）
      const svgCursor = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" width="8px" height="8px"><circle cx="4" cy="4" r="4" fill="${color}"/></svg>`;
      
      this.styleTag.textContent = `
        * { cursor: url("data:image/svg+xml,${encodeURIComponent(svgCursor)}") 4 4, auto !important; }
        
        #cursor {
          position: absolute;
          width: 16px;
          height: 16px;
          background: ${color};
          border-radius: 50%;
          opacity: 0.35;
          transition: background 0.2s, opacity 0.2s, transform 0.2s;
          transform-origin: center;
          pointer-events: none;
        }
        #cursor.hidden { opacity: 0; }
        #cursor.hover { opacity: 0.1; transform: scale(2.5); }
        #cursor.active { opacity: 0.6; transform: scale(0.8); }
        
        @media (max-width: 768px) {
          #cursor-position { display: none !important; }
          * { cursor: auto !important; }
        }
      `;
    },

    bindEvents() {
      if (this.__bound) return;
      this.__bound = true;

      document.addEventListener('mousemove', (e) => {
        if (!this.pos.curr) {
          this.move(e.clientX - 8, e.clientY - 8);
        }
        this.target = e.target;
        this.pos.curr = { x: e.clientX - 8, y: e.clientY - 8 };
        this.cursor.classList.remove('hidden');
        this.start();
      }, { passive: true });

      document.addEventListener('mousedown', () => this.cursor.classList.add('active'));
      document.addEventListener('mouseup', () => this.cursor.classList.remove('active'));
      document.addEventListener('mouseenter', () => this.cursor.classList.remove('hidden'));
      document.addEventListener('mouseleave', () => this.cursor.classList.add('hidden'));
      
      // 监听 DOM 变化，判断是否需要放大
      document.addEventListener('mouseover', (e) => {
        this.target = e.target;
        this.__styleInvalid = true;
        this.__hoverDirty = true;
        if (this.pos.curr) this.start();
      }, { passive: true });
    },

    move(left, top) {
      const value = `translate3d(${left}px, ${top}px, 0)`;
      if (this.__transform !== value) {
        this.layer.style.transform = value;
        this.__transform = value;
      }
    },

    isPointer(target) {
      if (target && target.nodeType !== 1) target = target.parentElement;
      if (!target || !target.isConnected) return false;
      
      let control = this.controlCache.get(target);
      if (control === undefined) {
        control = target.closest('a[href], button, summary, label, input[type="button"], input[type="submit"], [onclick], [role="button"], .rightMenu-item, .card-widget');
        this.controlCache.set(target, control);
      }
      return !!control;
    },

    start() {
      if (this.raf !== null || document.hidden || !this.pos.curr) return;
      this.raf = requestAnimationFrame(() => {
        this.raf = null;
        this.render();
      });
    },

    render() {
      const curr = this.pos.curr;
      if (!curr || document.hidden) return;

      if (this.__hoverDirty) {
        const hover = this.isPointer(this.target);
        this.cursor.classList.toggle('hover', hover);
        this.__hoverDirty = false;
      }

      if (!this.pos.prev) this.pos.prev = { x: curr.x, y: curr.y };
      
      // 缓动计算公式
      const dx = curr.x - this.pos.prev.x;
      const dy = curr.y - this.pos.prev.y;
      const moving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;
      
      if (moving) {
        this.pos.prev.x += dx * 0.2;
        this.pos.prev.y += dy * 0.2;
      } else {
        this.pos.prev.x = curr.x;
        this.pos.prev.y = curr.y;
      }
      
      this.move(this.pos.prev.x, this.pos.prev.y);
      if (moving) this.start();
    },

    refresh() {
      this.create();
      this.cursor.classList.remove('active', 'hover');
      this.updateColor();
    }
  };

  // 初始化
  Cursor.init();
  window.CursorSystem = Cursor; // 暴露到全局方便调试
})();