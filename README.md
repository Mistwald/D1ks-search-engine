# D1Ks Search Engine

A professional, modern search engine with advanced features including:

- 🔍 Intelligent search suggestions and autocomplete
- 📱 Fully responsive design
- 🌙 Dark/Light theme toggle
- ⌨️ Keyboard shortcuts
- 🎨 Beautiful opening animations
- 💾 Search history and caching
- ⚙️ Advanced search filters
- 🎯 Professional UI/UX

## 🚀 Features

### Search Capabilities
- Real-time search suggestions
- Search history tracking
- Advanced search filters (date, type, region)
- Result caching for performance

### User Experience
- Smooth animations and transitions
- Dark/light theme toggle
- Keyboard shortcuts (Ctrl+K, Ctrl+/, Ctrl+T)
- Mobile-responsive design
- Accessibility features

### Technical Features
- Local storage for preferences
- Intersection Observer animations
- Modal-based settings
- Professional pagination

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern animations and responsive design
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Professional icons
- **Google Fonts** - Roboto typography

## 📦 Deployment

This website is deployed on GitHub Pages and accessible at:
https://Mistwald.github.io/D1ks-search-engine

## Professional Search Engine roadmap

This repository now includes several scaffolds and improvements toward a production-ready search experience.

- Frontend improvements: PWA manifest, service worker (`/sw.js`), `robots.txt`, `sitemap.xml`, improved results styling.
- Local mock search with pagination (already implemented in `script.js`).
- Optional server proxy scaffold: `server/index.js` — use this to safely call paid search APIs (set `BING_API_KEY` env var).
- GitHub Actions workflow to publish to GitHub Pages on `main` (`.github/workflows/deploy.yml`).

Planned next steps (can implement sequentially):

1. Connect a paid search API (Bing/Google) via the server proxy for high-quality, real-world results.
2. Deploy a self-hosted search engine (MeiliSearch) and add a simple crawler to index content.
3. Create a scalable crawler + indexer with URL prioritization, deduplication, and ranking signals.
4. Add analytics, monitoring, and automated tests.

How to run the server scaffold (optional):

1. Install dependencies:

```bash
cd server
npm install express node-fetch cors
```

2. Start the server (configure `BING_API_KEY` if you plan to proxy to Bing):

```bash
BING_API_KEY=your_key node index.js
```

3. Use `/api/search/proxy` to POST `{ "q": "your query" }` from your frontend.

If you'd like, I can continue and implement the MeiliSearch indexer and crawler next — tell me to proceed and I will scaffold and deploy it.

---

**Built with ❤️ by D1Ks Team**
