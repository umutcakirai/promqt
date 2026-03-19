<div align="center">

<img src="assets/logo.png" alt="Promqt" width="280" />

**Select text. Get better prompts.**

Open-source Chrome extension that turns any selected text into rich, detailed AI prompts.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/promqt/goiofojidgjbmgajafipjieninlfalnm)
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

### Chrome Web Store (Recommended)

**[Install Promqt from Chrome Web Store](https://chromewebstore.google.com/detail/promqt/goiofojidgjbmgajafipjieninlfalnm)** — free, one click, auto-updates.

### Manual Install (for developers)

<details>
<summary>Option 1: Download ZIP</summary>

1. **[Download promqt-latest.zip](https://github.com/umutcakirai/promqt/releases/latest/download/promqt-latest.zip)**
2. Extract the ZIP file to a folder on your computer
3. Open Chrome → `chrome://extensions`
4. Turn on **Developer mode** (top right)
5. Click **Load unpacked** and select the extracted folder
6. Done!

</details>

<details>
<summary>Option 2: Clone with Git</summary>

```bash
git clone https://github.com/umutcakirai/promqt.git
```
Then load as unpacked extension in `chrome://extensions`.

</details>

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
