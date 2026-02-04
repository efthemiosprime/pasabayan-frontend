/**
 * ScrollManager - Smooth scroll system using Lenis
 * Provides normalized 0-1 progress for the entire journey
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';

export class ScrollManager {
  constructor(options = {}) {
    this.progress = 0;
    this.velocity = 0;
    this.direction = 1;
    this.isScrolling = false;
    this.callbacks = [];
    this.sectionCallbacks = new Map();
    
    // Journey length (virtual scroll height) - extended for comfortable viewing
    this.journeyLength = options.journeyLength || 16000;
    
    // Section breakpoints - 3D cards: 0-80%, Gap: 80-88%, HTML: 88-100%
    // With 16000px scroll height, each % = 160px of scroll
    this.sections = options.sections || [
      { id: 'intro', start: 0, end: 0.03 },
      { id: 'send-anything', start: 0.03, end: 0.08 },   // 3D sender intro
      { id: 'sender-steps', start: 0.08, end: 0.38 },    // 3D sender cards (ends 38%)
      { id: 'earn-traveling', start: 0.40, end: 0.45 },  // 3D carrier intro  
      { id: 'carrier-steps', start: 0.45, end: 0.80 },   // 3D carrier cards (ends 80%)
      { id: 'features', start: 0.88, end: 0.92 },        // Built for Trust - 4% = 640px
      { id: 'team', start: 0.94, end: 0.97 },            // Meet the Team - 3% = 480px
      { id: 'cta', start: 0.99, end: 1.01 }              // Footer/CTA - stays visible
    ];
    
    this.currentSection = null;
    this.init();
  }

  init() {
    // Set up the scroll container height
    this.scrollContainer = document.getElementById('scroll-container');
    if (this.scrollContainer) {
      this.scrollContainer.style.height = `${this.journeyLength}px`;
    }

    // Reset scroll position to top on page load to prevent stale state
    window.scrollTo(0, 0);

    // Initialize Lenis for ultra-smooth scrolling
    this.lenis = new Lenis({
      duration: 2.0,  // Longer duration for smoother feel
      easing: (t) => 1 - Math.pow(1 - t, 4),  // Smooth ease-out quartic
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,  // Slower scroll for more control
      touchMultiplier: 1.5,
      infinite: false
    });

    // Bind scroll event
    this.lenis.on('scroll', (e) => this.onScroll(e));

    // Start animation loop
    this.startLoop();
    
    // Force initial state update based on current scroll position
    // This handles cases where browser might restore scroll position
    requestAnimationFrame(() => {
      this.forceUpdate();
    });
  }
  
  forceUpdate() {
    // Calculate current progress based on actual scroll position
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = this.journeyLength - window.innerHeight;
    
    this.progress = Math.max(0, Math.min(1, scrollY / maxScroll));
    this.currentSection = this.getCurrentSection();
    
    // Notify all callbacks with current state
    this.callbacks.forEach(cb => cb({
      progress: this.progress,
      velocity: 0,
      direction: 1,
      section: this.currentSection,
      sectionProgress: this.getSectionProgress()
    }));
  }

  startLoop() {
    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  onScroll(e) {
    const scrollY = e.scroll;
    const maxScroll = this.journeyLength - window.innerHeight;
    
    // Calculate normalized progress (0 to 1)
    this.progress = Math.max(0, Math.min(1, scrollY / maxScroll));
    this.velocity = e.velocity;
    this.direction = e.direction;
    this.isScrolling = Math.abs(e.velocity) > 0.01;

    // Detect current section
    const newSection = this.getCurrentSection();
    if (newSection !== this.currentSection) {
      const prevSection = this.currentSection;
      this.currentSection = newSection;
      this.onSectionChange(prevSection, newSection);
    }

    // Notify all callbacks
    this.callbacks.forEach(cb => cb({
      progress: this.progress,
      velocity: this.velocity,
      direction: this.direction,
      section: this.currentSection,
      sectionProgress: this.getSectionProgress()
    }));
  }

  getCurrentSection() {
    for (const section of this.sections) {
      if (this.progress >= section.start && this.progress < section.end) {
        return section;
      }
    }
    return this.sections[this.sections.length - 1];
  }

  getSectionProgress() {
    if (!this.currentSection) return 0;
    const { start, end } = this.currentSection;
    return (this.progress - start) / (end - start);
  }

  onSectionChange(prev, current) {
    // Dispatch section change event
    if (this.sectionCallbacks.has(current?.id)) {
      this.sectionCallbacks.get(current.id).forEach(cb => cb('enter', current));
    }
    if (prev && this.sectionCallbacks.has(prev.id)) {
      this.sectionCallbacks.get(prev.id).forEach(cb => cb('leave', prev));
    }

    // Dispatch custom event for UI
    window.dispatchEvent(new CustomEvent('sectionchange', {
      detail: { prev: prev?.id, current: current?.id, progress: this.progress }
    }));
  }

  onProgress(callback) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) this.callbacks.splice(index, 1);
    };
  }

  onSection(sectionId, callback) {
    if (!this.sectionCallbacks.has(sectionId)) {
      this.sectionCallbacks.set(sectionId, []);
    }
    this.sectionCallbacks.get(sectionId).push(callback);
  }

  scrollTo(target, options = {}) {
    if (typeof target === 'number') {
      // Scroll to progress value (0-1)
      const maxScroll = this.journeyLength - window.innerHeight;
      this.lenis.scrollTo(target * maxScroll, options);
    } else if (typeof target === 'string') {
      // Scroll to section by id
      const section = this.sections.find(s => s.id === target);
      if (section) {
        const maxScroll = this.journeyLength - window.innerHeight;
        this.lenis.scrollTo(section.start * maxScroll, options);
      }
    }
  }

  stop() {
    this.lenis.stop();
  }

  start() {
    this.lenis.start();
  }

  destroy() {
    this.lenis.destroy();
    this.callbacks = [];
    this.sectionCallbacks.clear();
  }
}
