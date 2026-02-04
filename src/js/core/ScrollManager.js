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
    
    // Journey length (virtual scroll height)
    this.journeyLength = options.journeyLength || 10000;
    
    // Section breakpoints
    this.sections = options.sections || [
      { id: 'intro', start: 0, end: 0.10 },
      { id: 'send-anything', start: 0.10, end: 0.25 },
      { id: 'sender-steps', start: 0.25, end: 0.40 },
      { id: 'earn-traveling', start: 0.40, end: 0.55 },
      { id: 'carrier-steps', start: 0.55, end: 0.70 },
      { id: 'features', start: 0.70, end: 0.85 },
      { id: 'team', start: 0.85, end: 0.95 },
      { id: 'cta', start: 0.95, end: 1.0 }
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
