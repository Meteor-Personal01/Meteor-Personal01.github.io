/* 博客 AI 助手（纯前端版，依赖 Vercel 代理） */
(function () {
  'use strict';

  // ================= 配置区 =================
  // ⚠️ 把这里换成你刚才在 Vercel 拿到的短域名 + /api/completions
  const API_URL = 'https://my-ai-api-six.vercel.app/api/completions'; 
  const MODEL = 'deepseek-chat'; // 使用的模型
  // =========================================

  const BTN_ID = 'ai-chat-btn', PANEL_ID = 'ai-chat-panel';

  // 内联图标
  const WHALE = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:22px;height:22px;display:block;"><path d="M9.7 8.2c3.3-1.1 6.7-.1 8.6 2.6.5.8 1.4 1.2 2.3 1.2h.9c.8 0 1.3.5 1.3 1.3 0 .7-.5 1.3-1.3 1.3h-1c-.9 0-1.7.4-2.2 1.2-2.1 3.1-6.3 4.2-9.7 2.8-3.2-1.3-5-4.6-4.1-7.8.6-2.1 2.7-3.4 5.2-2.6Zm-.7 4.3a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"/><path d="M17.9 6.4c1.2-1 2.6-1.5 3.8-1.4.4 0 .6.4.4.7-.7 1.4-1.9 2.5-3.3 3-.8.2-1.5-.6-1.2-1.3l.3-1Z"/><path d="M7.2 4.6c.7-.5 1.6-.6 2.3-.3.5.3.6.9.2 1.3-.5.5-1.3.7-2 .4-.5-.2-.7-.8-.5-1.4Z"/><path d="M10.6 2.1c.8-.4 1.8-.3 2.4.2.4.4.2 1-.3 1.4-.7.4-1.6.4-2.2 0-.5-.3-.4-.9.1-1.3Z"/></svg>';
  const ICON_SEND = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  // 极简 Markdown 解析（处理代码块、列表、加粗）
  function md(src) {
    let text = String(src).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    text = text.replace(/```(.*?)\n([\s\S]*?)```/g, (m, lang, code) => `<pre><code>${code}</code></pre>`);
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/^\- (.*)/gm, '<li>$1</li>').replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    text = text.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
    return text;
  }

  // 注入 CSS
  const style = document.createElement('style');
  style.textContent = `
    /* 修改点：将 right 改为 left，调整 bottom 使其在 FPS 上方 */
    #${BTN_ID} { position: fixed; left: 20px; bottom: 80px; width: 50px; height: 50px; border-radius: 50%; background: var(--theme-color); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 1000; transition: transform 0.2s; }
    #${BTN_ID}:hover { transform: scale(1.1); }
    
    /* 修改点：面板也从左侧弹出 */
    #${PANEL_ID} { position: fixed; left: 20px; bottom: 140px; width: 380px; height: 600px; max-height: 80vh; background: var(--global-bg); border: 1px solid rgba(128,128,128,0.2); border-radius: 16px; display: flex; flex-direction: column; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.2); opacity: 0; pointer-events: none; transform: translateY(20px); transition: all 0.3s; }
    #${PANEL_ID}.show { opacity: 1; pointer-events: auto; transform: translateY(0); }
    
    .ai-hd { padding: 15px; border-bottom: 1px solid rgba(128,128,128,0.1); display: flex; align-items: center; gap: 10px; font-weight: bold; }
    .ai-hd span { flex: 1; }
    .ai-hd .close { cursor: pointer; opacity: 0.6; }
    .ai-hd .close:hover { opacity: 1; }
    .ai-bd { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 15px; font-size: 14px; line-height: 1.6; }
    .ai-msg { padding: 10px 14px; border-radius: 12px; max-width: 85%; word-break: break-word; }
    .ai-msg.user { background: var(--theme-color); color: #fff; align-self: flex-end; border-bottom-right-radius: 2px; }
    .ai-msg.ai { background: rgba(128,128,128,0.1); align-self: flex-start; border-bottom-left-radius: 2px; }
    .ai-msg pre { background: rgba(0,0,0,0.1); padding: 10px; border-radius: 6px; overflow-x: auto; margin: 8px 0; font-family: monospace; }
    .ai-ft { padding: 10px 15px; border-top: 1px solid rgba(128,128,128,0.1); display: flex; gap: 10px; }
    .ai-input { flex: 1; resize: none; padding: 10px; border-radius: 8px; border: 1px solid rgba(128,128,128,0.2); background: transparent; color: var(--font-color); outline: none; height: 40px; max-height: 100px; }
    .ai-input:focus { border-color: var(--theme-color); }
    .ai-send { background: var(--theme-color); border: none; border-radius: 8px; color: #fff; width: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .ai-send svg { width: 20px; height: 20px; }
    .ai-loading { font-size: 12px; opacity: 0.6; text-align: center; display: none; margin-bottom: 10px; }
    
    /* 适配手机端：屏幕太小时改为全屏居中 */
    @media (max-width: 768px) {
      #${PANEL_ID} { left: 10px; right: 10px; width: auto; height: min(78vh, 600px); bottom: 80px; }
    }
  `;
  document.head.appendChild(style);

  // 注入 DOM
  const btn = document.createElement('div');
  btn.id = BTN_ID; btn.innerHTML = WHALE; btn.title = 'AI 助手';
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="ai-hd"><div style="color:var(--theme-color)">${WHALE}</div><span>AI 助手</span><div class="close">✕</div></div>
    <div class="ai-bd"></div>
    <div class="ai-loading">AI 正在思考中...</div>
    <div class="ai-ft"><textarea class="ai-input" placeholder="问我关于这篇文章的问题..."></textarea><button class="ai-send">${ICON_SEND}</button></div>
  `;
  document.body.appendChild(panel);

  const bd = panel.querySelector('.ai-bd');
  const input = panel.querySelector('.ai-input');
  const sendBtn = panel.querySelector('.ai-send');
  const loading = panel.querySelector('.ai-loading');
  let isOpen = false, isBusy = false;

  // 交互逻辑
  btn.onclick = () => { isOpen = !isOpen; panel.classList.toggle('show', isOpen); if (isOpen) input.focus(); };
  panel.querySelector('.close').onclick = () => { isOpen = false; panel.classList.remove('show'); };
  
  // 自动调整输入框高度
  input.oninput = () => { input.style.height = '40px'; input.style.height = Math.min(input.scrollHeight, 100) + 'px'; };

  // 获取页面正文
  function getPageText() {
    let el = document.querySelector('#article-container') || document.querySelector('.post-content');
    return el ? el.innerText.slice(0, 10000) : document.title;
  }

  // 发送消息
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isBusy) return;

    // UI 更新
    input.value = ''; input.style.height = '40px';
    const userRow = document.createElement('div'); userRow.className = 'ai-msg user'; userRow.textContent = text;
    bd.appendChild(userRow); bd.scrollTop = bd.scrollHeight;
    isBusy = true; loading.style.display = 'block';

    const aiRow = document.createElement('div'); aiRow.className = 'ai-msg ai'; aiRow.innerHTML = '...';
    bd.appendChild(aiRow); bd.scrollTop = bd.scrollHeight;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: '你是一个博客助手。请根据以下文章内容回答问题：\n\n' + getPageText() },
            { role: 'user', content: text }
          ],
          stream: true
        })
      });

      if (!res.ok) throw new Error('请求失败，检查代理配置');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content || '';
              if (content) { aiText += content; aiRow.innerHTML = md(aiText); bd.scrollTop = bd.scrollHeight; }
            } catch(e) {}
          }
        }
      }
    } catch (err) {
      aiRow.innerHTML = `<span style="color:red">出错啦：${err.message}</span>`;
    } finally {
      isBusy = false; loading.style.display = 'none';
    }
  }

  sendBtn.onclick = sendMessage;
  input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

})();