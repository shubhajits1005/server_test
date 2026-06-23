/* ===== Seed data ===== */
const SEED_NEWS = [
    { id: 1, title: "AI Breakthrough Reshapes Industry", category: "Tech", date: "2026-06-22", image: "", icon: "🤖", excerpt: "A new model achieves human-level reasoning on benchmark tests, signaling a leap forward for the field.", content: "Researchers announced a major breakthrough today as the new model surpassed human baselines on a suite of reasoning benchmarks. Industry experts say the result will accelerate deployment across healthcare, finance, and education. The team plans to open-source the evaluation suite next month." },
    { id: 2, title: "Global Markets Hit Record Highs", category: "Business", date: "2026-06-21", image: "", icon: "📈", excerpt: "Equities rallied worldwide as central banks signaled a coordinated easing cycle.", content: "Stock indexes closed at record highs across major exchanges. The rally was driven by dovish commentary from several central bank officials. Analysts expect continued momentum into the next quarter, though some warn of stretched valuations in tech." },
    { id: 3, title: "Mars Mission Reaches Orbit", category: "Science", date: "2026-06-20", image: "", icon: "🚀", excerpt: "A crewed mission successfully entered Martian orbit, paving the way for a surface landing next year.", content: "The spacecraft completed a 7-minute orbital insertion burn on schedule. The crew of four reported all systems nominal and are preparing for a survey of candidate landing sites. The mission is the first crewed flight beyond the Moon." },
    { id: 4, title: "Climate Summit Reaches Historic Deal", category: "World", date: "2026-06-19", image: "", icon: "🌍", excerpt: "Nations agreed on a binding framework to phase out coal by 2035.", content: "After two weeks of negotiation, delegates from 195 countries signed a binding agreement to phase out unabated coal power by 2035. The deal includes a $200B annual fund to support developing nations in the transition." },
    { id: 5, title: "Quantum Internet Demo Succeeds", category: "Tech", date: "2026-06-18", image: "", icon: "⚛️", excerpt: "Entangled photons linked three cities in a working quantum network prototype.", content: "Engineers demonstrated quantum key distribution across a 600km network linking three metropolitan areas. The test marks a major step toward a continent-scale quantum internet within the next decade." },
    { id: 6, title: "Football Championship Final Set", category: "Sports", date: "2026-06-17", image: "", icon: "⚽", excerpt: "Two underdogs will meet in the final after dramatic semi-final upsets.", content: "In a weekend of surprises, both favored teams were eliminated in the semi-finals. The final is scheduled for next Sunday and is expected to draw a record global audience." }
];

const SEED_VIDEOS = [
    { id: 1, title: "How AI Models Actually Think", category: "Tech", thumb: "", icon: "🤖", desc: "A clear walkthrough of how modern AI systems process language and produce responses.", url: "https://www.youtube.com/embed/aircAruvnKk" },
    { id: 2, title: "Inside the Mars Mission Control", category: "Science", thumb: "", icon: "🚀", desc: "Behind the scenes with the engineers who pulled off the historic orbital insertion.", url: "https://www.youtube.com/embed/D8pVLgHaViY" },
    { id: 3, title: "Markets Explained in 10 Minutes", category: "Business", thumb: "", icon: "📈", desc: "A quick, jargon-free tour of how global equity markets actually work.", url: "https://www.youtube.com/embed/ZCFkWDdmXG8" },
    { id: 4, title: "Quantum Computing for Beginners", category: "Science", thumb: "", icon: "⚛️", desc: "Qubits, superposition, and entanglement — explained without the math.", url: "https://www.youtube.com/embed/QuR969cFz_g" },
    { id: 5, title: "Climate Tech: What Actually Works", category: "World", thumb: "", icon: "🌍", desc: "A grounded look at which climate technologies are delivering real emissions cuts.", url: "https://www.youtube.com/embed/1LaJ5DDmsvk" },
    { id: 6, title: "Top 10 Goals of the Season", category: "Sports", thumb: "", icon: "⚽", desc: "A countdown of the most spectacular goals from this season's championships.", url: "https://www.youtube.com/embed/2vjPBrBU-TM" }
];

/* ===== Storage ===== */
function getNews() {
    const raw = localStorage.getItem('nexnews_news');
    if (raw) return JSON.parse(raw);
    localStorage.setItem('nexnews_news', JSON.stringify(SEED_NEWS));
    return SEED_NEWS;
}
function saveNews(list) { localStorage.setItem('nexnews_news', JSON.stringify(list)); }

function getVideos() {
    const raw = localStorage.getItem('nexnews_videos');
    if (raw) return JSON.parse(raw);
    localStorage.setItem('nexnews_videos', JSON.stringify(SEED_VIDEOS));
    return SEED_VIDEOS;
}
function saveVideos(list) { localStorage.setItem('nexnews_videos', JSON.stringify(list)); }

/* ===== Helpers ===== */
function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function formatDate(d) {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ===== Renderers ===== */
function newsCardHtml(n) {
    return `
    <article class="news-card" onclick='openArticle(${n.id})'>
        <div class="news-card-img">${n.icon || '📰'}</div>
        <div class="news-card-body">
            <span class="news-card-category">${escapeHtml(n.category)}</span>
            <h3 class="news-card-title">${escapeHtml(n.title)}</h3>
            <div class="news-card-meta">${formatDate(n.date)}</div>
            <p class="news-card-excerpt">${escapeHtml(n.excerpt || '')}</p>
        </div>
    </article>`;
}

function newsListItemHtml(n) {
    return `
    <article class="news-list-item" onclick='openArticle(${n.id})'>
        <div class="news-list-thumb">${n.icon || '📰'}</div>
        <div>
            <span class="news-card-category">${escapeHtml(n.category)}</span>
            <h3 class="news-card-title">${escapeHtml(n.title)}</h3>
            <div class="news-card-meta">${formatDate(n.date)}</div>
            <p class="news-card-excerpt">${escapeHtml(n.excerpt || '')}</p>
        </div>
    </article>`;
}

function videoCardHtml(v) {
    return `
    <article class="video-card" onclick='openVideo(${v.id})'>
        <div class="video-thumb">${v.icon || '🎬'}</div>
        <div class="video-card-body">
            <span class="news-card-category">${escapeHtml(v.category)}</span>
            <h3 class="video-card-title">${escapeHtml(v.title)}</h3>
            <div class="video-card-meta">Click to watch</div>
        </div>
    </article>`;
}

function openArticle(id) {
    const n = getNews().find(x => x.id === id);
    if (!n) return;
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <div class="modal-image">${n.icon || '📰'}</div>
        <span class="news-card-category">${escapeHtml(n.category)}</span>
        <h2>${escapeHtml(n.title)}</h2>
        <div class="modal-meta">${formatDate(n.date)}</div>
        <p>${escapeHtml(n.content || n.excerpt || '')}</p>
    `;
    document.getElementById('articleModal').classList.add('active');
}

function closeModal() {
    document.getElementById('articleModal').classList.remove('active');
}

function openVideo(id) {
    const v = getVideos().find(x => x.id === id);
    if (!v) return;
    const body = document.getElementById('videoModalBody');
    let embed = '';
    const url = v.url || '';
    if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com')) {
        embed = `<iframe class="video-iframe" src="${escapeHtml(url)}" frameborder="0" allowfullscreen></iframe>`;
    } else if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1].split('&')[0];
        embed = `<iframe class="video-iframe" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`;
    } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        embed = `<iframe class="video-iframe" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`;
    } else if (url) {
        embed = `<video class="video-iframe" controls src="${escapeHtml(url)}"></video>`;
    } else {
        embed = `<div class="modal-image">${v.icon || '🎬'}</div>`;
    }
    body.innerHTML = `
        ${embed}
        <span class="news-card-category">${escapeHtml(v.category)}</span>
        <h2>${escapeHtml(v.title)}</h2>
        <p>${escapeHtml(v.desc || '')}</p>
    `;
    document.getElementById('videoModal').classList.add('active');
}

function closeVideoModal() {
    document.getElementById('videoModal').classList.remove('active');
}

/* ===== Page renderers ===== */
function renderNewsList() {
    const list = getNews();
    const container = document.getElementById('newsList');
    if (!container) return;
    if (list.length === 0) {
        container.innerHTML = `<div class="empty"><div class="empty-icon">📭</div>No news yet.</div>`;
        return;
    }
    container.innerHTML = list.map(newsListItemHtml).join('');
}

function renderVideosFull() {
    const list = getVideos();
    const container = document.getElementById('videoGridFull');
    if (!container) return;
    if (list.length === 0) {
        container.innerHTML = `<div class="empty"><div class="empty-icon">🎬</div>No videos yet.</div>`;
        return;
    }
    container.innerHTML = list.map(videoCardHtml).join('');
}

function renderHome() {
    const news = getNews().slice(0, 6);
    const videos = getVideos().slice(0, 6);
    document.getElementById('newsGrid').innerHTML = news.map(newsCardHtml).join('') || '<div class="empty">No news yet.</div>';
    document.getElementById('videoGrid').innerHTML = videos.map(videoCardHtml).join('') || '<div class="empty">No videos yet.</div>';
}

/* ===== Search ===== */
function searchContent() {
    const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    if (!q) {
        if (typeof renderNewsList === 'function' && document.getElementById('newsList')) renderNewsList();
        if (document.getElementById('newsGrid')) renderHome();
        if (document.getElementById('videoGridFull')) renderVideosFull();
        return;
    }
    const news = getNews().filter(n => (n.title + n.category + n.content).toLowerCase().includes(q));
    const videos = getVideos().filter(v => (v.title + v.category + v.desc).toLowerCase().includes(q));

    const ng = document.getElementById('newsGrid');
    const vg = document.getElementById('videoGrid');
    const nl = document.getElementById('newsList');
    const vgf = document.getElementById('videoGridFull');

    if (ng) ng.innerHTML = news.map(newsCardHtml).join('') || '<div class="empty">No results.</div>';
    if (vg) vg.innerHTML = videos.map(videoCardHtml).join('') || '<div class="empty">No results.</div>';
    if (nl) nl.innerHTML = news.map(newsListItemHtml).join('') || '<div class="empty">No results.</div>';
    if (vgf) vgf.innerHTML = videos.map(videoCardHtml).join('') || '<div class="empty">No results.</div>';
}

/* ===== Admin ===== */
function getCredentials() {
    const raw = localStorage.getItem('nexnews_admin');
    if (raw) return JSON.parse(raw);
    const def = { username: 'admin', password: 'admin123' };
    localStorage.setItem('nexnews_admin', JSON.stringify(def));
    return def;
}

function saveCredentials(c) { localStorage.setItem('nexnews_admin', JSON.stringify(c)); }

function login() {
    const u = document.getElementById('adminUser').value;
    const p = document.getElementById('adminPass').value;
    const creds = getCredentials();
    if (u === creds.username && p === creds.password) {
        sessionStorage.setItem('isAdmin', 'yes');
        showDashboard();
    } else {
        alert('Invalid credentials.');
    }
}

function changeCredentials(e) {
    e.preventDefault();
    const curU = document.getElementById('currentUser').value;
    const curP = document.getElementById('currentPass').value;
    const newU = document.getElementById('newUser').value.trim();
    const newP = document.getElementById('newPass').value;
    const confP = document.getElementById('confirmPass').value;
    const creds = getCredentials();
    if (curU !== creds.username || curP !== creds.password) {
        alert('Current username or password is incorrect.');
        return;
    }
    if (!newU || !newP) {
        alert('New username and password are required.');
        return;
    }
    if (newP !== confP) {
        alert('New password and confirmation do not match.');
        return;
    }
    saveCredentials({ username: newU, password: newP });
    alert('Credentials updated. Please log in again.');
    logout();
}

function logout() {
    sessionStorage.removeItem('isAdmin');
    location.reload();
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    const d = document.getElementById('dashboardScreen');
    d.style.display = 'block';
    d.style.minHeight = '100vh';
    renderAdminNews();
    renderAdminVideos();
    renderStats();
}

function showTab(id, btn) {
    document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function addNews(e) {
    e.preventDefault();
    const title = document.getElementById('newsTitle').value.trim();
    const category = document.getElementById('newsCategory').value.trim();
    const image = document.getElementById('newsImage').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    if (!title || !category || !content) return;
    const list = getNews();
    const id = list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
    const excerpt = content.length > 120 ? content.slice(0, 120) + '...' : content;
    list.unshift({ id, title, category, image, content, excerpt, date: new Date().toISOString().slice(0,10), icon: '📰' });
    saveNews(list);
    e.target.reset();
    renderAdminNews();
    renderStats();
}

function addVideo(e) {
    e.preventDefault();
    const title = document.getElementById('videoTitle').value.trim();
    const category = document.getElementById('videoCategory').value.trim();
    const thumb = document.getElementById('videoThumb').value.trim();
    const url = document.getElementById('videoUrl').value.trim();
    const desc = document.getElementById('videoDesc').value.trim();
    if (!title || !category || !url || !desc) return;
    const list = getVideos();
    const id = list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
    list.unshift({ id, title, category, thumb, url, desc, icon: '🎬' });
    saveVideos(list);
    e.target.reset();
    renderAdminVideos();
    renderStats();
}

function deleteNews(id) {
    if (!confirm('Delete this article?')) return;
    saveNews(getNews().filter(n => n.id !== id));
    renderAdminNews();
    renderStats();
}

function deleteVideo(id) {
    if (!confirm('Delete this video?')) return;
    saveVideos(getVideos().filter(v => v.id !== id));
    renderAdminVideos();
    renderStats();
}

function renderAdminNews() {
    const list = getNews();
    const c = document.getElementById('adminNewsList');
    if (!c) return;
    if (list.length === 0) {
        c.innerHTML = '<div class="empty">No articles yet.</div>';
        return;
    }
    c.innerHTML = list.map(n => `
        <div class="admin-list-item">
            <div class="admin-list-info">
                <strong>${escapeHtml(n.title)}</strong>
                <span>${escapeHtml(n.category)} • ${formatDate(n.date)}</span>
            </div>
            <button class="delete-btn" onclick="deleteNews(${n.id})">Delete</button>
        </div>
    `).join('');
}

function renderAdminVideos() {
    const list = getVideos();
    const c = document.getElementById('adminVideoList');
    if (!c) return;
    if (list.length === 0) {
        c.innerHTML = '<div class="empty">No videos yet.</div>';
        return;
    }
    c.innerHTML = list.map(v => `
        <div class="admin-list-item">
            <div class="admin-list-info">
                <strong>${escapeHtml(v.title)}</strong>
                <span>${escapeHtml(v.category)}</span>
            </div>
            <button class="delete-btn" onclick="deleteVideo(${v.id})">Delete</button>
        </div>
    `).join('');
}

function renderStats() {
    const c = document.getElementById('statsGrid');
    if (!c) return;
    const news = getNews();
    const videos = getVideos();
    const cats = new Set();
    news.forEach(n => cats.add(n.category));
    videos.forEach(v => cats.add(v.category));
    c.innerHTML = `
        <div class="stat-card"><h3>📰 Total News</h3><div class="stat-num">${news.length}</div></div>
        <div class="stat-card"><h3>🎬 Total Videos</h3><div class="stat-num">${videos.length}</div></div>
        <div class="stat-card"><h3>🏷️ Categories</h3><div class="stat-num">${cats.size}</div></div>
        <div class="stat-card"><h3>🗂️ Total Items</h3><div class="stat-num">${news.length + videos.length}</div></div>
    `;
}

/* Close modal on backdrop click */
document.addEventListener('click', e => {
    if (e.target.id === 'articleModal') closeModal();
    if (e.target.id === 'videoModal') closeVideoModal();
});
