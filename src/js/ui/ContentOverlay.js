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
        isVisible: false,
        hasAnimated: false
      };
      
      this.sections.push(section);
      
      // Initially hide all except intro
      if (sectionId !== 'intro') {
        element.classList.add('hidden');
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
  }

  updateSections(progress, currentScrollSection) {
    // Define visibility ranges for each section
    const sectionRanges = {
      'intro': { start: 0, end: 0.12 },
      'send-anything': { start: 0.10, end: 0.28 },
      'sender-steps': { start: 0.25, end: 0.42 },
      'earn-traveling': { start: 0.40, end: 0.58 },
      'carrier-steps': { start: 0.55, end: 0.72 },
      'features': { start: 0.70, end: 0.87 },
      'team': { start: 0.85, end: 0.96 },
      'cta': { start: 0.94, end: 1.0 }
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
      gsap.to(inner, {
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          section.element.classList.remove('visible');
          section.element.classList.add('hidden');
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
