/**
 * Modern Portfolio Website JavaScript
 * Author: Samanuai
 * Version: 2.0.0
 */

'use strict';

// ===== GLOBAL VARIABLES =====
const app = {
  theme: localStorage.getItem('theme') || 'light',
  isScrolling: false,
  mobile: window.innerWidth <= 768,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// ===== DOM ELEMENTS =====
const elements = {
  body: document.body,
  navbar: document.querySelector('.navbar'),
  hamburger: document.querySelector('.hamburger'),
  navMenu: document.querySelector('.nav-menu'),
  navLinks: document.querySelectorAll('.nav-link'),
  themeToggle: document.querySelector('.theme-toggle'),
  preloader: document.querySelector('.preloader'),
  backToTop: document.querySelector('.back-to-top'),
  heroCanvas: document.getElementById('hero-canvas'),
  typingCode: document.getElementById('typing-code'),
  contactForm: document.getElementById('contact-form'),
  statNumbers: document.querySelectorAll('.stat-number'),
  cursor: document.querySelector('.cursor'),
  cursorFollower: document.querySelector('.cursor-follower')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Set initial theme
  setTheme(app.theme);
  
  // Initialize components
  initPreloader();
  initNavigation();
  initThemeToggle();
  initHeroAnimation();
  initScrollAnimations();
  initContactForm();
  initBackToTop();
  initCustomCursor();
  initTypingEffect();
  
  // Add event listeners
  addEventListeners();
}

// ===== PRELOADER =====
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
          // Trigger entrance animations
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
  // Add animation classes to elements
  const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
  
  animatedElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, index * 100);
  });
}

// ===== NAVIGATION =====
function initNavigation() {
  if (!elements.hamburger || !elements.navMenu) return;
  
  // Hamburger menu toggle
  elements.hamburger.addEventListener('click', toggleMobileMenu);
  
  // Close mobile menu when clicking nav links
  elements.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      closeMobileMenu();
      smoothScroll(e);
    });
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!elements.navbar.contains(e.target)) {
      closeMobileMenu();
    }
  });
  
  // Active link highlighting on scroll
  window.addEventListener('scroll', updateActiveNavLink);
}

function toggleMobileMenu() {
  elements.hamburger.classList.toggle('active');
  elements.navMenu.classList.toggle('active');
  elements.body.style.overflow = elements.navMenu.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
  elements.hamburger.classList.remove('active');
  elements.navMenu.classList.remove('active');
  elements.body.style.overflow = '';
}

function smoothScroll(e) {
  e.preventDefault();
  const targetId = e.target.getAttribute('href');
  const targetSection = document.querySelector(targetId);
  
  if (targetSection) {
    const offsetTop = targetSection.offsetTop - 80;
    
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
}

function updateActiveNavLink() {
  if (app.isScrolling) return;
  
  const sections = document.querySelectorAll('section');
  const scrollPos = window.scrollY + 100;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
  if (!elements.themeToggle) return;
  
  elements.themeToggle.addEventListener('click', () => {
    const newTheme = app.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
}

function setTheme(theme) {
  app.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// ===== HERO ANIMATION =====
function initHeroAnimation() {
  if (!elements.heroCanvas) return;
  
  const canvas = elements.heroCanvas;
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Particle system
  const particles = [];
  const particleCount = app.mobile ? 30 : 60;
  
  class Particle {
    constructor() {
      this.reset();
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
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

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation loop
  function animate() {
    if (app.reducedMotion) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// ===== TYPING EFFECT =====
function initTypingEffect() {
  if (!elements.typingCode) return;

  const codeText = elements.typingCode.querySelector('code').innerText;
  elements.typingCode.querySelector('code').innerText = '';

  let i = 0;
  const typeInterval = setInterval(() => {
    if (i < codeText.length) {
      elements.typingCode.querySelector('code').innerText += codeText.charAt(i);
      i++;
    } else {
      clearInterval(typeInterval);
    }
  }, 50);
}

// ===== CUSTOM CURSOR =====
function initCustomCursor() {
  if (!elements.cursor || !elements.cursorFollower || app.mobile) return;

  document.addEventListener('mousemove', (e) => {
    if (app.reducedMotion) return;

    elements.cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    elements.cursorFollower.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  if (app.reducedMotion) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
    observer.observe(el);
  });
}

// ===== CONTACT FORM =====
function initContactForm() {
  if (!elements.contactForm) return;
  
  elements.contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    
    try {
      // Add your form submission logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      // Show success message
      alert('Message sent successfully!');
      elements.contactForm.reset();
    } catch (error) {
      // Show error message
      alert('Failed to send message. Please try again.');
    } finally {
      submitBtn.classList.remove('loading');
    }
  });
}

// ===== BACK TO TOP =====
function initBackToTop() {
  if (!elements.backToTop) return;
  
  elements.backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ===== EVENT LISTENERS =====
function addEventListeners() {
  window.addEventListener('resize', () => {
    app.mobile = window.innerWidth <= 768;
  });

  window.addEventListener('scroll', () => {
    // Update navbar
    if (window.scrollY > 50) {
      elements.navbar.classList.add('scrolled');
    } else {
      elements.navbar.classList.remove('scrolled');
    }

    // Show/hide back to top button
    if (window.scrollY > 500) {
      elements.backToTop.classList.add('show');
    } else {
      elements.backToTop.classList.remove('show');
    }
  });
}
