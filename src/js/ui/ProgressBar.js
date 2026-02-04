/**
 * ProgressBar - Timeline navigation with section progress
 */

export class ProgressBar {
  constructor(scrollManager) {
    this.scrollManager = scrollManager;
    this.container = document.getElementById('timeline-nav');
    this.progressFill = this.container?.querySelector('.timeline-nav__progress');
    this.sections = [];
    
    // Section progress ranges (matches ScrollManager)
    this.sectionRanges = {
      'intro': { start: 0, end: 0.03 },
      'sender': { start: 0.03, end: 0.38 },
      'carrier': { start: 0.40, end: 0.80 },
      'features': { start: 0.88, end: 0.92 },
      'team': { start: 0.94, end: 0.97 },
      'cta': { start: 0.99, end: 1.01 }  // Stays active at the end
    };
    
    this.init();
  }

  init() {
    if (!this.container) return;
    
    // Get section elements
    const sectionElements = this.container.querySelectorAll('.timeline-nav__section');
    sectionElements.forEach(el => {
      this.sections.push({
        element: el,
        id: el.dataset.section,
        dot: el.querySelector('.timeline-nav__dot'),
        label: el.querySelector('.timeline-nav__label')
      });
    });
    
    // Subscribe to scroll
    this.scrollManager.onProgress((data) => {
      this.update(data.progress, data.section);
    });
    
    // Add click handlers for navigation
    this.addClickHandlers();
    
    // Show after short delay
    setTimeout(() => this.show(), 1500);
  }

  update(progress, currentSection) {
    // Update progress fill (the vertical line)
    if (this.progressFill) {
      this.progressFill.style.height = `${progress * 100}%`;
    }
    
    // Update section states
    this.sections.forEach(section => {
      const range = this.sectionRanges[section.id];
      if (!range) return;
      
      const isCompleted = progress > range.end;
      const isActive = progress >= range.start && progress <= range.end;
      
      section.element.classList.toggle('completed', isCompleted);
      section.element.classList.toggle('active', isActive);
    });
  }

  addClickHandlers() {
    this.sections.forEach(section => {
      section.element.addEventListener('click', () => {
        this.navigateToSection(section.id);
      });
    });
  }

  navigateToSection(sectionId) {
    // Map nav sections to scroll manager sections
    const sectionMap = {
      'intro': 'intro',
      'sender': 'send-anything',
      'carrier': 'earn-traveling',
      'features': 'features',
      'team': 'team',
      'cta': 'cta'
    };
    
    const targetSection = sectionMap[sectionId];
    if (targetSection) {
      this.scrollManager.scrollTo(targetSection, { duration: 1.5 });
    }
  }

  show() {
    this.container?.classList.add('visible');
  }

  hide() {
    this.container?.classList.remove('visible');
  }
}
