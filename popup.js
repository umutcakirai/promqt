// --- Tabs ---
var tabs = document.querySelectorAll('.tab');
var panels = document.querySelectorAll('.panel');

tabs.forEach(function(tab) {
  tab.addEventListener('click', function() {
    tabs.forEach(function(t) { t.classList.remove('active'); });
    panels.forEach(function(p) { p.classList.remove('active'); });
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'history') loadHistory();
  });
});

// --- Settings ---
var MODELS = {
  openai: [
    ['gpt-4o', 'GPT-4o'],
    ['gpt-4o-mini', 'GPT-4o Mini'],
    ['gpt-4.1', 'GPT-4.1'],
    ['gpt-4.1-mini', 'GPT-4.1 Mini'],
    ['gpt-4.1-nano', 'GPT-4.1 Nano'],
    ['o4-mini', 'o4 Mini'],
  ],
  gemini: [
    ['gemini-2.5-flash', 'Gemini 2.5 Flash'],
    ['gemini-2.0-flash', 'Gemini 2.0 Flash'],
    ['gemini-2.5-pro', 'Gemini 2.5 Pro'],
  ],
  claude: [
    ['claude-sonnet-4-20250514', 'Claude Sonnet 4'],
    ['claude-haiku-35-20241022', 'Claude Haiku 3.5'],
  ],
};

var KEY_HINTS = {
  openai: 'Get key → <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>',
  gemini: 'Get key → <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com</a>',
  claude: 'Get key → <a href="https://console.anthropic.com/settings/keys" target="_blank">console.anthropic.com</a>',
};

var provEl = document.getElementById('provider');
var modEl = document.getElementById('model');
var keyEl = document.getElementById('apiKey');
var hintEl = document.getElementById('keyHint');
var testEl = document.getElementById('test');
var saveEl = document.getElementById('save');
var statEl = document.getElementById('status');

function updateModels(provider, savedModel) {
  var list = MODELS[provider];
  if (!list) {
    modEl.innerHTML = '<option value="">Select provider first...</option>';
    return;
  }
  modEl.innerHTML = list.map(function(m) {
    return '<option value="' + m[0] + '">' + m[1] + '</option>';
  }).join('');
  if (savedModel) modEl.value = savedModel;
  hintEl.innerHTML = KEY_HINTS[provider] || '';
}

provEl.addEventListener('change', function() {
  updateModels(provEl.value);
});

// Load saved settings
chrome.storage.local.get(['promqtProvider', 'promqtModel', 'promqtApiKey'], function(d) {
  if (d.promqtProvider) {
    provEl.value = d.promqtProvider;
    updateModels(d.promqtProvider, d.promqtModel);
  }
  if (d.promqtApiKey) keyEl.value = d.promqtApiKey;
});

// Save
saveEl.addEventListener('click', function() {
  if (!provEl.value || !modEl.value || !keyEl.value.trim()) {
    stat('Please fill in all fields', 'error');
    return;
  }
  chrome.storage.local.set({
    promqtProvider: provEl.value,
    promqtModel: modEl.value,
    promqtApiKey: keyEl.value.trim(),
  }, function() {
    stat('Saved!', 'success');
  });
});

// Test
testEl.addEventListener('click', async function() {
  var provider = provEl.value;
  var model = modEl.value;
  var apiKey = keyEl.value.trim();

  if (!provider || !model || !apiKey) {
    stat('Please fill in all fields first', 'error');
    return;
  }

  stat('Testing connection...', 'testing');
  testEl.disabled = true;

  try {
    if (provider === 'openai') {
      var r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({ model: model, messages: [{ role: 'user', content: 'Say ok' }], max_tokens: 5 }),
      });
      var d = await r.json();
      if (d.error) throw new Error(d.error.message);
    }
    if (provider === 'gemini') {
      var r2 = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Say ok' }] }] }) }
      );
      var d2 = await r2.json();
      if (d2.error) throw new Error(d2.error.message);
    }
    if (provider === 'claude') {
      var r3 = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey,
          'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: model, max_tokens: 5, messages: [{ role: 'user', content: 'Say ok' }] }),
      });
      var d3 = await r3.json();
      if (d3.error) throw new Error(d3.error.message);
    }
    stat('Connection successful! API key is valid.', 'success');
  } catch (e) {
    stat('Failed: ' + e.message, 'error');
  } finally {
    testEl.disabled = false;
  }
});

function stat(msg, cls) {
  statEl.textContent = msg;
  statEl.className = 'status ' + (cls || '');
}

// --- History ---
var historyList = document.getElementById('history-list');

function loadHistory() {
  chrome.runtime.sendMessage({ type: 'get_history' }, function(res) {
    var history = (res && res.history) || [];
    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No prompts yet.<br>Select text on any page to get started.</div>';
      return;
    }

    var html = '';
    history.forEach(function(item, idx) {
      var date = new Date(item.timestamp);
      var timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      html += '<div class="history-item" data-idx="' + idx + '">';
      html += '<div class="history-input">' + esc(item.input) + '</div>';
      html += '<div class="history-meta"><span>' + timeStr + '</span><span>' + (item.format || 'text').toUpperCase() + '</span></div>';
      html += '<div class="history-prompts">';

      if (item.prompts) {
        item.prompts.forEach(function(p) {
          html += '<div class="history-prompt">';
          html += '<div class="history-prompt-label">' + esc(p.label) + '</div>';
          html += '<div class="history-prompt-text">' + esc(p.text) + '</div>';
          html += '<button class="history-copy" data-text="' + escAttr(p.text) + '">Copy</button>';
          html += '</div>';
        });
      }

      html += '</div></div>';
    });

    html += '<button class="clear-btn" id="clearHistory">Clear History</button>';
    historyList.innerHTML = html;

    // Toggle expand
    historyList.querySelectorAll('.history-item').forEach(function(el) {
      el.addEventListener('click', function(e) {
        if (e.target.classList.contains('history-copy')) return;
        el.classList.toggle('expanded');
      });
    });

    // Copy buttons
    historyList.querySelectorAll('.history-copy').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.text);
        btn.textContent = 'Copied!';
        setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
      });
    });

    // Clear
    var clearBtn = document.getElementById('clearHistory');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        chrome.runtime.sendMessage({ type: 'clear_history' }, function() {
          loadHistory();
        });
      });
    }
  });
}

function esc(s) {
  var d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function escAttr(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Load history on startup
loadHistory();
