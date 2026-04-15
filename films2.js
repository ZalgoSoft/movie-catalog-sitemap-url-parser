(async function() {
    // Clear existing page content
    document.body.innerHTML = "";
    document.body.style.backgroundColor = "black";
    document.querySelectorAll('style, link[rel="stylesheet"], script').forEach(el => el.remove());

    // Catalog styles
    const style = document.createElement('style');
    style.textContent = `
        #film-catalog-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 99900;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        }
        #film-catalog {
            width: 95%; max-width: 1400px; height: 90%;
            background: #1a1a2e;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            color: #eee;
        }
        #catalog-header {
            padding: 20px 24px;
            background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
            border-bottom: 1px solid #0f3460;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        #catalog-header h2 {
            margin: 0;
            color: #e94560;
            font-size: 24px;
            font-weight: 600;
        }
        #catalog-stats {
            color: #888;
            font-size: 14px;
        }
        #catalog-controls {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;
        }
        #search-input, .filter-select {
            padding: 10px 16px;
            border-radius: 8px;
            border: 1px solid #0f3460;
            background: #0f3460;
            color: white;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
        }
        #search-input {
            width: 250px;
        }
        #search-input:focus, .filter-select:focus {
            border-color: #e94560;
            background: #1a1a2e;
        }
        #search-input::placeholder {
            color: #aaa;
        }
        .filter-select {
            cursor: pointer;
        }
        .filter-select option {
            background: #1a1a2e;
        }
        #close-catalog {
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            background: #e94560;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }
        #close-catalog:hover {
            background: #d63850;
        }
        #catalog-content {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
        }
        #loading-indicator {
            text-align: center;
            padding: 60px;
            color: #888;
            font-size: 18px;
        }
        .films-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 12px;
        }
        .film-card {
            background: #16213e;
            border-radius: 10px;
            padding: 16px 18px;
            border-left: 4px solid #e94560;
            transition: transform 0.15s, box-shadow 0.15s;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .film-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(233, 69, 96, 0.15);
            background: #1e2a4a;
        }
        .film-title {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 8px;
            color: #fff;
            word-break: break-word;
        }
        .film-meta {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #aaa;
        }
        .film-category {
            color: #e94560;
            font-weight: 500;
        }
        .film-date {
            color: #6c8b9e;
        }
        .film-priority {
            margin-left: auto;
            font-size: 11px;
            background: #0f3460;
            padding: 2px 8px;
            border-radius: 12px;
        }
        .no-results {
            text-align: center;
            padding: 60px;
            color: #888;
            font-size: 16px;
        }
        .progress-bar {
            width: 100%;
            height: 4px;
            background: #0f3460;
            border-radius: 2px;
            overflow: hidden;
            margin-top: 8px;
        }
        .progress-fill {
            height: 100%;
            background: #e94560;
            width: 0%;
            transition: width 0.3s;
        }
        .toast-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #16213e;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            border-left: 4px solid #e94560;
            z-index: 100000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
    `;
    document.head.appendChild(style);

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'film-catalog-overlay';
    overlay.innerHTML = `
        <div id="film-catalog">
            <div id="catalog-header">
                <div>
                    <h2>🎬 Filmoteka Catalog</h2>
                    <div id="catalog-stats">Loading data...</div>
                </div>
                <div id="catalog-controls">
                    <input type="text" id="search-input" placeholder="🔍 Search by title...">
                    <select id="category-filter" class="filter-select">
                        <option value="">All categories</option>
                    </select>
                    <select id="year-filter" class="filter-select">
                        <option value="">All years</option>
                    </select>
                    <select id="sort-select" class="filter-select">
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="title">Alphabetical</option>
                        <option value="priority">By priority</option>
                    </select>
                    <button id="close-catalog">✕ Close</button>
                </div>
            </div>
            <div id="catalog-content">
                <div id="loading-indicator">
                    <div>⏳ Loading sitemap...</div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                    <div id="progress-text" style="margin-top: 8px; font-size: 12px;"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Event listeners for closing
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    document.getElementById('close-catalog').addEventListener('click', () => overlay.remove());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.remove();
    });

    const contentDiv = document.getElementById('catalog-content');
    const statsDiv = document.getElementById('catalog-stats');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    // Data storage
    let allFilms = [];
    const categories = new Set();
    const years = new Set();

    // Fetch XML helper
    async function fetchXML(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const text = await response.text();
            return new DOMParser().parseFromString(text, 'text/xml');
        } catch (e) {
            console.warn(`Failed to load ${url}:`, e);
            return null;
        }
    }

    // Extract ID from URL
    const extractIdFromUrl = (url) => {
        const match = url.match(/\/(\d+)-/);
        return match ? parseInt(match[1]) : 0;
    };

    // Extract title from URL
    const extractTitleFromUrl = (url) => {
        const match = url.match(/\/(\d+)-([^\/]+)\.html/);
        if (match) {
            return match[2].replace(/[_-]/g, ' ');
        }
        return url.split('/').pop().replace('.html', '').replace(/[_-]/g, ' ');
    };

    // Parse news_pages.xml
    async function loadNewsPages() {
        progressText.textContent = 'Loading film list...';
        progressFill.style.width = '30%';
        
        const xml = await fetchXML('https://filmoteka.icu/news_pages.xml');
        if (!xml) {
            progressText.textContent = 'Error loading news_pages.xml';
            return null;
        }

        const urls = xml.querySelectorAll('url');
        progressText.textContent = `Processing ${urls.length} entries...`;
        progressFill.style.width = '60%';

        const films = [];
        urls.forEach(url => {
            const loc = url.querySelector('loc')?.textContent;
            const lastmod = url.querySelector('lastmod')?.textContent;
            const priority = url.querySelector('priority')?.textContent;
            
            if (loc?.match(/\/\d+-/)) {
                const id = extractIdFromUrl(loc);
                const title = extractTitleFromUrl(loc);
                let category = 'Film';
                
                if (loc.includes('serial') || title.includes('serial')) category = 'Series';
                else if (loc.includes('mult') || title.includes('mult')) category = 'Animation';
                else if (title.includes('anime')) category = 'Anime';
                
                films.push({
                    id, title, url: loc,
                    lastmod: lastmod || '',
                    priority: parseFloat(priority) || 0.6,
                    category
                });
                
                categories.add(category);
                
                if (lastmod) {
                    const year = lastmod.substring(0, 4);
                    if (year >= '1990') years.add(year);
                }
            }
        });

        progressFill.style.width = '100%';
        progressText.textContent = `Loaded ${films.length} films`;
        
        return films;
    }

    // Show loading toast
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        return toast;
    }

    // Fetch page and extract video parameters
    async function fetchVideoParams(url) {
        const toast = showToast('⏳ Loading page...');
        
        try {
            const response = await fetch(url);
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const videoPlayer = doc.querySelector('video-player');
            
            toast.remove();
            
            return {
                titleId: videoPlayer?.getAttribute('data-title-id'),
                publisherId: videoPlayer?.getAttribute('data-publisher-id'),
                aggregator: videoPlayer?.getAttribute('data-aggregator')
            };
        } catch (error) {
            console.error('Failed to load page:', error);
            toast.remove();
            return { titleId: null, publisherId: null, aggregator: null };
        }
    }

    // Video extractor UI
    async function launchVideoExtractor(params) {
        const { titleId, publisherId, aggregator } = params;
        
        const PLAYLIST_URL = `https://plapi.cdnvideohub.com/api/v1/player/sv/playlist?pub=${publisherId}&aggr=${aggregator}&id=${titleId}`;
        const VIDEO_API_BASE = 'https://plapi.cdnvideohub.com/api/v1/player/sv/video/';
        
        const QUALITY_LABELS = {
            'mpegTinyUrl': '144p', 'mpegLowestUrl': '240p', 'mpegLowUrl': '360p',
            'mpegMediumUrl': '480p', 'mpegHighUrl': '720p', 'mpegFullHdUrl': '1080p',
            'hlsUrl': 'HLS', 'dashUrl': 'DASH'
        };
        
        const extractorOverlay = document.createElement('div');
        extractorOverlay.id = 'video-link-extractor';
        extractorOverlay.innerHTML = `
            <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:99999;overflow:auto;font-family:monospace;">
                <div style="max-width:1400px;margin:20px auto;background:#1a1a1a;color:#e0e0e0;padding:20px;border-radius:8px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <div>
                            <h2 style="margin:0 0 10px 0;color:#fff;">Video Link Extractor</h2>
                            <div style="font-size:12px;color:#888;">ID: ${titleId}</div>
                        </div>
                        <button id="closeExtractor" style="padding:10px 20px;background:#f44336;color:#fff;border:none;border-radius:4px;cursor:pointer;">Close</button>
                    </div>
                    <div id="extractorStatus" style="padding:10px;background:#2d2d2d;border-radius:4px;margin-bottom:20px;">Loading playlist...</div>
                    <div style="margin-bottom:20px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                        <select id="seasonFilter" style="padding:8px;background:#2d2d2d;color:#fff;border:1px solid #444;border-radius:4px;">
                            <option value="all">All Seasons</option>
                        </select>
                        <select id="qualityFilter" style="padding:8px;background:#2d2d2d;color:#fff;border:1px solid #444;border-radius:4px;">
                            <option value="all">All Qualities</option>
                            ${Object.values(QUALITY_LABELS).map(q => `<option value="${q}">${q}</option>`).join('')}
                        </select>
                        <button id="copyAllBtn" style="padding:8px 16px;background:#4CAF50;color:#fff;border:none;border-radius:4px;cursor:pointer;">📋 Copy All Links</button>
                        <button id="exportJsonBtn" style="padding:8px 16px;background:#2196F3;color:#fff;border:none;border-radius:4px;cursor:pointer;">💾 Export JSON</button>
                        <button id="exportCsvBtn" style="padding:8px 16px;background:#ff9800;color:#fff;border:none;border-radius:4px;cursor:pointer;">📊 Export CSV</button>
                    </div>
                    <div id="extractorStats" style="margin-bottom:10px;color:#888;font-size:12px;"></div>
                    <div id="extractorContent" style="overflow-x:auto;"><div style="text-align:center;padding:40px;">Loading...</div></div>
                </div>
            </div>
        `;
        document.body.appendChild(extractorOverlay);
        
        const statusEl = document.getElementById('extractorStatus');
        const contentEl = document.getElementById('extractorContent');
        const seasonFilter = document.getElementById('seasonFilter');
        const qualityFilter = document.getElementById('qualityFilter');
        const statsEl = document.getElementById('extractorStats');
        
        let allEpisodes = [];
        const videoData = new Map();
        let titleName = '';
        let visibleLinks = [];
        
        const updateStatus = (text, isError = false) => {
            statusEl.innerHTML = text;
            statusEl.style.background = isError ? '#b71c1c' : '#2d2d2d';
        };
        
        const copyToClipboard = (text) => {
            navigator.clipboard?.writeText(text) || (() => {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            })();
            updateStatus('✅ Copied!');
            setTimeout(() => updateStatus('Ready'), 1500);
        };
        
        // Close handler
        document.getElementById('closeExtractor').addEventListener('click', () => extractorOverlay.remove());
        
        try {
            const playlistRes = await fetch(PLAYLIST_URL);
            const playlistData = await playlistRes.json();
            
            titleName = playlistData.titleName || 'Unknown';
            allEpisodes = playlistData.items.sort((a, b) => 
                a.season !== b.season ? a.season - b.season : a.episode - b.episode
            );
            
            updateStatus(`Found ${allEpisodes.length} episodes for "${titleName}". Fetching video URLs...`);
            
            // Populate season filter
            [...new Set(allEpisodes.map(e => e.season))].sort().forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = `Season ${s}`;
                seasonFilter.appendChild(opt);
            });
            
            // Fetch video URLs
            let completed = 0;
            const total = allEpisodes.length;
            
            await Promise.all(allEpisodes.map(async (ep) => {
                try {
                    const res = await fetch(VIDEO_API_BASE + ep.vkId);
                    videoData.set(ep.vkId, await res.json());
                } catch (e) {
                    console.error(`Failed to fetch ${ep.vkId}:`, e);
                } finally {
                    completed++;
                    if (completed % 5 === 0 || completed === total) {
                        updateStatus(`Loading episodes: ${completed}/${total}`);
                    }
                }
            }));
            
            updateStatus(`✅ Ready - ${allEpisodes.length} episodes loaded`);
            renderTable();
            
        } catch (error) {
            updateStatus(`❌ Error: ${error.message}`, true);
            contentEl.innerHTML = `<div style="color:#f44336;padding:20px;">Failed to load data: ${error.message}</div>`;
        }
        
        function renderTable() {
            const seasonVal = seasonFilter.value;
            const qualityVal = qualityFilter.value;
            
            const filtered = allEpisodes.filter(ep => 
                seasonVal === 'all' || ep.season.toString() === seasonVal
            );
            
            if (!filtered.length) {
                contentEl.innerHTML = '<div style="padding:20px;text-align:center;">No episodes found</div>';
                return;
            }
            
            const qualities = qualityVal === 'all' 
                ? Object.entries(QUALITY_LABELS)
                : Object.entries(QUALITY_LABELS).filter(([_, l]) => l === qualityVal);
            
            let html = `
                <table style="width:100%;border-collapse:collapse;font-size:12px;">
                    <thead><tr style="background:#2d2d2d;">
                        <th style="padding:10px;border:1px solid #444;">S</th>
                        <th style="padding:10px;border:1px solid #444;">E</th>
                        <th style="padding:10px;border:1px solid #444;">Title</th>
                        ${qualities.map(([_, l]) => `<th style="padding:10px;border:1px solid #444;">${l}</th>`).join('')}
                    </tr></thead><tbody>
            `;
            
            visibleLinks = [];
            
            filtered.forEach(ep => {
                const sources = videoData.get(ep.vkId)?.sources || {};
                
                html += `
                    <tr>
                        <td style="padding:8px;border:1px solid #444;text-align:center;">${ep.season}</td>
                        <td style="padding:8px;border:1px solid #444;text-align:center;">${ep.episode}</td>
                        <td style="padding:8px;border:1px solid #444;">${ep.name || `Episode ${ep.episode}`}</td>
                `;
                
                qualities.forEach(([key, label]) => {
                    const url = sources[key];
                    if (url) {
                        visibleLinks.push({ season: ep.season, episode: ep.episode, quality: label, url, title: titleName });
                        html += `
                            <td style="padding:4px;border:1px solid #444;text-align:center;">
                                <button onclick="window.vleCopy('${url.replace(/'/g, "\\'")}')" 
                                        style="padding:6px 12px;background:#4CAF50;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;">
                                    Copy
                                </button>
                            </td>
                        `;
                    } else {
                        html += `<td style="padding:8px;border:1px solid #444;text-align:center;color:#666;">-</td>`;
                    }
                });
                
                html += '</tr>';
            });
            
            html += '</tbody></table>';
            contentEl.innerHTML = html;
            statsEl.textContent = `📺 ${titleName} • ${filtered.length} episodes • ${visibleLinks.length} links available`;
        }
        
        window.vleCopy = copyToClipboard;
        
        seasonFilter.addEventListener('change', renderTable);
        qualityFilter.addEventListener('change', renderTable);
        
        document.getElementById('copyAllBtn').addEventListener('click', () => {
            if (!visibleLinks.length) return updateStatus('No links to copy', true);
            const text = visibleLinks.map(l => 
                `S${l.season.toString().padStart(2,'0')}E${l.episode.toString().padStart(2,'0')} [${l.quality}]: ${l.url}`
            ).join('\n');
            copyToClipboard(text);
            updateStatus(`📋 Copied ${visibleLinks.length} links`);
        });
        
        document.getElementById('exportJsonBtn').addEventListener('click', () => {
            const data = { title: titleName, playlistId: titleId, episodes: allEpisodes, videoUrls: [...videoData.entries()].map(([id, d]) => ({ id, d })) };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${titleName.replace(/\s+/g, '_')}_links.json` });
            a.click();
            URL.revokeObjectURL(a.href);
            updateStatus('💾 JSON exported');
        });
        
        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            if (!visibleLinks.length) return updateStatus('No data to export', true);
            const csv = 'Season,Episode,Quality,URL\n' + visibleLinks.map(l => `${l.season},${l.episode},${l.quality},"${l.url}"`).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${titleName.replace(/\s+/g, '_')}_links.csv` });
            a.click();
            URL.revokeObjectURL(a.href);
            updateStatus('📊 CSV exported');
        });
    }

    // Render catalog function
    function renderCatalog(films) {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const yearFilter = document.getElementById('year-filter');
        const sortSelect = document.getElementById('sort-select');
        
        // Populate filters
        categoryFilter.innerHTML = '<option value="">All categories</option>';
        [...categories].sort().forEach(cat => {
            categoryFilter.appendChild(Object.assign(document.createElement('option'), { value: cat, textContent: cat }));
        });
        
        yearFilter.innerHTML = '<option value="">All years</option>';
        [...years].sort().reverse().forEach(year => {
            yearFilter.appendChild(Object.assign(document.createElement('option'), { value: year, textContent: year }));
        });

        const applyFilters = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const catVal = categoryFilter.value;
            const yearVal = yearFilter.value;
            const sortVal = sortSelect.value;

            let filtered = films.filter(f => {
                if (searchTerm && !f.title.toLowerCase().includes(searchTerm)) return false;
                if (catVal && f.category !== catVal) return false;
                if (yearVal && f.lastmod?.substring(0, 4) !== yearVal) return false;
                return true;
            });

            // Sort
            const sorters = {
                newest: (a, b) => b.id - a.id,
                oldest: (a, b) => a.id - b.id,
                title: (a, b) => a.title.localeCompare(b.title, 'ru'),
                priority: (a, b) => b.priority - a.priority
            };
            filtered.sort(sorters[sortVal] || sorters.newest);

            displayFilms(filtered);
            statsDiv.textContent = `Found: ${filtered.length} of ${films.length}`;
        };

        function displayFilms(filmsToShow) {
            if (!filmsToShow.length) {
                contentDiv.innerHTML = '<div class="no-results">😕 No results found</div>';
                return;
            }

            const grid = document.createElement('div');
            grid.className = 'films-grid';
            
            filmsToShow.forEach(f => {
                const card = document.createElement('div');
                card.className = 'film-card';
                card.innerHTML = `
                    <div class="film-title">🎬 ${f.title}</div>
                    <div class="film-meta">
                        <span class="film-category">${f.category}</span>
                        <span class="film-date">${f.lastmod?.substring(0, 10) || ''}</span>
                        <span class="film-priority">ID: ${f.id}</span>
                    </div>
                `;
                
                card.addEventListener('click', async (e) => {
                    e.preventDefault();
                    card.style.opacity = '0.7';
                    
                    const params = await fetchVideoParams(f.url);
                    card.style.opacity = '1';
                    
                    if (params.titleId) {
                        console.log(`Parameters for "${f.title}":`, params);
                        await launchVideoExtractor(params);
                    } else {
                        alert(`❌ Failed to retrieve parameters for:\n${f.title}`);
                    }
                });
                
                grid.appendChild(card);
            });
            
            contentDiv.innerHTML = '';
            contentDiv.appendChild(grid);
        }

        searchInput.addEventListener('input', applyFilters);
        categoryFilter.addEventListener('change', applyFilters);
        yearFilter.addEventListener('change', applyFilters);
        sortSelect.addEventListener('change', applyFilters);
        
        applyFilters();
    }

    // Initialize
    const films = await loadNewsPages();
    if (films?.length) {
        allFilms = films;
        renderCatalog(allFilms);
    } else {
        contentDiv.innerHTML = '<div class="no-results">❌ Failed to load data</div>';
        statsDiv.textContent = 'Loading error';
    }
})();