# Privacy Policy for Promqt

**Last updated: March 14, 2026**

## Overview

Promqt is an open-source Chrome extension that helps users improve their AI prompts. We are committed to protecting your privacy.

## Data Collection

Promqt does **not** collect, store, or transmit any personal data to our servers. We do not have servers.

## What Promqt Accesses

- **Selected text**: When you trigger Promqt (via text selection, Ctrl+C C, or right-click), the selected text is sent directly from your browser to your chosen AI provider (OpenAI, Google Gemini, or Anthropic Claude) using your own API key.
- **API key**: Your API key is stored locally in your browser's storage (`chrome.storage.local`). It is never sent anywhere except to the AI provider you selected.
- **Prompt history**: Your past prompts and results are stored locally in your browser. They are never transmitted externally.

## Third-Party Services

Promqt sends your selected text to one of the following services, depending on your configuration:

- OpenAI (api.openai.com)
- Google Gemini (generativelanguage.googleapis.com)
- Anthropic Claude (api.anthropic.com)

These requests are made directly from your browser using your own API key. Promqt does not proxy, log, or intercept these requests. Please refer to each provider's privacy policy for information on how they handle your data.

## Data Storage

All data (settings, API key, history) is stored locally in your browser using `chrome.storage.local`. No data is stored on external servers.

## Data Sharing

We do not sell, share, or transfer any user data to third parties.

## Open Source

Promqt is fully open source under the MIT License. You can review the complete source code at https://github.com/umutcakirai/promqt

## Contact

For questions about this privacy policy, please open an issue at https://github.com/umutcakirai/promqt/issues

## Changes

Any changes to this privacy policy will be reflected in this document and in the GitHub repository.
