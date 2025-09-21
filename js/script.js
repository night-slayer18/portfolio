'use strict';

// ===== GLOBAL VARIABLES =====
const app = {
  theme: localStorage.getItem('theme') || 'light',
  isScrolling: false,
  mobile: window.innerWidth <= 768,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  touchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0
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
  initStatsCounter();
  
  // Add event listeners
  addEventListeners();
  
  // Prevent horizontal scroll on mobile
  preventHorizontalScroll();
}

// ===== PREVENT HORIZONTAL SCROLL =====
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
    if (!elements.navbar.contains(e.target) && elements.navMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });
  
  // Close mobile menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.navMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });
  
  // Active link highlighting on scroll
  window.addEventListener('scroll', throttle(updateActiveNavLink, 100));
}

function toggleMobileMenu() {
  const isActive = elements.hamburger.classList.contains('active');
  
  elements.hamburger.classList.toggle('active');
  elements.navMenu.classList.toggle('active');
  elements.body.style.overflow = isActive ? '' : 'hidden';
  
  // Update aria attributes for accessibility
  elements.hamburger.setAttribute('aria-expanded', !isActive);
}

function closeMobileMenu() {
  elements.hamburger.classList.remove('active');
  elements.navMenu.classList.remove('active');
  elements.body.style.overflow = '';
  elements.hamburger.setAttribute('aria-expanded', 'false');
}

function smoothScroll(e) {
  e.preventDefault();
  const targetId = e.target.getAttribute('href');
  const targetSection = document.querySelector(targetId);
  
  if (targetSection) {
    const offsetTop = targetSection.offsetTop - (app.mobile ? 70 : 80);
    
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
}

function updateActiveNavLink() {
  if (app.isScrolling) return;
  
  const sections = document.querySelectorAll('section');
  const scrollPos = window.scrollY + (app.mobile ? 100 : 150);
  
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
  
  // Add keyboard support
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
  
  // Update theme toggle aria-label
  if (elements.themeToggle) {
    elements.themeToggle.setAttribute('aria-label', 
      `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`
    );
  }
}

// ===== HERO ANIMATION =====
function initHeroAnimation() {
  if (!elements.heroCanvas) return;
  
  const canvas = elements.heroCanvas;
  const ctx = canvas.getContext('2d');
  let animationId;
  
  // Set canvas size
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
  
  // Particle system
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

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation loop with performance optimization
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
  
  // Pause animation when page is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else if (!app.reducedMotion) {
      animate(0);
    }
  });
}

// ===== TYPING EFFECT =====
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

// ===== STATS COUNTER =====
function initStatsCounter() {
  if (!elements.statNumbers.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  elements.statNumbers.forEach(stat => {
    observer.observe(stat);
  });
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-count'));
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;
  
  const timer = setInterval(() => {
    current += increment;
    element.textContent = Math.floor(current);
    
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    }
  }, 16);
}

// ===== CUSTOM CURSOR =====
function initCustomCursor() {
  if (!elements.cursor || !elements.cursorFollower || app.mobile || app.touchDevice) {
    // Hide cursor elements on touch devices
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
  
  // Cursor interactions
  const interactiveElements = document.querySelectorAll('a, button, .btn, .nav-link');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      elements.cursorFollower.style.transform += ' scale(1.5)';
    });
    
    el.addEventListener('mouseleave', () => {
      elements.cursorFollower.style.transform = elements.cursorFollower.style.transform.replace(' scale(1.5)', '');
    });
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
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
  animatedElements.forEach(el => {
    observer.observe(el);
  });
}

// ===== CONTACT FORM =====
function initContactForm() {
  if (!elements.contactForm) return;
  
  const inputs = elements.contactForm.querySelectorAll('input, textarea');
  
  // Add floating label functionality
  inputs.forEach(input => {
    // Set initial state
    if (input.value) {
      input.classList.add('has-value');
    }
    
    input.addEventListener('input', () => {
      if (input.value) {
        input.classList.add('has-value');
      } else {
        input.classList.remove('has-value');
      }
    });
    
    input.addEventListener('blur', () => {
      if (!input.value) {
        input.classList.remove('has-value');
      }
    });
  });
  
  // Form submission
  elements.contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(elements.contactForm);
    
    // Basic validation
    const phone = formData.get('phone');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    if (!subject || !message) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }
    
    if (subject.length < 5) {
      showNotification('Subject must be at least 5 characters long.', 'error');
      return;
    }
    
    if (message.length < 10) {
      showNotification('Message must be at least 10 characters long.', 'error');
      return;
    }
    
    submitBtn.classList.add('loading');
    
    try {
      // Simulate API call - replace with actual form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
      elements.contactForm.reset();
      
      // Remove has-value classes
      inputs.forEach(input => input.classList.remove('has-value'));
      
    } catch (error) {
      // Show error message
      showNotification('Failed to send message. Please try again or contact me directly.', 'error');
      console.error('Form submission error:', error);
    } finally {
      submitBtn.classList.remove('loading');
    }
  });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close" aria-label="Close notification">&times;</button>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--${type === 'success' ? 'success' : type === 'error' ? 'error' : 'primary'}-color);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
    animation: slideInFromRight 0.3s ease;
    font-weight: 500;
  `;
  
  document.body.appendChild(notification);
  
  // Close button functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.style.animation = 'slideOutToRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (document.contains(notification)) {
      notification.style.animation = 'slideOutToRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
  
  // Add CSS animations
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideInFromRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutToRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s ease;
      }
      
      .notification-close:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
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
  
  // Add keyboard support
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

// ===== UTILITY FUNCTIONS =====
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

// ===== EVENT LISTENERS =====
function addEventListeners() {
  // Resize handler with debounce
  window.addEventListener('resize', debounce(() => {
    app.mobile = window.innerWidth <= 768;
    
    // Close mobile menu on resize
    if (!app.mobile && elements.navMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  }, 250));

  // Optimized scroll handler
  window.addEventListener('scroll', throttle(() => {
    const scrollY = window.scrollY;
    
    // Update navbar
    if (scrollY > 50) {
      elements.navbar.classList.add('scrolled');
    } else {
      elements.navbar.classList.remove('scrolled');
    }

    // Show/hide back to top button
    if (scrollY > 500) {
      elements.backToTop.classList.add('show');
    } else {
      elements.backToTop.classList.remove('show');
    }
  }, 100));
  
  // Handle focus for accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
  
  // Handle reduced motion preference changes
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', (e) => {
    app.reducedMotion = e.matches;
    if (e.matches) {
      // Stop animations
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  });
  
  // Prevent zoom on double tap for iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Handle orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      // Force a reflow to fix any layout issues
      document.body.style.height = '100.1%';
      setTimeout(() => {
        document.body.style.height = '';
      }, 100);
    }, 500);
  });
}

// ===== PERFORMANCE MONITORING =====
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Preload critical resources when browser is idle
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

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e.error);
  // You could send error reports to a logging service here
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise Rejection:', e.reason);
  // You could send error reports to a logging service here
});

// ===== INITIALIZATION COMPLETE =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio website initialized successfully');
});
