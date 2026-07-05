const { getData, setData } = require('./_lib/kv');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const data = await getData();
  if (req.method === 'GET') return res.json(data.news);
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'invalid JSON' }); } }
    data.news = body;
    await setData(data);
    return res.json({ ok: true });
  }
  return res.status(405).json({ error: 'method not allowed' });
};
