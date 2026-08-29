'use strict';

/* ============================================================
   script.js — Main Application Engine
   Samanuai OS Portfolio — night-slayer.tech
   ============================================================ */

/* ── App State ── */
const app = {
  theme:        localStorage.getItem('portfolio-theme') || 'dark',
  mobile:       window.innerWidth <= 768,
  reduced:      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  touch:        'ontouchstart' in window || navigator.maxTouchPoints > 0,
  githubData:   null,
  initialized:  false,
};

/* ── DOM Cache ── */
const DOM = {
  body:          document.body,
  html:          document.documentElement,
  navbar:        document.querySelector('.navbar'),
  heroCanvas:    document.getElementById('hero-canvas'),
  backTop:       document.getElementById('back-top'),
  themeBtn:      document.getElementById('theme-btn'),
  cursorDot:     document.getElementById('cursor-dot'),
  cursorRing:    document.getElementById('cursor-ring'),
  codeOutput:    document.getElementById('code-output'),
  statusClock:   document.getElementById('status-clock'),
};

/* ────────────────────────────────────────
   ENTRY POINT
──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCursor();
  if (app.touch) DOM.body.classList.add('touch-device');
  initApp();
});

async function initApp() {
  if (app.initialized) return;
  app.initialized = true;

  // Fetch GitHub data (cached JSON first, then live if available)
  await loadGitHubData();

  // Populate all content
  populateHero();
  populateStats();
  populateProjects();
  populateContact();
  populateFooter();

  // Init features
  initNavbar();
  initHeroCanvas();
  initScrollAnimations();

  // Reveal all elements in hero immediately
  document.querySelectorAll('.hero .reveal, .hero .reveal-left, .hero .reveal-right').forEach(el => {
    el.classList.add('visible');
  });

  initScrollEvents();
  initBackToTop();
  initClock();
  initProjectFilters();
  initTiltEffects();

  // Command palette
  CommandPalette.init(portfolioConfig.commandPalette.commands);

  // Theme toggle event
  document.addEventListener('toggle-theme', () => {
    const newTheme = app.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // Typing effect on the hero code snippet
  setTimeout(() => {
    if (DOM.codeOutput && window.TypingEffect) {
      TypingEffect.type(DOM.codeOutput, portfolioConfig.hero.codeSnippet, 12);
    }
  }, 200);
}

/* ────────────────────────────────────────
   GITHUB DATA LOADER (Personal + OpenSyntaxHQ)
──────────────────────────────────────── */
async function loadGitHubData() {
  // 1. Try local cache first (fast, pre-aggregated personal + org data)
  try {
    const cacheRes = await fetch('data/github-cache.json');
    if (cacheRes.ok) {
      app.githubData = await cacheRes.json();
      console.log('[Portfolio] Loaded from cache:', app.githubData.generated_at);
    }
  } catch (e) {
    console.warn('[Portfolio] Cache fetch failed, trying live API', e);
  }

  // 2. Try live GitHub API to refresh live numbers
  try {
    const user = portfolioConfig.personal.githubUsername;
    const org = portfolioConfig.personal.githubOrg;

    const [profileRes, userReposRes, orgReposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`),
      fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`),
      fetch(`https://api.github.com/orgs/${org}/repos?per_page=100&sort=updated`)
    ]);

    if (profileRes.ok && userReposRes.ok) {
      const profile = await profileRes.json();
      const userRepos = await userReposRes.json();
      const orgRepos = orgReposRes.ok ? await orgReposRes.json() : [];

      app.githubData = buildDataFromAPI(profile, userRepos, orgRepos, app.githubData);
      console.log('[Portfolio] Live combined GitHub data loaded');
    }
  } catch (e) {
    console.warn('[Portfolio] Live API unavailable or rate-limited, using cache');
  }

  if (!app.githubData) {
    app.githubData = buildFallbackData();
  }
}

function buildDataFromAPI(profile, userRepos, orgRepos, existingCache) {
  const langColors = {
    'TypeScript': '#3178c6', 'JavaScript': '#f1e05a', 'Go': '#00add8',
    'Python': '#3572A5', 'Java': '#b07219', 'Shell': '#89e051',
    'Rust': '#dea584', 'C': '#555555', 'C++': '#f34b7d', 'HTML': '#e34c26',
    'CSS': '#563d7c', 'Vue': '#41b883', 'Ruby': '#701516', 'Swift': '#ffac45',
    'Kotlin': '#7F52FF', 'PLpgSQL': '#336791', 'SQL': '#336791'
  };

  const allRepos = [
    ...(Array.isArray(userRepos) ? userRepos.map(r => ({ ...r, _source: 'night-slayer18' })) : []),
    ...(Array.isArray(orgRepos) ? orgRepos.map(r => ({ ...r, _source: 'OpenSyntaxHQ', isOpenSyntax: true })) : [])
  ];

  const langCount = {};
  let totalStars = 0, totalForks = 0;

  allRepos.filter(r => !r.fork).forEach(r => {
    if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    totalStars += r.stargazers_count || 0;
    totalForks += r.forks_count || 0;
  });

  const topLangs = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count, color: langColors[name] || '#666' }));

  return {
    generated_at: new Date().toISOString(),
    profile: {
      login: profile.login,
      name: profile.name || portfolioConfig.personal.fullName,
      avatar_url: profile.avatar_url,
      bio: profile.bio || portfolioConfig.personal.bio,
      location: profile.location || portfolioConfig.personal.location,
      public_repos: allRepos.length || 32,
      followers: profile.followers || 30,
      following: profile.following || 21
    },
    stats: {
      total_stars: totalStars || 56,
      total_forks: totalForks || 12,
      total_repos: allRepos.length || 32,
      top_languages: topLangs.length > 0 ? topLangs : existingCache?.stats?.top_languages || [],
      contribution_streak: existingCache?.stats?.contribution_streak || 14,
      total_contributions: existingCache?.stats?.total_contributions || 540,
    },
    featured_repos: existingCache?.featured_repos || []
  };
}

function buildFallbackData() {
  return {
    profile: {
      name: portfolioConfig.personal.fullName,
      login: portfolioConfig.personal.githubUsername,
      avatar_url: 'https://avatars.githubusercontent.com/u/83979018?v=4',
      bio: portfolioConfig.personal.bio,
      location: portfolioConfig.personal.location,
      public_repos: 32
    },
    stats: {
      total_stars: 56,
      total_forks: 12,
      total_repos: 32,
      top_languages: [
        { name: 'TypeScript', count: 10, bytes: 180000, percent: 41.2, color: '#3178c6' },
        { name: 'Go',         count: 6,  bytes: 95000,  percent: 21.7, color: '#00add8' },
        { name: 'Python',     count: 4,  bytes: 60000,  percent: 13.7, color: '#3572A5' },
        { name: 'Java',       count: 3,  bytes: 50000,  percent: 11.4, color: '#b07219' }
      ],
      contribution_streak:  274,
      total_contributions:  1420,
      total_commits:        null,
      total_prs:            null,
      total_issues:         null,
      repos_contributed_to: null,
    },
    featured_repos: []
  };
}

/* ────────────────────────────────────────
   CONTENT POPULATION
──────────────────────────────────────── */
function populateHero() {
  const data = app.githubData;
  const cfg  = portfolioConfig;

  // Profile card
  setText('profile-name',   data.profile.name || cfg.personal.fullName);
  setText('profile-handle', `@${data.profile.login} · @OpenSyntaxHQ`);
  setText('profile-bio',    data.profile.bio || cfg.personal.bio);
  setAttr('profile-avatar', 'src', data.profile.avatar_url);
  setAttr('profile-avatar', 'alt', `${data.profile.name} avatar`);

  // Profile mini-stats (32 Repos, 56 Stars, 12 Forks, 274d Streak)
  setText('stat-repos',  data.profile.public_repos || data.stats.total_repos || 32);
  setText('stat-stars',  data.stats.total_stars || 56);
  setText('stat-forks',  data.stats.total_forks || 12);
  const streak = data.stats.contribution_streak || 274;
  setText('stat-streak', `${streak}d`);

  // Hero text
  setText('hero-desc', cfg.hero.description);
  setText('hero-title-line', cfg.hero.title.role);

  // Social links
  const socialEl = document.getElementById('hero-social-row');
  if (socialEl) {
    socialEl.innerHTML = Object.values(cfg.social).map(s => `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer"
         class="hero-social-link" aria-label="${s.label}" role="listitem">
        <i class="${s.icon}" aria-hidden="true"></i>
      </a>
    `).join('');
  }

  // Status bar
  setText('status-stars-val', `${data.stats.total_stars || 56} stars on GitHub`);
}

function populateStats() {
  const stats   = app.githubData.stats;
  const profile = app.githubData.profile;

  // Core animated counters
  animateCounter('sc-repos',  profile.public_repos || stats.total_repos || 32);
  animateCounter('sc-stars',  stats.total_stars || 56);
  animateCounter('sc-streak', stats.contribution_streak || 274);

  // New counters — only animate if data is available from GraphQL cache
  if (stats.total_commits)  animateCounter('sc-commits', stats.total_commits);
  if (stats.total_prs)      animateCounter('sc-prs',     stats.total_prs);
  if (stats.total_issues)   animateCounter('sc-issues',  stats.total_issues);

  // Language bars — use real byte % if available, otherwise fall back to repo count ratio
  const langList = document.getElementById('lang-bars-list');
  if (!langList || !stats.top_languages?.length) return;

  const langs   = stats.top_languages;
  const hasReal = langs[0]?.percent != null;  // real byte data from GraphQL
  const maxVal  = hasReal
    ? 100  // percent is already out of 100
    : (langs[0]?.count || 1);

  langList.innerHTML = langs.map(lang => {
    const pct   = hasReal ? lang.percent : Math.round((lang.count / maxVal) * 100);
    const label = hasReal ? `${lang.percent}%` : `${lang.count} repos`;
    return `
      <div class="lang-bar-item" role="listitem">
        <span class="lang-bar-name">${lang.name}</span>
        <div class="lang-bar-track" aria-label="${lang.name}: ${pct}%">
          <div class="lang-bar-fill"
               data-width="${pct}"
               style="background: ${lang.color || 'var(--cyan)'}; width: 0%;"
               role="progressbar"
               aria-valuenow="${pct}"
               aria-valuemin="0"
               aria-valuemax="100"></div>
        </div>
        <span class="lang-bar-count">${label}</span>
      </div>
    `;
  }).join('');

  // Animate bars on scroll into view
  const barsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        langList.querySelectorAll('.lang-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
        barsObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });
  barsObserver.observe(langList);
}

function populateProjects() {
  const repos = app.githubData.featured_repos || [];
  const grid  = document.getElementById('projects-grid');
  if (!grid) return;

  const langColors = {
    'TypeScript': '#3178c6', 'JavaScript': '#f1e05a', 'Go': '#00add8',
    'Python': '#3572A5', 'Java': '#b07219', 'Shell': '#89e051',
    'Rust': '#dea584', 'HTML': '#e34c26', 'CSS': '#563d7c', 'Vue': '#41b883',
    'PLpgSQL': '#336791', 'SQL': '#336791'
  };

  if (repos.length === 0) {
    grid.innerHTML = `
      <div class="project-card" style="opacity:0.6; text-align:center; padding: 3rem;">
        <i class="fab fa-github" style="font-size:2rem; color:var(--cyan); margin-bottom:1rem; display:block;"></i>
        <p style="color:var(--text-1);">Loading projects from night-slayer18 & OpenSyntaxHQ...</p>
      </div>`;
    return;
  }

  grid.innerHTML = repos.map((repo, i) => {
    const isFeatured    = repo.featured || (repo.stargazers_count >= 10);
    const isOpenSyntax  = repo.isOpenSyntax || repo.org === 'OpenSyntaxHQ' || repo.topics?.includes('opensyntax');
    const isInteractive = repo.topics?.includes('gitgotchi') || repo.name === 'gitgotchi';
    const langColor     = langColors[repo.language] || '#666';

    const topicsHTML = (repo.topics || []).slice(0, 4)
      .map(t => `<span class="project-topic">${t}</span>`).join('');

    const badges = [
      isOpenSyntax  ? `<span class="project-badge org-badge"><i class="fas fa-cube"></i> OpenSyntaxHQ</span>` : '',
      isFeatured    ? `<span class="project-badge featured-badge"><i class="fas fa-star"></i> Featured</span>` : '',
      isInteractive ? `<span class="project-badge interactive-badge"><i class="fas fa-gamepad"></i> Interactive</span>` : '',
    ].filter(Boolean).join('');

    const externalLink = repo.homepage
      ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer"
            class="project-link-btn" aria-label="Live link for ${repo.name}" title="Live Link">
            <i class="fas fa-external-link-alt" aria-hidden="true"></i>
         </a>` : '';

    // Release badge — only show if repo has a tagged release
    const releaseBadge = repo.latest_release
      ? `<span class="project-release-tag" title="Latest release">
           <i class="fas fa-tag"></i> ${repo.latest_release}
         </span>` : '';

    // Lang bytes mini-bar — top 3 languages by size
    const langBytesBar = (repo.lang_bytes?.length > 1)
      ? `<div class="project-lang-bar" title="Language breakdown by bytes">
           ${repo.lang_bytes.slice(0, 3).map(lb => {
             const totalBytes = repo.lang_bytes.slice(0, 3).reduce((s, l) => s + l.size, 0) || 1;
             const w = Math.round(lb.size / totalBytes * 100);
             return `<span class="plb-seg" style="width:${w}%;background:${lb.color}" title="${lb.name}: ${w}%"></span>`;
           }).join('')}
         </div>` : '';

    const categoryData = [
      repo.language || '',
      isOpenSyntax ? 'OpenSyntaxHQ' : '',
      (repo.topics?.includes('cli') || repo.topics?.includes('tui') || repo.name.includes('cli') || repo.name === 'runtime' || repo.name === 'tweak' || repo.name === 'goforge') ? 'CLI' : '',
      (repo.language === 'Java' || repo.topics?.includes('mcp')) ? 'Java' : ''
    ].filter(Boolean).join(' ');

    return `
      <div class="project-card${isFeatured && i < 2 ? ' featured' : ''} reveal"
           style="transition-delay: ${(i % 3) * 0.08}s;"
           data-categories="${categoryData}"
           data-lang="${repo.language}"
           role="listitem">
        <div class="project-card-header">
          <div class="project-window-controls" aria-hidden="true">
            <span class="project-window-dot close"></span>
            <span class="project-window-dot min"></span>
            <span class="project-window-dot max"></span>
          </div>
          ${badges ? `<div class="project-badges">${badges}</div>` : ''}
          ${releaseBadge}
        </div>
        <div class="project-card-body">
          <h3 class="project-name">
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer"
               aria-label="${repo.name} on GitHub">
              ${repo.name}
            </a>
          </h3>
          <p class="project-desc">${repo.description || 'Developer toolchain & system component.'}</p>
        </div>
        ${langBytesBar}
        ${topicsHTML ? `<div class="project-topics" role="list" aria-label="Topics">${topicsHTML}</div>` : ''}
        <div class="project-footer">
          <div class="project-lang">
            ${repo.language ? `<span class="lang-dot" style="background:${langColor}" aria-hidden="true"></span> ${repo.language}` : ''}
          </div>
          <div class="project-meta">
            ${repo.stargazers_count !== undefined ? `
              <span class="project-metric" title="${repo.stargazers_count} stars">
                <i class="fas fa-star" aria-hidden="true"></i> ${repo.stargazers_count}
              </span>` : ''}
            ${repo.forks_count !== undefined ? `
              <span class="project-metric" title="${repo.forks_count} forks">
                <i class="fas fa-code-fork" aria-hidden="true"></i> ${repo.forks_count}
              </span>` : ''}
          </div>
          <div class="project-links">
            ${externalLink}
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer"
               class="project-link-btn" aria-label="View ${repo.name} source code on GitHub" title="View Source">
              <i class="fab fa-github" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function populateContact() {
  const terminalContainer = document.getElementById('contact-term-body');
  if (terminalContainer && window.ContactTerminal) {
    ContactTerminal.run(terminalContainer, portfolioConfig.personal, portfolioConfig.social);
  }
}

function populateFooter() {
  const socialEl = document.getElementById('footer-social');
  if (!socialEl) return;
  socialEl.innerHTML = Object.values(portfolioConfig.social).map(s => `
    <a href="${s.url}" target="_blank" rel="noopener noreferrer"
       class="footer-social-link" aria-label="${s.label}">
      <i class="${s.icon}" aria-hidden="true"></i>
    </a>
  `).join('');
}

/* ────────────────────────────────────────
   ANIMATED COUNTER
──────────────────────────────────────── */
function animateCounter(elementId, targetValue, duration = 1200) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed  = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out cubic
          const eased    = 1 - Math.pow(1 - progress, 3);
          const current  = Math.round(start + (targetValue - start) * eased);
          el.textContent = current;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = targetValue;
          }
        }

        requestAnimationFrame(update);
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(el);
}

/* ────────────────────────────────────────
   INTERACTIVE CANVAS (Reactive Physics Mesh)
──────────────────────────────────────── */
function initHeroCanvas() {
  const canvas = DOM.heroCanvas;
  if (!canvas || app.reduced) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let width, height;
  let particles = [];
  const mouse = { x: -9999, y: -9999, radius: 140 };

  function resize() {
    width  = canvas.width  = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', debounce(resize, 200));

  class Particle {
    constructor() {
      this.x     = Math.random() * width;
      this.y     = Math.random() * height;
      this.vx    = (Math.random() - 0.5) * 0.45;
      this.vy    = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 1.5 + 0.8;
      this.baseAlpha = Math.random() * 0.4 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse repulsion
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const angle = Math.atan2(dy, dx);
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= Math.cos(angle) * force * 3.5;
        this.y -= Math.sin(angle) * force * 3.5;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = app.theme === 'dark'
        ? `rgba(0, 212, 255, ${this.baseAlpha})`
        : `rgba(124, 58, 237, ${this.baseAlpha})`;
      ctx.fill();
    }
  }

  const count = Math.min(Math.floor((width * height) / 12000), 75);
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function drawLines() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = app.theme === 'dark'
            ? `rgba(0, 212, 255, ${alpha})`
            : `rgba(124, 58, 237, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawLines();
    animationId = requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
}

/* ────────────────────────────────────────
   CUSTOM CURSOR
──────────────────────────────────────── */
function initCursor() {
  if (app.touch || app.reduced) return;
  const dot  = DOM.cursorDot;
  const ring = DOM.cursorRing;
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderRing);
  }
  renderRing();

  // Hover expansion on interactive elements
  const interactives = 'a, button, input, .project-card, .stat-card, .contact-card, .cmd-palette-btn';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactives)) {
      ring.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactives)) {
      ring.classList.remove('hovering');
    }
  });
}

/* ────────────────────────────────────────
   PROJECT FILTERS
──────────────────────────────────────── */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter.toLowerCase();
      const cards  = document.querySelectorAll('.project-card');

      cards.forEach(card => {
        if (filter === 'all') {
          card.style.display = '';
          return;
        }

        const categories = (card.dataset.categories || '').toLowerCase();
        const lang = (card.dataset.lang || '').toLowerCase();

        const matches = categories.includes(filter) || lang.includes(filter);
        card.style.display = matches ? '' : 'none';
      });
    });
  });
}

/* ────────────────────────────────────────
   3D TILT EFFECT
──────────────────────────────────────── */
function initTiltEffects() {
  if (app.reduced || app.touch) return;
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect    = card.getBoundingClientRect();
      const x       = e.clientX - rect.left;
      const y       = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ────────────────────────────────────────
   NAVBAR & SCROLL
──────────────────────────────────────── */
function initNavbar() {
  const navbar = DOM.navbar;
  if (!navbar) return;

  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', debounce(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    // Active section highlighting
    const scrollPos = window.scrollY + 100;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, 10));
}

function initScrollEvents() {
  // Smooth scrolling for all internal anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

function initBackToTop() {
  const btn = DOM.backTop;
  if (!btn) return;

  window.addEventListener('scroll', debounce(() => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, 50));

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initClock() {
  const el = DOM.statusClock;
  if (!el) return;

  function update() {
    const now = new Date();
    const opts = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    el.textContent = `${now.toLocaleTimeString('en-US', opts)} IST`;
  }
  update();
  setInterval(update, 1000);
}

/* ────────────────────────────────────────
   THEME SWITCHER
──────────────────────────────────────── */
function initTheme() {
  setTheme(app.theme);
  DOM.themeBtn?.addEventListener('click', () => {
    const next = app.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });
}

function setTheme(theme) {
  app.theme = theme;
  DOM.html.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
}

/* ── Utility Helpers ── */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text !== undefined && text !== null) el.textContent = text;
}

function setAttr(id, attr, val) {
  const el = document.getElementById(id);
  if (el && val) el.setAttribute(attr, val);
}

function debounce(fn, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}
