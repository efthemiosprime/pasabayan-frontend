/**
 * ContentOverlay - Manages scroll-triggered content sections
 * Handles visibility, animations, and transitions
 */

import { gsap } from 'gsap';

export class ContentOverlay {
  constructor(scrollManager) {
    this.scrollManager = scrollManager;
    this.sections = [];
    this.currentSection = null;
    
    this.init();
  }

  init() {
    // Get all content sections
    const sectionElements = document.querySelectorAll('.content-section');
    
    sectionElements.forEach(element => {
      const sectionId = element.dataset.section;
      const section = {
        id: sectionId,
        element: element,
        isVisible: sectionId === 'intro', // Intro starts visible
        hasAnimated: false
      };
      
      this.sections.push(section);
      
      // Initially hide ALL sections except intro
      if (sectionId === 'intro') {
        element.classList.remove('hidden');
        element.classList.add('visible');
      } else {
        element.classList.add('hidden');
        element.classList.remove('visible');
      }
    });
    
    // Subscribe to scroll progress
    this.scrollManager.onProgress((data) => {
      this.updateSections(data.progress, data.section);
    });
    
    // Subscribe to section changes
    window.addEventListener('sectionchange', (e) => {
      this.onSectionChange(e.detail.prev, e.detail.current);
    });
    
    // Initialize sections based on current scroll position (handles page refresh)
    requestAnimationFrame(() => {
      const progress = this.scrollManager.progress || 0;
      this.initializeSectionsForProgress(progress);
    });
  }
  
  initializeSectionsForProgress(progress) {
    // Define visibility ranges (same as updateSections)
    const sectionRanges = {
      'intro': { start: 0, end: 0.03 },
      'send-anything': { start: -1, end: -1 },
      'sender-steps': { start: -1, end: -1 },
      'earn-traveling': { start: -1, end: -1 },
      'carrier-steps': { start: -1, end: -1 },
      'features': { start: 0.88, end: 0.92 },
      'team': { start: 0.94, end: 0.97 },
      'cta': { start: 0.99, end: 1.01 }
    };
    
    this.sections.forEach(section => {
      const range = sectionRanges[section.id];
      if (!range) return;
      
      const shouldBeVisible = progress >= range.start && progress <= range.end;
      
      if (shouldBeVisible) {
        // Show immediately without animation on load
        section.isVisible = true;
        section.element.classList.remove('hidden');
        section.element.classList.add('visible');
        section.element.style.display = ''; // Remove inline display:none
        
        // Set full opacity
        const inner = section.element.querySelector('.content-section__inner');
        if (inner) {
          inner.style.opacity = '1';
          inner.style.transform = 'translateY(0)';
        }
      } else {
        // Ensure hidden
        section.isVisible = false;
        section.element.classList.add('hidden');
        section.element.classList.remove('visible');
        // Keep display:none for hidden sections
      }
    });
  }

  updateSections(progress, currentScrollSection) {
    // Define visibility ranges for each section
    // 3D cards end at 80%, fade out by 83%
    // 5% gap before HTML sections start at 88%
    // With 16000px scroll: 1% = 160px of scroll distance
    const sectionRanges = {
      'intro': { start: 0, end: 0.03 },          // Disappears shortly after scroll starts
      'send-anything': { start: -1, end: -1 },   // Hidden - shown in 3D
      'sender-steps': { start: -1, end: -1 },    // Hidden - shown in 3D
      'earn-traveling': { start: -1, end: -1 },  // Hidden - shown in 3D
      'carrier-steps': { start: -1, end: -1 },   // Hidden - shown in 3D
      'features': { start: 0.88, end: 0.92 },    // Built for Trust - 4% = 640px scroll
      'team': { start: 0.94, end: 0.97 },        // Meet the Team - 2% gap, 3% = 480px scroll
      'cta': { start: 0.99, end: 1.01 }          // Footer/CTA - 2% gap, stays visible
    };
    
    this.sections.forEach(section => {
      const range = sectionRanges[section.id];
      if (!range) return;
      
      const shouldBeVisible = progress >= range.start && progress <= range.end;
      
      if (shouldBeVisible && !section.isVisible) {
        this.showSection(section);
      } else if (!shouldBeVisible && section.isVisible) {
        this.hideSection(section);
      }
      
      // Update section-specific animations
      if (section.isVisible) {
        const sectionProgress = (progress - range.start) / (range.end - range.start);
        this.updateSectionAnimation(section, sectionProgress);
      }
    });
  }

  showSection(section) {
    section.isVisible = true;
    section.element.classList.remove('hidden');
    section.element.classList.add('visible');
    // Remove inline display:none if present
    section.element.style.display = '';
    
    // Animate in
    const inner = section.element.querySelector('.content-section__inner');
    if (inner) {
      gsap.fromTo(inner,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }
    
    // Animate cards if present
    const cards = section.element.querySelectorAll('.step-card, .feature-item, .team-member');
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          delay: 0.1 + i * 0.1,
          ease: 'power2.out'
        }
      );
    });
    
    // Animate timeline steps if present
    const timelineSteps = section.element.querySelectorAll('.timeline-step');
    timelineSteps.forEach((step, i) => {
      gsap.fromTo(step,
        { opacity: 0, x: -30 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.6, 
          delay: 0.2 + i * 0.15,
          ease: 'power2.out',
          onComplete: () => step.classList.add('visible')
        }
      );
    });
    
    // Animate timeline path
    const pathProgress = section.element.querySelector('.journey-timeline__path-progress');
    if (pathProgress) {
      gsap.fromTo(pathProgress,
        { strokeDashoffset: 400 },
        { 
          strokeDashoffset: 0, 
          duration: 2, 
          delay: 0.3,
          ease: 'power2.out'
        }
      );
    }
  }

  hideSection(section) {
    section.isVisible = false;
    
    const inner = section.element.querySelector('.content-section__inner');
    if (inner) {
      // Instant hide to prevent overlap with next section
      gsap.to(inner, {
        opacity: 0,
        y: -20,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => {
          section.element.classList.remove('visible');
          section.element.classList.add('hidden');
          section.element.style.display = 'none'; // Fully hide
        }
      });
    }
  }

  updateSectionAnimation(section, progress) {
    // Section-specific parallax and animations
    const inner = section.element.querySelector('.content-section__inner');
    if (!inner) return;
    
    // Subtle parallax movement
    const parallaxY = (progress - 0.5) * -20;
    inner.style.transform = `translateY(${parallaxY}px)`;
    
    // Fade effect at edges
    let opacity = 1;
    if (progress < 0.15) {
      opacity = progress / 0.15;
    } else if (progress > 0.85) {
      opacity = (1 - progress) / 0.15;
    }
    inner.style.opacity = opacity;
  }

  onSectionChange(prevId, currentId) {
    // Handle section transition effects
    console.log(`Section changed: ${prevId} -> ${currentId}`);
    
    // Update body class for section-specific styling
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('section-'))
      .join(' ');
    
    if (currentId) {
      document.body.classList.add(`section-${currentId}`);
    }
  }

  // Scroll to a specific section
  goToSection(sectionId) {
    this.scrollManager.scrollTo(sectionId, { duration: 1.5 });
  }
}
