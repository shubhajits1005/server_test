const { kv } = require('@vercel/kv');

const DEFAULTS = {
  news: [
    { "id": 1, "title": "AI Breakthrough Reshapes Industry", "category": "Tech", "date": "2026-06-22", "image": "", "icon": "🤖", "excerpt": "A new model achieves human-level reasoning on benchmark tests, signaling a leap forward for the field.", "content": "Researchers announced a major breakthrough today as the new model surpassed human baselines on a suite of reasoning benchmarks. Industry experts say the result will accelerate deployment across healthcare, finance, and education. The team plans to open-source the evaluation suite next month." },
    { "id": 2, "title": "Global Markets Hit Record Highs", "category": "Business", "date": "2026-06-21", "image": "", "icon": "📈", "excerpt": "Equities rallied worldwide as central banks signaled a coordinated easing cycle.", "content": "Stock indexes closed at record highs across major exchanges. The rally was driven by dovish commentary from several central bank officials. Analysts expect continued momentum into the next quarter, though some warn of stretched valuations in tech." },
    { "id": 3, "title": "Mars Mission Reaches Orbit", "category": "Science", "date": "2026-06-20", "image": "", "icon": "🚀", "excerpt": "A crewed mission successfully entered Martian orbit, paving the way for a surface landing next year.", "content": "The spacecraft completed a 7-minute orbital insertion burn on schedule. The crew of four reported all systems nominal and are preparing for a survey of candidate landing sites. The mission is the first crewed flight beyond the Moon." },
    { "id": 4, "title": "Climate Summit Reaches Historic Deal", "category": "World", "date": "2026-06-19", "image": "", "icon": "🌍", "excerpt": "Nations agreed on a binding framework to phase out coal by 2035.", "content": "After two weeks of negotiation, delegates from 195 countries signed a binding agreement to phase out unabated coal power by 2035. The deal includes a $200B annual fund to support developing nations in the transition." },
    { "id": 5, "title": "Quantum Internet Demo Succeeds", "category": "Tech", "date": "2026-06-18", "image": "", "icon": "⚛️", "excerpt": "Entangled photons linked three cities in a working quantum network prototype.", "content": "Engineers demonstrated quantum key distribution across a 600km network linking three metropolitan areas. The test marks a major step toward a continent-scale quantum internet within the next decade." },
    { "id": 6, "title": "Football Championship Final Set", "category": "Sports", "date": "2026-06-17", "image": "", "icon": "⚽", "excerpt": "Two underdogs will meet in the final after dramatic semi-final upsets.", "content": "In a weekend of surprises, both favored teams were eliminated in the semi-finals. The final is scheduled for next Sunday and is expected to draw a record global audience." }
  ],
  videos: [
    { "id": 1, "title": "How AI Models Actually Think", "category": "Tech", "thumb": "", "icon": "🤖", "desc": "A clear walkthrough of how modern AI systems process language and produce responses.", "url": "https://www.youtube.com/embed/aircAruvnKk" },
    { "id": 2, "title": "Inside the Mars Mission Control", "category": "Science", "thumb": "", "icon": "🚀", "desc": "Behind the scenes with the engineers who pulled off the historic orbital insertion.", "url": "https://www.youtube.com/embed/D8pVLgHaViY" },
    { "id": 3, "title": "Markets Explained in 10 Minutes", "category": "Business", "thumb": "", "icon": "📈", "desc": "A quick, jargon-free tour of how global equity markets actually work.", "url": "https://www.youtube.com/embed/ZCFkWDdmXG8" },
    { "id": 4, "title": "Quantum Computing for Beginners", "category": "Science", "thumb": "", "icon": "⚛️", "desc": "Qubits, superposition, and entanglement — explained without the math.", "url": "https://www.youtube.com/embed/QuR969cFz_g" },
    { "id": 5, "title": "Climate Tech: What Actually Works", "category": "World", "thumb": "", "icon": "🌍", "desc": "A grounded look at which climate technologies are delivering real emissions cuts.", "url": "https://www.youtube.com/embed/1LaJ5DDmsvk" },
    { "id": 6, "title": "Top 10 Goals of the Season", "category": "Sports", "thumb": "", "icon": "⚽", "desc": "A countdown of the most spectacular goals from this season's championships.", "url": "https://www.youtube.com/embed/2vjPBrBU-TM" }
  ],
  credentials: { username: "admin", password: "admin123" },
  prefs: { linkTarget: "_blank" }
};

const KV_KEY = 'short_news_data';

async function getData() {
  try {
    const data = await kv.get(KV_KEY);
    if (data) return data;
    await kv.set(KV_KEY, DEFAULTS);
    return DEFAULTS;
  } catch (err) {
    console.error('KV error:', err);
    return DEFAULTS;
  }
}

async function setData(data) {
  await kv.set(KV_KEY, data);
}

module.exports = { getData, setData };
