// Promqt - Select text → improve prompt
// Triggers: selection bubble, right-click, Ctrl+C C, FAB icon

// No viralmaker auto-paste needed here - handled by background.js scripting

(function () {
  if (document.getElementById('promqt-root')) return;

  let selectedText = '';
  let isProcessing = false;
  let activeFormat = 'text';
  let popupOpen = false;

  // --- Ctrl+C C detection ---
  let lastCtrlC = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'c' && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      const now = Date.now();
      if (now - lastCtrlC < 500) {
        e.preventDefault();
        const text = window.getSelection()?.toString().trim();
        if (text && text.length > 2) {
          selectedText = text;
          openPopup(text);
        }
        lastCtrlC = 0;
      } else {
        lastCtrlC = now;
      }
    }
    if (e.key === 'Escape' && popupOpen) closePopup();
  }, true);

  // --- Listen for context menu ---
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'open_promqt' && msg.text) {
      selectedText = msg.text;
      openPopup(msg.text);
    }
  });

  // --- Styles ---
  const style = document.createElement('style');
  style.textContent = `
    #promqt-trigger {
      position: fixed;
      z-index: 2147483647;
      background: #001227;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      font-weight: 700;
      padding: 5px 10px 5px 8px;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      user-select: none;
      display: none;
      white-space: nowrap;
      transition: transform 0.1s, opacity 0.15s;
      letter-spacing: -0.01em;
      opacity: 0;
    }
    #promqt-trigger.visible { display: block; opacity: 1; }
    #promqt-trigger:hover { transform: scale(1.06); background: #002451; }

    /* FAB icon */
    #promqt-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483646;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #001227;
      color: #fff;
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      transition: all 0.2s;
      user-select: none;
    }
    #promqt-fab.visible { display: flex; }
    #promqt-fab:hover { transform: scale(1.1); background: #002451; }
    #promqt-fab .fab-close {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #64748b;
      color: #fff;
      font-size: 10px;
      line-height: 16px;
      text-align: center;
      cursor: pointer;
      display: none;
      font-family: -apple-system, sans-serif;
    }
    #promqt-fab:hover .fab-close { display: block; }

    .pq-card {
      position: fixed; bottom: 24px; right: 24px;
      width: 380px; max-height: 80vh;
      background: #fff; border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.2);
      border: 1px solid #e2e8f0;
      z-index: 2147483647; display: none; flex-direction: column; overflow: hidden;
    }
    .pq-card.open { display: flex; }
    .pq-head {
      padding: 14px 18px; border-bottom: 1px solid #f1f5f9;
      display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
      cursor: grab; user-select: none; -webkit-user-select: none;
    }
    .pq-head.dragging { cursor: grabbing; }
    .pq-logo { font-size: 18px; font-weight: 900; letter-spacing: -0.04em; color: #001227; pointer-events: none; }
    .pq-x {
      width: 28px; height: 28px; border-radius: 8px; border: none;
      background: #f1f5f9; color: #64748b; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; line-height: 1;
    }
    .pq-x:hover { background: #e2e8f0; color: #0f172a; }
    .pq-body { padding: 14px 18px 18px; overflow-y: auto; flex: 1; }

    .pq-lbl {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 4px;
    }
    .pq-sel {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 10px 12px; font-size: 13px; color: #475569;
      margin-bottom: 12px; max-height: 72px; overflow: hidden;
      position: relative;
    }
    .pq-sel::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0;
      height: 20px; background: linear-gradient(transparent, #f8fafc);
    }

    .pq-fmts { display: flex; gap: 6px; margin-bottom: 14px; }
    .pq-fmt {
      flex: 1; padding: 7px; border: 1.5px solid #e2e8f0; border-radius: 8px;
      background: #fff; font-size: 12px; font-weight: 600; color: #475569;
      cursor: pointer; text-align: center; font-family: inherit;
      transition: all 0.12s;
    }
    .pq-fmt:hover { border-color: #006bec; color: #006bec; }
    .pq-fmt.on { border-color: #006bec; background: #eff6ff; color: #006bec; }

    .pq-status {
      text-align: center; font-size: 13px; padding: 12px 0; display: none;
    }
    .pq-status.loading { display: block; color: #006bec; font-weight: 600; }
    .pq-status.err { display: block; color: #ef4444; font-weight: 500; }

    .pq-opts { display: flex; flex-direction: column; gap: 8px; }
    .pq-opt {
      border: 1.5px solid #e2e8f0; border-radius: 12px;
      padding: 12px 14px; background: #fff; transition: all 0.15s;
    }
    .pq-opt:hover { border-color: #006bec; background: #fafcff; }
    .pq-opt-l {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #006bec; margin-bottom: 4px;
    }
    .pq-opt-t {
      font-size: 13px; color: #334155; line-height: 1.6;
      white-space: pre-wrap; word-break: break-word;
    }
    .pq-opt-a { display: flex; gap: 6px; margin-top: 10px; }

    .pq-btn {
      font-size: 11px; font-weight: 600; padding: 5px 12px;
      border-radius: 7px; border: 1px solid #e2e8f0;
      background: #f8fafc; color: #475569;
      cursor: pointer; font-family: inherit; transition: all 0.12s;
    }
    .pq-btn:hover { background: #006bec; color: #fff; border-color: #006bec; }
    .pq-btn-use { background: #006bec; color: #fff; border-color: #006bec; }
    .pq-btn-use:hover { background: #0055cc; }
    .pq-btn-gen { background: #10b981; color: #fff; border-color: #10b981; }
    .pq-btn-gen:hover { background: #059669; }

    .pq-foot {
      font-size: 10px; color: #94a3b8; text-align: center; padding-top: 10px;
      border-top: 1px solid #f1f5f9; margin-top: 4px;
    }
    .pq-foot kbd {
      background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 3px;
      padding: 0 4px; font-size: 10px; font-family: inherit;
    }

    .pq-toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #0f172a; color: #fff; font-size: 13px; font-weight: 600;
      padding: 8px 18px; border-radius: 10px; z-index: 2147483648;
      opacity: 0; transition: opacity 0.2s; pointer-events: none;
      font-family: -apple-system, sans-serif;
    }
    .pq-toast.show { opacity: 1; }
  `;
  document.documentElement.appendChild(style);

  // --- Trigger button (on selection) ---
  const trigger = document.createElement('div');
  trigger.id = 'promqt-trigger';
  trigger.innerHTML = '✦ Promqt';
  document.documentElement.appendChild(trigger);

  // --- FAB icon (persistent, bottom-right) ---
  const fab = document.createElement('div');
  fab.id = 'promqt-fab';
  fab.innerHTML = `
    <svg width="22" height="26" viewBox="0 0 100 120" fill="none">
      <path d="M50 4C24 4 4 24 4 50c0 12 4.5 23 12 31.5L8 104c-1 3 1 4 3.5 2.5L34 93c5 2.5 10.5 4 16 4 26 0 46-20 46-46S76 4 50 4zm2 68c-14 0-24-10-24-22s10-22 24-22 24 10 24 22-10 22-24 22z" fill="#fff"/>
    </svg>
    <div class="fab-close">&times;</div>
  `;
  document.documentElement.appendChild(fab);

  const fabClose = fab.querySelector('.fab-close');

  // Show FAB by default (unless user closed it)
  chrome.storage.local.get(['promqtFabHidden'], (d) => {
    if (!d.promqtFabHidden) fab.classList.add('visible');
  });

  fab.addEventListener('click', (e) => {
    if (e.target === fabClose || fabClose.contains(e.target)) return;
    const text = window.getSelection()?.toString().trim();
    if (text && text.length > 2) {
      selectedText = text;
      openPopup(text);
    } else if (popupOpen) {
      // Toggle close
      closePopup();
    } else {
      toast('Select some text first, then click here');
    }
  });

  fabClose.addEventListener('click', (e) => {
    e.stopPropagation();
    fab.classList.remove('visible');
    chrome.storage.local.set({ promqtFabHidden: true });
  });

  // --- Card ---
  const card = document.createElement('div');
  card.className = 'pq-card';
  card.innerHTML = `
    <div class="pq-head">
      <svg class="pq-logo" viewBox="0 0 680 140" fill="#2d3436" height="22" width="107"><path d="M0 40h28v8c6-8 16-14 30-14 24 0 42 20 42 44s-18 44-42 44c-13 0-23-5-30-13v36H0V40zm28 38c0 16 10 26 24 26s24-10 24-26-10-26-24-26-24 10-24 26z"/><path d="M118 40h28v18c5-13 15-20 28-20h4v28h-8c-16 0-24 7-24 22v32h-28V40z"/><path d="M224 34c28 0 46 20 46 44s-18 44-46 44-46-20-46-44 18-44 46-44zm0 62c12 0 20-8 20-18s-8-18-20-18-20 8-20 18 8 18 20 18z"/><path d="M288 40h28v10c6-8 14-14 26-14s21 5 26 14c7-9 17-14 29-14 20 0 32 13 32 36v48h-28V76c0-12-5-18-15-18s-16 7-16 20v42h-28V76c0-12-5-18-15-18s-16 7-16 20v42h-28V40z"/><path d="M486 34c26 0 44 20 44 44 0 23-16 42-40 44l-4 0-10 16c-2 3-4 2-5-1l-5-13c-17-6-29-22-29-42 0-26 21-48 49-48zm2 62c12 0 20-8 20-18s-8-18-20-18-20 8-20 18 8 18 20 18z"/><path d="M556 10h28v30h20v22h-20v34c0 8 3 12 10 12h10v18h-16c-20 0-32-10-32-30V62h-14V40h14V10z"/></svg>
      <button class="pq-x">&times;</button>
    </div>
    <div class="pq-body">
      <div class="pq-lbl">SELECTED TEXT</div>
      <div class="pq-sel" id="pq-sel"></div>
      <div class="pq-fmts">
        <button class="pq-fmt on" data-f="text">Text</button>
        <button class="pq-fmt" data-f="json">JSON</button>
      </div>
      <div class="pq-status" id="pq-st"></div>
      <div class="pq-opts" id="pq-res"></div>
      <div class="pq-foot">
        <kbd>Ctrl</kbd>+<kbd>C</kbd> <kbd>C</kbd> &nbsp;|&nbsp; Right-click → Promqt
      </div>
    </div>
  `;
  document.documentElement.appendChild(card);

  const head = card.querySelector('.pq-head');
  const closeBtn = card.querySelector('.pq-x');
  const selEl = card.querySelector('#pq-sel');
  const statusEl = card.querySelector('#pq-st');
  const resultsEl = card.querySelector('#pq-res');
  const fmtBtns = card.querySelectorAll('.pq-fmt');

  // --- Selection trigger ---
  let showTimer = null;

  function checkSelection() {
    if (popupOpen) return;
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || text.length < 3) { hideTrigger(); return; }
    try {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) { hideTrigger(); return; }
      selectedText = text;
      let top = rect.top - 36;
      let left = rect.left + rect.width / 2 - 40;
      top = Math.max(4, Math.min(top, window.innerHeight - 36));
      left = Math.max(4, Math.min(left, window.innerWidth - 90));
      trigger.style.top = top + 'px';
      trigger.style.left = left + 'px';
      trigger.classList.add('visible');
    } catch (e) { hideTrigger(); }
  }

  function hideTrigger() { trigger.classList.remove('visible'); }

  document.addEventListener('mouseup', (e) => {
    if (isDragging) return;
    if (e.target.closest('.pq-card') || e.target.closest('#promqt-trigger') || e.target.closest('#promqt-fab')) return;
    clearTimeout(showTimer);
    showTimer = setTimeout(checkSelection, 50);
  });

  document.addEventListener('selectionchange', () => {
    if (popupOpen) return;
    clearTimeout(showTimer);
    showTimer = setTimeout(checkSelection, 200);
  });

  document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('#promqt-trigger') && !e.target.closest('.pq-card') && !e.target.closest('#promqt-fab')) {
      hideTrigger();
    }
  });

  window.addEventListener('scroll', () => { hideTrigger(); }, true);

  // --- Trigger click ---
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    hideTrigger();
    openPopup(selectedText);
  });

  // --- Close ---
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closePopup();
  });

  function closePopup() {
    card.classList.remove('open');
    popupOpen = false;
    resultsEl.innerHTML = '';
    statusEl.className = 'pq-status';
    isProcessing = false;
    resetCardPosition();
  }

  function resetCardPosition() {
    card.style.right = '24px';
    card.style.bottom = '24px';
    card.style.left = '';
    card.style.top = '';
  }

  // --- Drag ---
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  head.addEventListener('mousedown', (e) => {
    if (e.target === closeBtn || closeBtn.contains(e.target)) return;
    isDragging = true;
    head.classList.add('dragging');
    const rect = card.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    let x = e.clientX - dragOffsetX;
    let y = e.clientY - dragOffsetY;
    x = Math.max(0, Math.min(x, window.innerWidth - card.offsetWidth));
    y = Math.max(0, Math.min(y, window.innerHeight - card.offsetHeight));
    card.style.left = x + 'px';
    card.style.top = y + 'px';
    card.style.right = 'auto';
    card.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', (e) => {
    if (isDragging) {
      isDragging = false;
      head.classList.remove('dragging');
      e.stopPropagation();
    }
  });

  // --- Cache for results per format ---
  let cache = {}; // { "text": [...prompts], "json": [...prompts] }

  // --- Format toggle ---
  fmtBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      fmtBtns.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      activeFormat = btn.dataset.f;
      if (!selectedText || isProcessing) return;

      // If we already have results for this format, show from cache
      if (cache[activeFormat]) {
        statusEl.className = 'pq-status';
        showResults(cache[activeFormat]);
      } else {
        generate(selectedText, activeFormat);
      }
    });
  });

  // --- Open & generate ---
  function openPopup(text) {
    selEl.textContent = text;
    card.classList.add('open');
    popupOpen = true;
    resultsEl.innerHTML = '';
    cache = {}; // Clear cache for new input
    resetCardPosition();
    // Re-show FAB if it was hidden
    fab.classList.add('visible');
    chrome.storage.local.set({ promqtFabHidden: false });

    chrome.storage.local.get(['promqtProvider', 'promqtModel', 'promqtApiKey'], (d) => {
      if (!d.promqtProvider || !d.promqtModel || !d.promqtApiKey) {
        statusEl.textContent = 'API key not set. Click the Promqt extension icon → Settings.';
        statusEl.className = 'pq-status err';
        return;
      }
      generate(text, activeFormat);
    });
  }

  function generate(text, format) {
    isProcessing = true;
    resultsEl.innerHTML = '';

    // Check API key FIRST before showing loading
    chrome.storage.local.get(['promqtProvider', 'promqtModel', 'promqtApiKey'], (d) => {
      if (!d.promqtProvider || !d.promqtModel || !d.promqtApiKey) {
        isProcessing = false;
        statusEl.textContent = 'API key not set. Click the Promqt extension icon → Settings.';
        statusEl.className = 'pq-status err';
        return;
      }
      doGenerate(text, format);
    });
  }

  function doGenerate(text, format) {
    statusEl.textContent = 'Improving your prompt...';
    statusEl.className = 'pq-status loading';

    const timeout = setTimeout(() => {
      if (isProcessing) {
        isProcessing = false;
        statusEl.textContent = 'Request timed out. Try again.';
        statusEl.className = 'pq-status err';
      }
    }, 30000);

    chrome.runtime.sendMessage(
      { type: 'generate_prompts', selectedText: text, format },
      (res) => {
        clearTimeout(timeout);
        isProcessing = false;
        if (chrome.runtime.lastError) {
          statusEl.textContent = 'Extension error. Try refreshing the page.';
          statusEl.className = 'pq-status err';
          return;
        }
        if (res?.error) {
          statusEl.textContent = res.error;
          statusEl.className = 'pq-status err';
          return;
        }
        if (!res?.prompts) {
          statusEl.textContent = 'No response received. Try again.';
          statusEl.className = 'pq-status err';
          return;
        }
        statusEl.className = 'pq-status';
        cache[format] = res.prompts; // Save to cache
        showResults(res.prompts);
      }
    );
  }

  function showResults(prompts) {
    resultsEl.innerHTML = '';
    prompts.forEach((p) => {
      const el = document.createElement('div');
      el.className = 'pq-opt';
      el.innerHTML = `
        <div class="pq-opt-l">${esc(p.label)}</div>
        <div class="pq-opt-t">${esc(p.text)}</div>
        <div class="pq-opt-a">
          <button class="pq-btn pq-btn-use" data-a="use">Use</button>
          <button class="pq-btn" data-a="copy">Copy</button>
          <button class="pq-btn pq-btn-gen" data-a="generate">Generate</button>
        </div>
      `;
      el.querySelector('[data-a="use"]').addEventListener('click', (e) => {
        e.stopPropagation();
        pasteText(p.text);
        toast('Pasted!');
        closePopup();
      });
      el.querySelector('[data-a="generate"]').addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.runtime.sendMessage({ type: 'open_viralmaker', prompt: p.text });
        toast('Opening ViralMaker...');
      });
      el.querySelector('[data-a="copy"]').addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(p.text);
        toast('Copied!');
      });
      resultsEl.appendChild(el);
    });
  }

  function pasteText(text) {
    const sels = [
      '#prompt-textarea', 'textarea', '[contenteditable="true"]',
      '[role="textbox"]', '.ProseMirror',
    ];
    for (const s of sels) {
      const els = document.querySelectorAll(s);
      for (let i = els.length - 1; i >= 0; i--) {
        const t = els[i];
        if (!t.offsetParent && !t.isContentEditable) continue;
        if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT') {
          const proto = t.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          if (setter) setter.call(t, text); else t.value = text;
          t.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          t.focus();
          const r = document.createRange();
          r.selectNodeContents(t);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(r);
          document.execCommand('insertText', false, text);
        }
        t.focus();
        return;
      }
    }
    navigator.clipboard.writeText(text);
  }

  function toast(msg) {
    let t = document.querySelector('.pq-toast');
    if (!t) { t = document.createElement('div'); t.className = 'pq-toast'; document.documentElement.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1500);
  }

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
})();
