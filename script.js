/* ===== Storage (server-based via Vercel KV) ===== */

let __linkTarget = '_blank';

async function api(url, data) {
  if (data !== undefined) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }
  const res = await fetch(url);
  return res.json();
}

async function getNews()    { return api('/api/news'); }
async function saveNews(list)   { await api('/api/news', list); }
async function getVideos()      { return api('/api/videos'); }
async function saveVideos(list) { await api('/api/videos', list); }
async function getCredentials() { return api('/api/credentials'); }
async function saveCredentials(c) { await api('/api/credentials', c); }

function getLinkTarget() { return __linkTarget; }
async function setLinkTarget(t) {
  __linkTarget = t;
  await api('/api/prefs', { linkTarget: t });
}

async function initLinkTarget() {
  try {
    const prefs = await api('/api/prefs');
    __linkTarget = prefs.linkTarget || '_blank';
  } catch { __linkTarget = '_blank'; }
}

/* ===== Helpers ===== */
function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* Extract a YouTube video id from any common YT URL form. Returns null if not YouTube. */
function getYouTubeId(url) {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/embed/')) {
      return url.split('youtube.com/embed/')[1].split(/[?&/]/)[0] || null;
    }
    if (url.includes('youtube.com/shorts/')) {
      return url.split('youtube.com/shorts/')[1].split(/[?&/]/)[0] || null;
    }
    if (url.includes('watch?v=')) {
      return url.split('watch?v=')[1].split('&')[0] || null;
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split(/[?&/]/)[0] || null;
    }
  } catch { return null; }
  return null;
}

function sanitizeUrl(u) {
  try {
    const url = new URL(u, location.origin);
    if (['http:', 'https:', 'mailto:'].includes(url.protocol)) return url.href;
  } catch (e) {
    try {
      const url2 = new URL('https://' + u);
      if (['http:', 'https:'].includes(url2.protocol)) return url2.href;
    } catch (e2) { }
  }
  return 'about:blank';
}

/* Convert plain text URLs into safe anchor tags while keeping other text escaped */
function autoLink(text) {
  if (!text) return '';
  let t = escapeHtml(text);
  const target = getLinkTarget();
  const urlRegex = /((https?:\/\/|www\.)[^\s<]+)/g;
  return t.replace(urlRegex, (m) => {
    let href = m;
    if (!href.match(/^https?:\/\//i)) href = 'https://' + href;
    href = sanitizeUrl(href);
    return `<a href="${escapeHtml(href)}" target="${target}" rel="noopener noreferrer">${escapeHtml(m)}</a>`;
  });
}

/* Build a <picture>-style thumb block: custom > YouTube > icon. Uses lazy onerror fallback for YT. */
function videoThumbHtml(v) {
  if (v.thumb) {
    return `<img class="video-thumb-img" src="${escapeHtml(v.thumb)}" alt="${escapeHtml(v.title || '')}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="video-thumb-fallback" style="display:none;">${v.icon || '🎬'}</div>`;
  }
  const ytId = getYouTubeId(v.url);
  if (ytId) {
    return `<img class="video-thumb-img" src="https://i.ytimg.com/vi/${ytId}/hqdefault.jpg" alt="${escapeHtml(v.title || '')}" loading="lazy" onerror="if(this.src.includes('hqdefault')){this.src='https://i.ytimg.com/vi/${ytId}/mqdefault.jpg';}else{this.style.display='none'; this.nextElementSibling.style.display='flex';}">
            <div class="video-thumb-fallback" style="display:none;">${v.icon || '🎬'}</div>`;
  }
  return `<div class="video-thumb-fallback">${v.icon || '🎬'}</div>`;
}

/* ===== Renderers ===== */

function newsCardHtml(n) {
  let linkHtml = '';
  if (n.linkUrl) {
    const href = sanitizeUrl(n.linkUrl);
    const label = n.linkLabel || n.linkUrl;
    const target = getLinkTarget();
    linkHtml = `<div class="news-card-link"><a href="${escapeHtml(href)}" target="${target}" rel="noopener noreferrer">${escapeHtml(label)}</a></div>`;
  }
  return `
  <article class="news-card" data-news-id="${n.id}">
    <div class="news-card-img">${n.icon || '📰'}</div>
    <div class="news-card-body">
      <span class="news-card-category">${escapeHtml(n.category)}</span>
      <h3 class="news-card-title">${escapeHtml(n.title)}</h3>
      <div class="news-card-meta">${formatDate(n.date)}</div>
      <p class="news-card-excerpt">${autoLink(n.excerpt || '')}</p>
      ${linkHtml}
    </div>
  </article>`;
}

function newsListItemHtml(n) {
  let linkHtml = '';
  if (n.linkUrl) {
    const href = sanitizeUrl(n.linkUrl);
    const label = n.linkLabel || n.linkUrl;
    const target = getLinkTarget();
    linkHtml = `<div class="news-list-link"><a href="${escapeHtml(href)}" target="${target}" rel="noopener noreferrer">${escapeHtml(label)}</a></div>`;
  }
  return `
  <article class="news-list-item" data-news-id="${n.id}">
    <div class="news-list-thumb">${n.icon || '📰'}</div>
    <div>
      <span class="news-card-category">${escapeHtml(n.category)}</span>
      <h3 class="news-card-title">${escapeHtml(n.title)}</h3>
      <div class="news-card-meta">${formatDate(n.date)}</div>
      <p class="news-card-excerpt">${autoLink(n.excerpt || '')}</p>
      ${linkHtml}
    </div>
  </article>`;
}

function videoCardHtml(v) {
  let linkHtml = '';
  if (v.linkUrl) {
    const href = sanitizeUrl(v.linkUrl);
    const label = v.linkLabel || v.linkUrl;
    const target = getLinkTarget();
    linkHtml = `<div class="video-card-link"><a href="${escapeHtml(href)}" target="${target}" rel="noopener noreferrer">${escapeHtml(label)}</a></div>`;
  }
  return `
  <article class="video-card" data-video-id="${v.id}">
    <div class="video-thumb">
      ${videoThumbHtml(v)}
    </div>
    <div class="video-card-body">
      <span class="news-card-category">${escapeHtml(v.category)}</span>
      <h3 class="video-card-title">${escapeHtml(v.title)}</h3>
      <div class="video-card-meta">Click to watch</div>
      <p class="video-card-excerpt">${autoLink(v.desc || '')}</p>
      ${linkHtml}
    </div>
  </article>`;
}

async function openArticle(id) {
  const list = await getNews();
  const n = list.find(x => x.id === id);
  if (!n) return;
  const body = document.getElementById('modalBody');
  let linkHtml = '';
  if (n.linkUrl) {
    const href = sanitizeUrl(n.linkUrl);
    const label = n.linkLabel || n.linkUrl;
    const target = getLinkTarget();
    linkHtml = `<div class="news-card-link" style="margin-top: 20px;"><a href="${escapeHtml(href)}" target="${target}" rel="noopener noreferrer">${escapeHtml(label)}</a></div>`;
  }
  body.innerHTML = `
    <div class="modal-image">${n.icon || '📰'}</div>
    <span class="news-card-category">${escapeHtml(n.category)}</span>
    <h2>${escapeHtml(n.title)}</h2>
    <div class="modal-meta">${formatDate(n.date)}</div>
    <p>${autoLink(n.content || n.excerpt || '')}</p>
    ${linkHtml}
  `;
  document.getElementById('articleModal').classList.add('active');
}

function closeModal() {
  document.getElementById('articleModal').classList.remove('active');
}

async function openVideo(id) {
  const list = await getVideos();
  const v = list.find(x => x.id === id);
  if (!v) return;
  const body = document.getElementById('videoModalBody');
  let embed = '';
  const url = v.url || '';
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com')) {
    embed = `<iframe class="video-iframe" src="${escapeHtml(url)}" frameborder="0" allowfullscreen></iframe>`;
  } else if (url.includes('watch?v=')) {
    const ytid = url.split('watch?v=')[1].split('&')[0];
    embed = `<iframe class="video-iframe" src="https://www.youtube.com/embed/${ytid}" frameborder="0" allowfullscreen></iframe>`;
  } else if (url.includes('youtu.be/')) {
    const ytid = url.split('youtu.be/')[1].split('?')[0];
    embed = `<iframe class="video-iframe" src="https://www.youtube.com/embed/${ytid}" frameborder="0" allowfullscreen></iframe>`;
  } else if (url) {
    embed = `<video class="video-iframe" controls src="${escapeHtml(url)}"></video>`;
  } else {
    embed = `<div class="modal-image">${v.icon || '🎬'}</div>`;
  }
  let linkHtml = '';
  if (v.linkUrl) {
    const href = sanitizeUrl(v.linkUrl);
    const label = v.linkLabel || v.linkUrl;
    const target = getLinkTarget();
    linkHtml = `<div class="video-card-link" style="margin-top: 20px;"><a href="${escapeHtml(href)}" target="${target}" rel="noopener noreferrer">${escapeHtml(label)}</a></div>`;
  }
  body.innerHTML = `
    ${embed}
    <span class="news-card-category">${escapeHtml(v.category)}</span>
    <h2>${escapeHtml(v.title)}</h2>
    <p>${autoLink(v.desc || '')}</p>
    ${linkHtml}
  `;
  document.getElementById('videoModal').classList.add('active');
}

function closeVideoModal() {
  document.getElementById('videoModal').classList.remove('active');
}

/* ===== Page renderers ===== */

async function renderNewsList() {
  const list = await getNews();
  const container = document.getElementById('newsList');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">📭</div>No news yet.</div>`;
    return;
  }
  container.innerHTML = list.map(newsListItemHtml).join('');
  animateChildren(container);
}

async function renderVideosFull() {
  const list = await getVideos();
  const container = document.getElementById('videoGridFull');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">🎬</div>No videos yet.</div>`;
    return;
  }
  container.innerHTML = list.map(videoCardHtml).join('');
  animateChildren(container);
}

async function renderHome() {
  const news = (await getNews()).slice(0, 6);
  const videos = (await getVideos()).slice(0, 6);
  const ng = document.getElementById('newsGrid');
  const vg = document.getElementById('videoGrid');
  if (ng) { ng.innerHTML = news.map(newsCardHtml).join('') || '<div class="empty">No news yet.</div>'; animateChildren(ng); }
  if (vg) { vg.innerHTML = videos.map(videoCardHtml).join('') || '<div class="empty">No videos yet.</div>'; animateChildren(vg); }
}

function animateChildren(container) {
  if (!container) return;
  const kids = container.children;
  for (let i = 0; i < kids.length; i++) {
    kids[i].classList.add('fade-in');
    kids[i].style.transitionDelay = (i * 0.05) + 's';
  }
  if ('IntersectionObserver' in window) {
    if (!window.__animObserver) {
      window.__animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            window.__animObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    }
    for (let i = 0; i < kids.length; i++) {
      window.__animObserver.observe(kids[i]);
    }
  } else {
    for (let i = 0; i < kids.length; i++) kids[i].classList.add('visible');
  }
}

/* ===== Search ===== */

async function searchContent() {
  const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  if (!q) {
    if (document.getElementById('newsList')) await renderNewsList();
    if (document.getElementById('newsGrid')) await renderHome();
    if (document.getElementById('videoGridFull')) await renderVideosFull();
    return;
  }
  const [news, videos] = await Promise.all([getNews(), getVideos()]);
  const filteredNews = news.filter(n => (n.title + n.category + n.content).toLowerCase().includes(q));
  const filteredVideos = videos.filter(v => (v.title + v.category + v.desc).toLowerCase().includes(q));

  const ng = document.getElementById('newsGrid');
  const vg = document.getElementById('videoGrid');
  const nl = document.getElementById('newsList');
  const vgf = document.getElementById('videoGridFull');

  if (ng) ng.innerHTML = filteredNews.map(newsCardHtml).join('') || '<div class="empty">No results.</div>';
  if (vg) vg.innerHTML = filteredVideos.map(videoCardHtml).join('') || '<div class="empty">No results.</div>';
  if (nl) nl.innerHTML = filteredNews.map(newsListItemHtml).join('') || '<div class="empty">No results.</div>';
  if (vgf) vgf.innerHTML = filteredVideos.map(videoCardHtml).join('') || '<div class="empty">No results.</div>';
}

/* ===== Admin ===== */

async function login() {
  const u = document.getElementById('adminUser').value;
  const p = document.getElementById('adminPass').value;
  const creds = await getCredentials();
  if (u === creds.username && p === creds.password) {
    const passEl = document.getElementById('adminPass');
    if (passEl) passEl.value = '';
    sessionStorage.setItem('isAdmin', 'yes');
    await showDashboard();
  } else {
    const uEl = document.getElementById('adminUser');
    const pEl = document.getElementById('adminPass');
    if (uEl) uEl.value = '';
    if (pEl) pEl.value = '';
    if (uEl) uEl.focus();
    alert('Invalid credentials.');
  }
}

async function changeCredentials(e) {
  e.preventDefault();
  const curU = document.getElementById('currentUser').value;
  const curP = document.getElementById('currentPass').value;
  const newU = document.getElementById('newUser').value.trim();
  const newP = document.getElementById('newPass').value;
  const confP = document.getElementById('confirmPass').value;
  const creds = await getCredentials();
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
  await saveCredentials({ username: newU, password: newP });
  alert('Credentials updated. Please log in again.');
  logout();
}

function logout() {
  sessionStorage.removeItem('isAdmin');
  location.reload();
}

async function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  const d = document.getElementById('dashboardScreen');
  d.style.display = 'block';
  d.style.minHeight = '100vh';
  await renderAdminNews();
  await renderAdminVideos();
  await renderStats();
  setupAdminPrefs();
}

function showTab(id, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

async function addNews(e) {
  e.preventDefault();
  const title = document.getElementById('newsTitle').value.trim();
  const category = document.getElementById('newsCategory').value.trim();
  const image = document.getElementById('newsImage').value.trim();
  const linkUrl = document.getElementById('newsLinkUrl') ? document.getElementById('newsLinkUrl').value.trim() : '';
  const linkLabel = document.getElementById('newsLinkLabel') ? document.getElementById('newsLinkLabel').value.trim() : '';
  const content = document.getElementById('newsContent').value.trim();
  if (!title || !category || !content) return;
  const list = await getNews();
  const id = list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
  const excerpt = content.length > 120 ? content.slice(0, 120) + '...' : content;
  list.unshift({ id, title, category, image, linkUrl, linkLabel, content, excerpt, date: new Date().toISOString().slice(0,10), icon: '📰' });
  await saveNews(list);
  e.target.reset();
  await renderAdminNews();
  await renderStats();
}

async function addVideo(e) {
  e.preventDefault();
  const title = document.getElementById('videoTitle').value.trim();
  const category = document.getElementById('videoCategory').value.trim();
  const thumb = document.getElementById('videoThumb').value.trim();
  const url = document.getElementById('videoUrl').value.trim();
  const linkUrl = document.getElementById('videoLinkUrl') ? document.getElementById('videoLinkUrl').value.trim() : '';
  const linkLabel = document.getElementById('videoLinkLabel') ? document.getElementById('videoLinkLabel').value.trim() : '';
  const desc = document.getElementById('videoDesc').value.trim();
  if (!title || !category || !url || !desc) return;
  const list = await getVideos();
  const id = list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
  list.unshift({ id, title, category, thumb, url, linkUrl, linkLabel, desc, icon: '🎬' });
  await saveVideos(list);
  e.target.reset();
  await renderAdminVideos();
  await renderStats();
}

async function deleteNews(id) {
  if (!confirm('Delete this article?')) return;
  const list = await getNews();
  await saveNews(list.filter(n => n.id !== id));
  await renderAdminNews();
  await renderStats();
}

async function deleteVideo(id) {
  if (!confirm('Delete this video?')) return;
  const list = await getVideos();
  await saveVideos(list.filter(v => v.id !== id));
  await renderAdminVideos();
  await renderStats();
}

async function renderAdminNews() {
  const list = await getNews();
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

async function renderAdminVideos() {
  const list = await getVideos();
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

async function renderStats() {
  const c = document.getElementById('statsGrid');
  if (!c) return;
  const [news, videos] = await Promise.all([getNews(), getVideos()]);
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

/* Delegated card clicks + modal backdrop close */
document.addEventListener('click', e => {
  const newsEl = e.target.closest('[data-news-id]');
  if (newsEl) { openArticle(parseInt(newsEl.dataset.newsId, 10)); return; }
  const vidEl = e.target.closest('[data-video-id]');
  if (vidEl) { openVideo(parseInt(vidEl.dataset.videoId, 10)); return; }
  if (e.target.id === 'articleModal') closeModal();
  if (e.target.id === 'videoModal') closeVideoModal();
});

/* ===== Link URL preview in admin forms ===== */
function updateLinkPreview(urlInputId, labelInputId, previewId) {
  const urlEl = document.getElementById(urlInputId);
  const labelEl = document.getElementById(labelInputId);
  const previewEl = document.getElementById(previewId);
  if (!urlEl || !previewEl) return;
  const raw = urlEl.value.trim();
  if (!raw) { previewEl.innerHTML = ''; previewEl.classList.remove('visible'); return; }
  const href = sanitizeUrl(raw);
  const label = (labelEl && labelEl.value.trim()) || raw;
  const target = getLinkTarget();
  previewEl.innerHTML = `Preview: <a href="${escapeHtml(href)}" target="${target}" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  previewEl.classList.add('visible');
}

function setupLinkPreview(urlId, labelId, previewId) {
  const urlEl = document.getElementById(urlId);
  const labelEl = document.getElementById(labelId);
  if (!urlEl) return;
  const handler = () => updateLinkPreview(urlId, labelId, previewId);
  urlEl.addEventListener('input', handler);
  if (labelEl) labelEl.addEventListener('input', handler);
}

async function setupAdminPrefs() {
  setupLinkPreview('newsLinkUrl', 'newsLinkLabel', 'newsLinkPreview');
  setupLinkPreview('videoLinkUrl', 'videoLinkLabel', 'videoLinkPreview');

  // Initialize the radio from saved value
  const prefs = await api('/api/prefs');
  const saved = (prefs && prefs.linkTarget) || '_blank';
  __linkTarget = saved;
  const radios = document.querySelectorAll('input[name="linkTarget"]');
  radios.forEach(r => { r.checked = (r.value === saved); });

  // Save button
  const saveBtn = document.getElementById('savePrefsBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const sel = document.querySelector('input[name="linkTarget"]:checked');
      if (sel) {
        await setLinkTarget(sel.value);
        // Re-render open views to reflect new target
        if (document.getElementById('newsGrid')) await renderHome();
        if (document.getElementById('newsList')) await renderNewsList();
        if (document.getElementById('videoGridFull')) await renderVideosFull();
        // Update any open previews
        updateLinkPreview('newsLinkUrl', 'newsLinkLabel', 'newsLinkPreview');
        updateLinkPreview('videoLinkUrl', 'videoLinkLabel', 'videoLinkPreview');
        alert('Link preference saved.');
      }
    });
  }
}

/* ===== Scroll Animations (IntersectionObserver) ===== */
function setupScrollAnimations() {
  const targets = document.querySelectorAll('[data-animate]');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => observer.observe(el));
}

/* ===== Page init ===== */
async function initPage() {
  await initLinkTarget();
  if (document.getElementById('newsGrid')) await renderHome();
  if (document.getElementById('newsList')) await renderNewsList();
  if (document.getElementById('videoGridFull')) await renderVideosFull();
  setupScrollAnimations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
