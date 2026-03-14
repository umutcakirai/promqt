# Contributing to Promqt

Thanks for your interest in contributing to Promqt!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/promqt.git`
3. Create a branch: `git checkout -b my-feature`

## Extension Development

The extension lives in the `extension/` folder. It's plain JavaScript with no build step.

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" and select the `extension` folder
4. Make changes, then click the refresh icon on the extension card

## Landing Page Development

```bash
npm install
npm run dev
```

## Pull Request Guidelines

- Keep PRs focused on a single change
- Test your changes in Chrome before submitting
- Write clear commit messages
- Update the README if you add new features

## Ideas

- Support more AI providers (Mistral, Cohere, Ollama/local models)
- Keyboard shortcut customization
- Custom system prompts / prompt templates
- Firefox / Edge / Safari ports
- i18n and localization
- Better prompt engineering for specific use cases (coding, image gen, writing)

## Code Style

- No build tools for the extension, keep it simple
- Use clear variable names
- Keep files small and focused

## Questions?

Open an issue at https://github.com/umutcakirai/promqt/issues
