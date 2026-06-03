# Big MAQ Interactive Story Engine

A lightweight, privacy-first Twine-style educational editor by Big MAQ Studio.

## Features

- Visual branching editor with draggable colored scenes and automatic layout
- Start scenes, choices, continue transitions, endings, and optional bonus text
- Undo/redo, search, tags, chapters, analytics, and in-editor playtesting
- Variables, choice conditions, and choice effects for classroom-friendly logic
- Stronger story verification with warnings for missing endings, unreachable scenes, loops, unsafe expressions, and weak scene structure
- Local IndexedDB autosave, manual save, JSON import/export, all-project export, backup versions, and clear-data controls
- View-only and editable `.story.json` sharing modes, with editable passcodes stored locally in the library
- Standalone HTML export and printable SVG story-map export
- Reader mode with endings, bonus text, path tracking, local media, optional HTTPS media, and explicit consent before loading remote images
- Credits and short dev log page for Big MAQ Studio
- Installable offline-first PWA deployed as a standalone Next.js app

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Privacy

Stories are stored in the browser. There is no account, tracking, analytics, cloud database, or server-side story storage.
