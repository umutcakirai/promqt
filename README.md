<div align="center">

# promqt

**Select text. Get better prompts.**

Open-source Chrome extension that turns any selected text into rich, detailed AI prompts.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](#install)
[![GitHub Stars](https://img.shields.io/github/stars/umutcakirai/promqt?style=social)](https://github.com/umutcakirai/promqt)

</div>

---

## What is Promqt?

Select any text on any website, and Promqt generates 3 improved versions of your prompt: **Direct**, **Detailed**, and **Creative**.

Works with ChatGPT, Claude, Gemini, Midjourney, DALL-E, Stable Diffusion, and any other AI tool.

## How it works

1. **Select text** on any website
2. **Trigger Promqt**:
   - Click the **✦ Promqt** button that appears
   - Press **Ctrl+C** twice quickly
   - **Right-click** and select "Promqt"
3. **Pick a variation** and copy or paste it

## Features

- **Text & JSON output** - Natural language or structured JSON for image gen tools
- **Bring your own AI** - OpenAI, Claude, Gemini. Your API key, your model
- **3 variations** - Direct, Detailed, Creative
- **Works everywhere** - Any website, any text
- **Prompt history** - Saved locally in your browser
- **Draggable panel** - Move it anywhere
- **Privacy first** - No data collection, no tracking, no servers

## Install

### Chrome Web Store
Coming soon.

### Manual install
1. Clone the repo:
   ```bash
   git clone https://github.com/umutcakirai/promqt.git
   ```
2. Open `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the cloned folder
5. Click the Promqt icon, configure your AI provider and API key

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
