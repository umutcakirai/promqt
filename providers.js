// Multi-provider AI API client (OpenAI, Gemini, Claude)

const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4.1', name: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano' },
      { id: 'o4-mini', name: 'o4 Mini' },
    ],
    async call(apiKey, model, systemPrompt, userPrompt) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.choices[0].message.content;
    },
  },

  gemini: {
    name: 'Google Gemini',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    ],
    async call(apiKey, model, systemPrompt, userPrompt) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.candidates[0].content.parts[0].text;
    },
  },

  claude: {
    name: 'Anthropic Claude',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-haiku-35-20241022', name: 'Claude Haiku 3.5' },
    ],
    async call(apiKey, model, systemPrompt, userPrompt) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.content[0].text;
    },
  },
};

async function callProvider(provider, apiKey, model, systemPrompt, userPrompt) {
  const p = PROVIDERS[provider];
  if (!p) throw new Error(`Unknown provider: ${provider}`);
  return p.call(apiKey, model, systemPrompt, userPrompt);
}
