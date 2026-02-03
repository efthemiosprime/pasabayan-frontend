import './styles/main.scss';

// ================================
// NAVBAR
// ================================
class Navbar {
  constructor() {
    this.navbar = document.getElementById('navbar');
    this.toggle = document.getElementById('navToggle');
    this.menu = document.getElementById('navMenu');
    this.links = document.querySelectorAll('.navbar__link, .navbar__cta');
    
    this.init();
  }
  
  init() {
    // Scroll handler
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    
    // Mobile menu toggle
    this.toggle?.addEventListener('click', () => this.toggleMenu());
    
    // Close menu on link click
    this.links.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });
    
    // Initial check
    this.handleScroll();
  }
  
  handleScroll() {
    if (window.scrollY > 50) {
      this.navbar?.classList.add('scrolled');
    } else {
      this.navbar?.classList.remove('scrolled');
    }
  }
  
  toggleMenu() {
    this.toggle?.classList.toggle('active');
    this.menu?.classList.toggle('active');
  }
  
  closeMenu() {
    this.toggle?.classList.remove('active');
    this.menu?.classList.remove('active');
  }
}

// ================================
// SMOOTH SCROLL
// ================================
class SmoothScroll {
  constructor() {
    this.links = document.querySelectorAll('a[href^="#"]');
    this.init();
  }
  
  init() {
    this.links.forEach(link => {
      link.addEventListener('click', (e) => this.handleClick(e));
    });
  }
  
  handleClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offsetTop = target.offsetTop - 80; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }
}

// ================================
// SCROLL REVEAL
// ================================
class ScrollReveal {
  constructor() {
    this.elements = document.querySelectorAll('.step-card, .feature-card, .role-card, .founder-card');
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -30px 0px'
    });
    
    this.elements.forEach(el => observer.observe(el));
  }
}

// ================================
// TIMELINE PATH ANIMATOR
// ================================
class TimelinePathAnimator {
  constructor(sectionSelector, pathSelector) {
    this.section = document.querySelector(sectionSelector);
    this.path = document.querySelector(pathSelector);
    this.cards = this.section?.querySelectorAll('.step-card');
    this.pathLength = 0;
    this.isInitialized = false;
    
    if (this.section && this.path && this.cards?.length) {
      this.init();
    }
  }
  
  init() {
    // Wait for layout to stabilize
    setTimeout(() => {
      this.updatePath();
      this.setupScrollAnimation();
      this.isInitialized = true;
    }, 100);
    
    // Update on resize with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.updatePath(), 150);
    });
  }
  
  updatePath() {
    if (!this.cards?.length || window.innerWidth < 1024) {
      this.path.setAttribute('d', '');
      this.pathLength = 0;
      return;
    }
    
    const timeline = this.path.closest('.timeline');
    const timelineRect = timeline.getBoundingClientRect();
    const points = [];
    
    this.cards.forEach((card) => {
      const marker = card.querySelector('.step-card__marker');
      if (!marker) return;
      
      // Use offsetTop/offsetLeft for stable positioning relative to timeline
      // These are document-relative, not affected by scroll
      const markerRect = marker.getBoundingClientRect();
      const timelineScrollTop = timeline.getBoundingClientRect().top + window.scrollY;
      const timelineScrollLeft = timeline.getBoundingClientRect().left + window.scrollX;
      
      const markerScrollTop = markerRect.top + window.scrollY;
      const markerScrollLeft = markerRect.left + window.scrollX;
      
      const x = markerScrollLeft + markerRect.width / 2 - timelineScrollLeft;
      const y = markerScrollTop + markerRect.height / 2 - timelineScrollTop;
      
      points.push({ x, y });
    });
    
    if (points.length < 2) return;
    
    // Generate smooth curved path
    const pathD = this.generateCurvedPath(points);
    this.path.setAttribute('d', pathD);
    
    // Get path length and set up dash animation
    this.pathLength = this.path.getTotalLength();
    this.path.style.strokeDasharray = this.pathLength;
    this.path.style.strokeDashoffset = this.pathLength;
  }
  
  generateCurvedPath(points) {
    if (points.length < 2) return '';
    
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      // Calculate control points for smooth S-curve
      const midY = (prev.y + curr.y) / 2;
      
      d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }
    
    return d;
  }
  
  setupScrollAnimation() {
    const updatePath = () => {
      if (!this.pathLength || window.innerWidth < 1024) return;
      
      const rect = this.section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // Animation spans most of the section scroll
      // Start: when section title is ~70% up the viewport
      // End: when we've scrolled through ~80% of the section
      const startTrigger = windowHeight * 0.7;
      const scrollRange = sectionHeight * 0.75;
      
      // Calculate progress
      const scrolled = startTrigger - sectionTop;
      let progress = scrolled / scrollRange;
      progress = Math.max(0, Math.min(1, progress));
      
      // Draw path
      const drawLength = this.pathLength * progress;
      this.path.style.strokeDashoffset = this.pathLength - drawLength;
    };
    
    window.addEventListener('scroll', updatePath, { passive: true });
    updatePath();
  }
}

// ================================
// PARALLAX
// ================================
class Parallax {
  constructor() {
    this.elements = document.querySelectorAll('.parallax-slow, .parallax-medium, .parallax-fast');
    this.heroShapes = document.querySelectorAll('.hero__bg-shape');
    this.ticking = false;
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });
  }
  
  handleScroll() {
    const scrollY = window.scrollY;
    
    // Hero shapes parallax
    this.heroShapes.forEach((shape, index) => {
      const speed = index === 0 ? 0.3 : 0.2;
      shape.style.transform = `translateY(${scrollY * speed}px)`;
    });
    
    // Journey background elements
    this.elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const speed = el.classList.contains('parallax-slow') ? 0.1 : 
                    el.classList.contains('parallax-medium') ? 0.2 : 0.3;
      
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = (window.innerHeight - rect.top) * speed;
        el.style.transform = `translateY(${offset}px)`;
      }
    });
  }
}

// ================================
// HERO ANIMATION
// ================================
class HeroAnimation {
  constructor() {
    this.connectionLine = document.querySelector('.hero__connection-line path');
    this.init();
  }
  
  init() {
    if (this.connectionLine) {
      this.animateDash();
    }
  }
  
  animateDash() {
    // CSS animation handles this
  }
}

// ================================
// INITIALIZE
// ================================
document.addEventListener('DOMContentLoaded', () => {
  // Core functionality
  new Navbar();
  new SmoothScroll();
  new ScrollReveal();
  new Parallax();
  new HeroAnimation();
  
  // Timeline path animators - initialize after a short delay for layout stability
  setTimeout(() => {
    new TimelinePathAnimator('.journey--sender', '.timeline__path--sender');
    new TimelinePathAnimator('.journey--carrier', '.timeline__path--carrier');
  }, 50);
  
  // Add visible class to elements already in view on page load
  setTimeout(() => {
    const cards = document.querySelectorAll('.step-card, .feature-card, .role-card, .founder-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        card.classList.add('visible');
      }
    });
  }, 150);
});
