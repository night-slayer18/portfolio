'use strict';
const app = {
  theme: localStorage.getItem('theme') || 'dark',
  isScrolling: false,
  mobile: window.innerWidth <= 768,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  touchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0
};
const elements = {
  body: document.body,
  navbar: document.querySelector('.navbar'),
  themeToggle: document.querySelector('.theme-toggle'),
  preloader: document.querySelector('.preloader'),
  backToTop: document.querySelector('.back-to-top'),
  heroCanvas: document.getElementById('hero-canvas'),
  typingCode: document.getElementById('typing-code'),
  cursor: document.querySelector('.cursor'),
  cursorFollower: document.querySelector('.cursor-follower')
};
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
async function initApp() {
  await fetchGitHubData();
  populateContentFromConfig();
  setTheme(app.theme);
  initPreloader();
  initNavigation();
  initThemeToggle();
  initHeroAnimation();
  initScrollAnimations();
  initBackToTop();
  initCustomCursor();
  initTypingEffect();
  addEventListeners();
  preventHorizontalScroll();
}
async function fetchGitHubData() {
  const githubUsername = portfolioConfig.social.github.url.split('/').pop();
  try {
    const profileResponse = await fetch(`https://api.github.com/users/${githubUsername}`);
    if (!profileResponse.ok) throw new Error('Failed to fetch GitHub profile');
    const profileData = await profileResponse.json();
    const reposResponse = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`);
    if (!reposResponse.ok) throw new Error('Failed to fetch repositories');
    const reposData = await reposResponse.json();
    const accountCreated = new Date(profileData.created_at);
    const now = new Date();
    const yearsExperience = Math.floor((now - accountCreated) / (1000 * 60 * 60 * 24 * 365));
    const languages = new Set();
    reposData.forEach(repo => {
      if (repo.language) {
        languages.add(repo.language);
      }
    });
    if (profileData.location) {
      portfolioConfig.personal.location = profileData.location;
    }
    if (profileData.company) {
      portfolioConfig.personal.company = profileData.company;
    }
    if (profileData.bio) {
      portfolioConfig.personal.bio = profileData.bio;
    }
    if (profileData.name) {
      portfolioConfig.personal.fullName = profileData.name;
    }
    if (profileData.public_repos) {
      portfolioConfig.stats.projects.count = profileData.public_repos;
    }
    if (yearsExperience > 0) {
      portfolioConfig.stats.experience.count = yearsExperience;
    }
    if (languages.size > 0) {
      portfolioConfig.stats.technologies.count = languages.size;
    }
    const languageIcons = {
      'Python': 'fab fa-python',
      'JavaScript': 'fab fa-js',
      'TypeScript': 'fab fa-js-square',
      'Go': 'fab fa-golang',
      'Java': 'fab fa-java',
      'C++': 'fab fa-cuttlefish',
      'C': 'fab fa-cuttlefish',
      'C#': 'fab fa-microsoft',
      'PHP': 'fab fa-php',
      'Ruby': 'fab fa-ruby',
      'Swift': 'fab fa-swift',
      'Kotlin': 'fab fa-android',
      'Rust': 'fab fa-rust',
      'HTML': 'fab fa-html5',
      'CSS': 'fab fa-css3-alt',
      'Vue': 'fab fa-vuejs',
      'React': 'fab fa-react',
      'Angular': 'fab fa-angular',
      'Node.js': 'fab fa-node-js',
      'Docker': 'fab fa-docker',
      'Shell': 'fas fa-terminal'
    };
    const languageCount = {};
    reposData.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });
    const topLanguages = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([lang]) => ({
        name: lang,
        icon: languageIcons[lang] || 'fas fa-code'
      }));
    if (topLanguages.length > 0) {
      portfolioConfig.techIcons = topLanguages;
    }
    portfolioConfig.githubRepos = reposData
      .filter(repo => !repo.fork && repo.description)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 6); 
    console.log('GitHub data fetched and config updated successfully');
  } catch (error) {
    console.warn('Failed to fetch GitHub data, using static config:', error);
  }
}
function populateContentFromConfig() {
  if (typeof portfolioConfig === 'undefined') {
    console.error('portfolioConfig is not defined. Make sure config.js is loaded before script.js');
    return;
  }
  const config = portfolioConfig;
  const titleElement = document.getElementById('meta-title');
  if (titleElement) titleElement.textContent = config.seo.title;
  updateMetaTag('meta-description', config.seo.description, 'content');
  updateMetaTag('meta-theme-color', config.seo.themeColor, 'content');
  updateMetaTag('meta-author', config.seo.author, 'content');
  updateMetaTag('og-type', config.seo.og.type, 'content');
  updateMetaTag('og-url', config.seo.og.url, 'content');
  updateMetaTag('og-title', config.seo.og.title, 'content');
  updateMetaTag('og-description', config.seo.og.description, 'content');
  updateMetaTag('og-image', config.seo.og.image, 'content');
  updateMetaTag('twitter-card', config.seo.twitter.card, 'content');
  updateMetaTag('twitter-url', config.seo.twitter.url, 'content');
  updateMetaTag('twitter-title', config.seo.twitter.title, 'content');
  updateMetaTag('twitter-description', config.seo.twitter.description, 'content');
  updateMetaTag('twitter-image', config.seo.twitter.image, 'content');
  updatePreloaderText(config.personal.name);
  updateElement('nav-logo-text', config.personal.name);
  updateElement('hero-greeting', config.hero.greeting);
  updateElement('hero-title-prefix', config.hero.title.prefix);
  updateElement('hero-title-name', config.hero.title.name);
  updateElement('hero-title-role', config.hero.title.role);
  updateElement('hero-description', config.hero.description);
  const heroCtaLink = document.getElementById('hero-cta-link');
  if (heroCtaLink) {
    heroCtaLink.href = config.hero.cta.href;
    updateElement('hero-cta-text', config.hero.cta.text);
    const icon = document.getElementById('hero-cta-icon');
    if (icon) icon.className = config.hero.cta.icon;
  }
  populateSocialLinks('social-links', config.social);
  updateElement('code-editor-filename', config.hero.codeEditor.filename);
  const codeContent = document.getElementById('code-editor-content');
  if (codeContent) {
    codeContent.textContent = config.hero.codeEditor.code;
  }
  populateTechIcons(config.techIcons);
  populateProjects(config.githubRepos || []);
  populateMinimalContact(config.personal, config.social);
  const copyright = document.getElementById('footer-copyright');
  if (copyright) {
    copyright.textContent = `© ${new Date().getFullYear()} ${config.personal.name}. All rights reserved.`;
  }
  populateSocialLinks('footer-social', config.social);
}
function updateMetaTag(id, value, attribute = 'content') {
  const element = document.getElementById(id);
  if (element) {
    if (attribute === 'content') {
      element.setAttribute('content', value);
    } else if (attribute === 'text') {
      element.textContent = value;
    } else {
      element[attribute] = value;
    }
  }
}
function updateElement(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}
function populateSocialLinks(containerId, socialLinks) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = Object.values(socialLinks).map(social => `
    <a
      href="${social.url}"
      target="_blank"
      aria-label="${social.label}"
      rel="noopener noreferrer"
    >
      <i class="${social.icon}"></i>
    </a>
  `).join('');
}
function populateTechIcons(techIcons) {
  const container = document.getElementById('tech-icons');
  if (!container) return;
  container.innerHTML = techIcons.map((tech, index) => `
    <div class="tech-icon" data-tech="${tech.name}" style="animation-delay: ${index * 1.5}s;">
      <i class="${tech.icon}"></i>
    </div>
  `).join('');
}
function populateProjects(repos) {
  const container = document.getElementById('projects-grid');
  if (!container) return;
  if (!repos || repos.length === 0) {
    container.innerHTML = `
      <div class="project-card">
        <p>Loading projects from GitHub...</p>
      </div>
    `;
    return;
  }
  const languageIcons = {
    'Python': 'fab fa-python',
    'JavaScript': 'fab fa-js',
    'TypeScript': 'fab fa-js-square',
    'Go': 'fab fa-golang',
    'Java': 'fab fa-java',
    'Kotlin': 'fab fa-android',
    'HTML': 'fab fa-html5',
    'CSS': 'fab fa-css3-alt',
    'Vue': 'fab fa-vuejs',
    'React': 'fab fa-react',
    'Node.js': 'fab fa-node-js',
    'Shell': 'fas fa-terminal'
  };
  container.innerHTML = repos.map(repo => {
    const langIcon = repo.language ? (languageIcons[repo.language] || 'fas fa-code') : 'fas fa-code';
    const topics = repo.topics && repo.topics.length > 0 
      ? repo.topics.slice(0, 3).map(topic => `<span class="project-topic">${topic}</span>`).join('')
      : '';
    return `
      <div class="project-card">
        <div class="project-header">
          <h3 class="project-name">
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
              ${repo.name}
            </a>
          </h3>
          ${repo.language ? `<span class="project-language"><i class="${langIcon}"></i> ${repo.language}</span>` : ''}
        </div>
        <p class="project-description">${repo.description || 'No description available'}</p>
        ${topics ? `<div class="project-topics">${topics}</div>` : ''}
        <div class="project-footer">
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">
            <i class="fab fa-github"></i> View on GitHub
          </a>
          ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" class="project-link">
            <i class="fas fa-external-link-alt"></i> Live Demo
          </a>` : ''}
        </div>
      </div>
    `;
  }).join('');
}
function populateMinimalContact(personal, social) {
  const container = document.getElementById('contact-links');
  if (!container) return;
  container.innerHTML = `
    <a href="mailto:${personal.email}" class="contact-link">
      <i class="fas fa-envelope"></i>
      <span>${personal.email}</span>
    </a>
    ${Object.values(social).map(s => `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="contact-link">
        <i class="${s.icon}"></i>
        <span>${s.label}</span>
      </a>
    `).join('')}
  `;
}
function updatePreloaderText(name) {
  const preloaderText = document.getElementById('preloader-text');
  if (!preloaderText) return;
  const chars = name.split('');
  preloaderText.innerHTML = `
    <span>&lt;</span>
    ${chars.map((char, index) => `<span style="animation-delay: ${(index + 1) * 0.1}s;">${char}</span>`).join('')}
    <span>/&gt;</span>
  `;
}
function preventHorizontalScroll() {
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        if (window.scrollX !== 0) {
          window.scrollTo(0, window.scrollY);
        }
        isScrolling = false;
      });
      isScrolling = true;
    }
  });
}
function initPreloader() {
  if (!elements.preloader) return;
  const loadingProgress = elements.preloader.querySelector('.loading-progress');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        elements.preloader.classList.add('fade-out');
        setTimeout(() => {
          elements.preloader.style.display = 'none';
          triggerEntranceAnimations();
        }, 500);
      }, 200);
    }
    if (loadingProgress) {
      loadingProgress.style.width = `${progress}%`;
    }
  }, 50);
}
function triggerEntranceAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
  animatedElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, index * 100);
  });
}
function initNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#home') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}
function initThemeToggle() {
  if (!elements.themeToggle) return;
  elements.themeToggle.addEventListener('click', () => {
    const newTheme = app.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
  elements.themeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const newTheme = app.theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    }
  });
}
function setTheme(theme) {
  app.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (elements.themeToggle) {
    elements.themeToggle.setAttribute('aria-label', 
      `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`
    );
  }
}
function initHeroAnimation() {
  if (!elements.heroCanvas) return;
  const canvas = elements.heroCanvas;
  const ctx = canvas.getContext('2d');
  let animationId;
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
  }
  resizeCanvas();
  window.addEventListener('resize', debounce(resizeCanvas, 250));
  const particles = [];
  const particleCount = app.mobile ? 20 : app.reducedMotion ? 10 : 50;
  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.offsetWidth;
      this.y = Math.random() * canvas.offsetHeight;
      this.vx = (Math.random() - 0.5) * (app.mobile ? 0.3 : 0.5);
      this.vy = (Math.random() - 0.5) * (app.mobile ? 0.3 : 0.5);
      this.size = Math.random() * (app.mobile ? 1.5 : 2) + 1;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.offsetWidth) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.offsetHeight) this.vy = -this.vy;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = app.theme === 'dark' ? '#667eea' : '#764ba2';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  let lastTime = 0;
  const targetFPS = app.mobile ? 30 : 60;
  const frameInterval = 1000 / targetFPS;
  function animate(currentTime) {
    if (app.reducedMotion) return;
    const deltaTime = currentTime - lastTime;
    if (deltaTime >= frameInterval) {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      lastTime = currentTime;
    }
    animationId = requestAnimationFrame(animate);
  }
  animate(0);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else if (!app.reducedMotion) {
      animate(0);
    }
  });
}
function initTypingEffect() {
  if (!elements.typingCode) return;
  const codeElement = elements.typingCode.querySelector('code');
  if (!codeElement) return;
  const codeText = codeElement.textContent.trim();
  codeElement.textContent = '';
  let i = 0;
  const typeSpeed = app.mobile ? 30 : 50;
  const typeInterval = setInterval(() => {
    if (i < codeText.length) {
      codeElement.textContent += codeText.charAt(i);
      i++;
    } else {
      clearInterval(typeInterval);
    }
  }, typeSpeed);
}
function initCustomCursor() {
  if (!elements.cursor || !elements.cursorFollower || app.mobile || app.touchDevice) {
    if (elements.cursor) elements.cursor.style.display = 'none';
    if (elements.cursorFollower) elements.cursorFollower.style.display = 'none';
    return;
  }
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  function animateCursor() {
    if (app.reducedMotion) return;
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    elements.cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    elements.cursorFollower.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  const interactiveElements = document.querySelectorAll('a, button, .btn');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      elements.cursorFollower.style.transform += ' scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      elements.cursorFollower.style.transform = elements.cursorFollower.style.transform.replace(' scale(1.5)', '');
    });
  });
}
function initScrollAnimations() {
  if (app.reducedMotion) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
  animatedElements.forEach(el => {
    observer.observe(el);
  });
}
function initBackToTop() {
  if (!elements.backToTop) return;
  elements.backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  elements.backToTop.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  });
}
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}
function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
function addEventListeners() {
  window.addEventListener('resize', debounce(() => {
    app.mobile = window.innerWidth <= 768;
  }, 250));
  window.addEventListener('scroll', throttle(() => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      elements.navbar.classList.add('scrolled');
    } else {
      elements.navbar.classList.remove('scrolled');
    }
    if (scrollY > 500) {
      elements.backToTop.classList.add('show');
    } else {
      elements.backToTop.classList.remove('show');
    }
  }, 100));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', (e) => {
    app.reducedMotion = e.matches;
    if (e.matches) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  });
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      document.body.style.height = '100.1%';
      setTimeout(() => {
        document.body.style.height = '';
      }, 100);
    }, 500);
  });
}
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    const criticalImages = document.querySelectorAll('img[loading="eager"]');
    criticalImages.forEach(img => {
      if (!img.complete) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
      }
    });
  });
}
window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e.error);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise Rejection:', e.reason);
});
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio website initialized successfully');
});
