
# Skyon Chatbot — Extracted Components

This ZIP contains **only** the chatbot UI and behavior from the original “Skyon Bygg AS” website project. It excludes the landing-page sections and other site code.

## Included files (under `src/`)
- `components/ChatInterface.tsx` — Container with chat logic, message state, webhook calls, quick actions, downloads, reset, etc.
- `components/ComposerField.tsx` — The message input area, send/attach, mic UI.
- `components/MessageBubble.tsx` — Renders user/bot bubbles, markdown, code blocks, copy-to-clipboard, feedback icons.
- `components/TypingIndicator.tsx` — Animated “bot is typing…” indicator.
- `components/SkeletonMessage.tsx` — Loading placeholder bubble.
- `components/WelcomeSequence.tsx` — Welcome messages + quick action buttons.
- `components/PushBanner.tsx` — In-chat dismissible banner for push greetings/info.
- `components/PrivacyBanner.tsx` — Privacy notice shown on new chats and on reset.
- `lib/constants.ts` — Translations, quick actions, and `WEBHOOK_URL`.

Optional:
- `index.css` — Tailwind directives (only needed if your host app does not already include Tailwind).

## What you’ll need in the host app
- React 18 and TypeScript
- These packages used by the components:
  - `framer-motion`, `lucide-react`, `react-markdown`, `remark-gfm`, `react-syntax-highlighter`
  - TailwindCSS (optional but recommended, since components use Tailwind classes)
- Set the webhook URL via Vite env or replace the default in `lib/constants.ts`:
  - `VITE_WEBHOOK_URL="https://<your-n8n-or-backend>/webhook/.../chat"`

## Webhook contract (what the UI expects)
All requests are `POST <WEBHOOK_URL>` with JSON body:

- On **first visit** (auto-fired):
  ```json
  {"action":"firstVisit","sessionId":"<string>"}
  ```
  Response may include a push greeting:
  ```json
  {"type":"pushGreeting","pushMessage":"<string>","output":"<string|optional>"}
  ```

- On **send message**:
  ```json
  {"action":"sendMessage","sessionId":"<string>","chatInput":"<user text>"}
  ```
  Response **must** include the bot output text:
  ```json
  {"output":"<assistant reply>","pushMessage":"<optional string>"}
  ```

- On **reset chat**:
  ```json
  {"action":"reset","sessionId":"<string>"}
  ```

> If your backend returns different shapes, adjust the reads in `ChatInterface.tsx` where `response.json()` is handled.

## Minimal usage example
```tsx
import React, { useState } from 'react';
import ChatInterface from './src/components/ChatInterface';

export default function ChatDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}>Toggle chat</button>
      <ChatInterface isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
```

## Notes
- All chatbot features are client-side; conversation is sent to your webhook (`WEBHOOK_URL`).
- Translations/labels and quick actions live in `lib/constants.ts`.
- To change welcome text, quick replies, or privacy text, edit `TRANSLATIONS` in `lib/constants.ts`.
- To remove optional features (push banner, transcript download, reset), search for the corresponding handlers in `ChatInterface.tsx` and remove the UI blocks.

— Generated: 2025-08-31T10:49:06.227820Z
