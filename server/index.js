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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
