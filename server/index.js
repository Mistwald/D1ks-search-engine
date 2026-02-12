const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple proxy endpoint to call external search APIs securely from server-side.
// Configure your API key in environment variables (e.g., BING_API_KEY).
app.post('/api/search/proxy', async (req, res) => {
  const { q } = req.body;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  // Example: proxy to Bing Custom Search (replace with your provider)
  const key = process.env.BING_API_KEY;
  if (!key) return res.status(500).json({ error: 'Server API key not configured' });

  try {
    const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': key } });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy request failed' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// MeiliSearch integration endpoints
const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_MASTER_KEY = process.env.MEILI_MASTER_KEY || process.env.MEILI_KEY;

app.post('/api/index/add', async (req, res) => {
  const docs = req.body.documents;
  if (!docs || !Array.isArray(docs)) return res.status(400).json({ error: 'Missing documents array' });
  if (!MEILI_MASTER_KEY) return res.status(500).json({ error: 'Meili master key not configured' });

  try {
    const url = `${MEILI_HOST}/indexes/pages/documents`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Meili-API-Key': MEILI_MASTER_KEY
      },
      body: JSON.stringify(docs)
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Indexing failed', details: err.message });
  }
});

app.post('/api/search/meili', async (req, res) => {
  const { q, limit = 10, offset = 0 } = req.body;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  if (!MEILI_MASTER_KEY) return res.status(500).json({ error: 'Meili master key not configured' });

  try {
    const url = `${MEILI_HOST}/indexes/pages/search`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Meili-API-Key': MEILI_MASTER_KEY
      },
      body: JSON.stringify({ q, limit, offset })
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Meili search failed', details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
