# Dice Roller

A lightweight, offline-first dice rolling web app. Roll one or more dice with a single tap — no installation required.

## Features

- **Offline-first**: Works without an internet connection using a service worker
- **PWA**: Installable as a native-like app on mobile and desktop
- **Dark/Light theme**: Toggle between themes with persistence
- **Configurable dice count**: Roll 1 to as many dice as you want
- **Roll history**: Track your recent rolls with a clear option
- **Crypto-secure randomness**: Uses `crypto.getRandomValues()` for fair rolls
- **Responsive design**: Optimized for mobile, works on desktop too

## Getting Started

No build step or dependencies required. Just open `index.html` in a modern browser.

### Local development

```bash
# Open the HTML file directly
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or serve it with any static server:

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .

# PHP
php -S localhost:8080
```

Then navigate to `http://localhost:8080`.

### Service Worker

The service worker (`sw.js`) caches assets for offline use. To register it properly, serve the project over `http://` or `https://` (not `file://`), as service workers require a proper origin.

## Project Structure

```
.
├── index.html          # Main HTML entry point
├── manifest.webmanifest # PWA manifest (name, icons, display mode)
├── sw.js               # Service worker for offline caching
├── css/
│   └── styles.css      # All styles (CSS custom properties, responsive layout)
├── js/
│   └── main.js         # Application logic (state, rendering, storage)
└── icons/              # PWA icons (192x192, 512x512)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, flexbox, responsive units) |
| Logic | Vanilla JavaScript (ES6+, IIFE pattern) |
| PWA | Service Worker, Web App Manifest |
| Storage | localStorage |
| Randomness | Web Crypto API |

## Browser Support

- Chrome / Edge 90+
- Firefox 90+
- Safari 14+
- Opera 75+

## License

[CC0 1.0 Universal (Public Domain)](https://creativecommons.org/publicdomain/zero/1.0/)

You may copy, modify, distribute, and use this project for any purpose — commercial or personal — without asking permission.

## AI Usage Disclosure

This project was developed with assistance from Local AI for pair programming. AI was used for:

- Code/asset generation and scaffolding
- Bug fixing and refactoring
- Documentation
