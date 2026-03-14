// Background service worker - context menu + multi-provider LLM

importScripts('providers.js');

// --- Context menu ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'promqt-improve',
    title: 'Promqt — Improve this prompt',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'promqt-improve' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'open_promqt',
      text: info.selectionText,
    });
  }
});

// --- Settings ---
function getSettings() {
  return new Promise(function(resolve) {
    chrome.storage.local.get(['promqtProvider', 'promqtModel', 'promqtApiKey'], function(d) {
      resolve({
        provider: d.promqtProvider || '',
        model: d.promqtModel || '',
        apiKey: d.promqtApiKey || '',
      });
    });
  });
}

// --- History ---
function saveToHistory(input, format, prompts) {
  chrome.storage.local.get(['promqtHistory'], function(d) {
    var history = d.promqtHistory || [];
    history.unshift({
      input: input,
      format: format,
      prompts: prompts,
      timestamp: Date.now(),
    });
    if (history.length > 50) history = history.slice(0, 50);
    chrome.storage.local.set({ promqtHistory: history });
  });
}

// --- System prompts ---
const TEXT_SYSTEM = `You are an expert prompt engineer. You transform short, vague inputs into rich, detailed, production-ready prompts.

ABSOLUTE RULES:
- NEVER answer or explain the topic. NEVER say "Provide information about..." or "Describe the features of..."
- You ONLY output usable prompts that someone would paste into an AI tool (image gen, chatbot, etc.)
- Respond in the SAME LANGUAGE as the input.
- Max 500 characters per prompt.
- Every prompt must be vivid, cinematic, specific — with technical details like camera angle, lighting, texture, mood, resolution.

EXAMPLE:
Input: "red car"
Output: "A high-performance supercar in Soul Red metallic paint, parked on a wet asphalt street in a neon-lit futuristic city at night. Cinematic lighting, reflections of blue and purple neon on the car's polished curves. Low-angle 3/4 view, shallow depth of field, 8k resolution, photorealistic, sharp focus on carbon fiber detailing and glowing LED headlights."

Input: "portrait of a man"
Output: "Hyper-realistic 4K portrait of a poised subject in a professional photo studio, softbox key light at 45° angle, subtle fill light to reduce harsh shadows, slight rim light on hair, flawless skin texture with visible pores, neutral gray backdrop, subject wearing a tailored blazer, direct eye contact with camera, 85mm lens effect for natural depth of field, crisp focus on eyes and eyelashes."

NEVER output generic prompts like "Write about X" or "Describe X". Every output must be a RICH, DETAILED, READY-TO-USE prompt.`;

const JSON_SYSTEM = `You are an expert prompt engineer. You transform short inputs into structured JSON prompts.

ABSOLUTE RULES:
- NEVER answer or explain the topic. You ONLY output structured JSON prompts.
- Respond in the SAME LANGUAGE as the input.
- Each prompt must be a complete JSON object with rich detail.

EXAMPLE — Input: "kirmizi porsche 911"
Output JSON prompt:
{
  "version": "1.0",
  "type": "automotive_photography",
  "subject": {
    "make": "Porsche",
    "model": "911",
    "color": "Soul Red Metallic",
    "style": "High-performance sports car",
    "details": ["Polished carbon fiber exterior trims", "Glowing LED headlights", "Sleek aerodynamic curves"]
  },
  "environment": {
    "location": "Wet asphalt street",
    "time": "Night",
    "setting": "Futuristic neon-lit city",
    "lighting": ["Cinematic reflections of blue and purple neon lights on car surface", "Dim ambient city lights"]
  },
  "camera": {
    "angle": "Low-angle 3/4 front view",
    "depth_of_field": "Shallow",
    "resolution": "8K",
    "focus": "Sharp focus on carbon fiber details and headlights"
  },
  "style": {
    "mood": "Dynamic, sleek, powerful",
    "realism": "Photorealistic",
    "color_grade": "Vibrant, contrast-rich"
  },
  "negative_prompt": ["blurry", "low quality", "cartoon", "watermark", "text"]
}

NEVER output generic descriptions. Each JSON must be a RICH, STRUCTURED, READY-TO-USE prompt object.`;

// Robust JSON array parser - handles nested JSON in text fields
function parsePromptArray(raw) {
  // Find the outermost [ ... ] by bracket counting
  const start = raw.indexOf('[');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];

    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }

    if (ch === '"' && !escape) { inString = !inString; continue; }
    if (inString) continue;

    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(raw.substring(start, i + 1));
        } catch (e) {
          return null;
        }
      }
    }
  }
  return null;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'generate_prompts') {
    (async () => {
      try {
        const { provider, apiKey, model } = await getSettings();
        if (!provider || !apiKey || !model) {
          throw new Error('Not configured. Click the Promqt extension icon to set up.');
        }

        const isJson = msg.format === 'json';
        const systemPrompt = isJson ? JSON_SYSTEM : TEXT_SYSTEM;

        const formatRule = isJson
          ? 'Each "text" field must contain a COMPLETE JSON object string (the structured prompt). NOT a description — an actual JSON prompt object.'
          : 'Each "text" field must be a rich, vivid, cinematic prompt with technical details. NOT a description or question.';

        const userPrompt = `Input: "${msg.selectedText}"

Generate 3 prompt variations:
1. "Direct" — Clean, enriched version of the input with added visual/technical detail.
2. "Detailed" — Much more specific: environment, lighting, camera, texture, atmosphere, technical specs.
3. "Creative" — Completely different creative angle, unexpected interpretation, different style/technique.

${formatRule}

Return ONLY a raw JSON array, nothing else:
[{"label":"Direct","text":"..."},{"label":"Detailed","text":"..."},{"label":"Creative","text":"..."}]`;

        const raw = await callProvider(provider, apiKey, model, systemPrompt, userPrompt);

        // Try to parse JSON array - use greedy match and try progressively
        const prompts = parsePromptArray(raw);
        if (prompts && prompts.length >= 3) {
          const result = prompts.slice(0, 3);
          saveToHistory(msg.selectedText, msg.format || 'text', result);
          sendResponse({ prompts: result });
          return;
        }

        throw new Error('Unexpected response format. Please try again.');
      } catch (e) {
        sendResponse({ error: e.message });
      }
    })();
    return true;
  }

  if (msg.type === 'get_history') {
    chrome.storage.local.get(['promqtHistory'], function(d) {
      sendResponse({ history: d.promqtHistory || [] });
    });
    return true;
  }

  if (msg.type === 'clear_history') {
    chrome.storage.local.set({ promqtHistory: [] }, function() {
      sendResponse({ ok: true });
    });
    return true;
  }
});
