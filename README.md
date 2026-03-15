<div align="center">

<img src="assets/logo.png" alt="Promqt" width="280" />

**Select text. Get better prompts.**

Open-source Chrome extension that turns any selected text into rich, detailed AI prompts.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](#-install)
[![GitHub Stars](https://img.shields.io/github/stars/umutcakirai/promqt?style=social)](https://github.com/umutcakirai/promqt)

**[English](#)** | **[Turkce](README.tr.md)**

<img src="assets/screenshot.png" alt="Promqt Screenshot" width="800" />

</div>

---

## What is Promqt?

Select any text on any website, and Promqt generates 3 improved versions of your prompt: **Direct**, **Detailed**, and **Creative**.

Works with ChatGPT, Claude, Gemini, Midjourney, DALL-E, Stable Diffusion, and any other AI tool.

## How it works

1. **Select text** on any website
2. **Trigger Promqt** using one of three methods:
   - Click the **✦ Promqt** button that appears above your selection
   - Press **Ctrl+C** twice quickly (like DeepL)
   - **Right-click** and select "Promqt"
3. **Pick a variation** and click **Use** to paste or **Copy** to clipboard

## Features

- **Text & JSON output** - Natural language or structured JSON for image gen tools
- **Bring your own AI** - OpenAI, Claude, Gemini. Your API key, your model
- **3 variations** - Direct, Detailed, Creative
- **Works everywhere** - Any website, any text
- **Prompt history** - Saved locally in your browser
- **Draggable panel** - Move it anywhere on the page
- **Privacy first** - No data collection, no tracking, no servers

## Install

> Chrome Web Store review is in progress. For now, install manually using one of the methods below.

### Option 1: Download ZIP (Easiest)

1. **[Download promqt-latest.zip](https://github.com/umutcakirai/promqt/releases/latest/download/promqt-latest.zip)**
2. Extract the ZIP file to a folder on your computer (remember where you extract it)
3. Open Chrome and type `chrome://extensions` in the address bar, press Enter
4. Turn on **Developer mode** (toggle switch in the **top right corner** of the page)
5. Click the **Load unpacked** button (appears in the top left after enabling Developer mode)
6. Navigate to and select the folder where you extracted the ZIP
7. Done! You'll see the Promqt icon in your Chrome toolbar (top right, near the puzzle icon)

> **Tip:** If you don't see the icon, click the puzzle piece icon in Chrome's toolbar and pin Promqt.

### Option 2: Clone with Git

```bash
git clone https://github.com/umutcakirai/promqt.git
```
Then follow steps 3-7 above, selecting the cloned `promqt` folder.

### Setup after install

1. Click the **Promqt icon** in your Chrome toolbar (or the puzzle piece icon > Promqt)
2. Go to **Settings** tab
3. Select your **Provider** (OpenAI, Google Gemini, or Anthropic Claude)
4. Select a **Model** from the dropdown:
   - OpenAI: GPT-4o, GPT-4.1, etc.
   - Gemini: Gemini 2.5 Flash, etc.
   - Claude: Claude Sonnet 4, etc.
5. Paste your **API Key** (get one from your provider):
   - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Gemini: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Claude: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
6. Click **Test Connection** to verify your key works
7. Click **Save**

Now go to any webpage, select some text, and try it out!

## Supported providers

| Provider | Models |
|----------|--------|
| **OpenAI** | GPT-4o, GPT-4o Mini, GPT-4.1, GPT-4.1 Mini, GPT-4.1 Nano, o4 Mini |
| **Google Gemini** | Gemini 2.5 Flash, Gemini 2.0 Flash, Gemini 2.5 Pro |
| **Anthropic Claude** | Claude Sonnet 4, Claude Haiku 3.5 |

## Project structure

```
promqt/
├── manifest.json     # Chrome extension manifest (MV3)
├── content.js        # Floating UI, text selection, Ctrl+C C
├── background.js     # API calls, context menu, history
├── providers.js      # OpenAI / Claude / Gemini API client
├── popup.html        # Settings UI
├── popup.js          # Settings logic
├── icons/            # Extension icons
├── LICENSE           # MIT
├── PRIVACY.md        # Privacy policy
└── CONTRIBUTING.md   # How to contribute
```

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b my-feature`
3. Make your changes
4. Push and open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Ideas for contributions
- More AI providers (Mistral, Cohere, Ollama/local models)
- Keyboard shortcut customization
- Custom system prompts / prompt templates
- Firefox / Safari port
- i18n / localization

## Privacy

Your API key stays in your browser. Selected text goes directly to your AI provider. No servers, no analytics, no tracking.

Full policy: [PRIVACY.md](PRIVACY.md)

## License

[MIT](LICENSE)
