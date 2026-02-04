/**
 * ProgressBar - Visual scroll progress indicator
 */

export class ProgressBar {
  constructor(scrollManager) {
    this.scrollManager = scrollManager;
    this.container = document.getElementById('progress-bar');
    this.fill = this.container?.querySelector('.progress-bar__fill');
    this.sections = [];
    
    this.init();
  }

  init() {
    if (!this.container || !this.fill) return;
    
    // Get section markers
    const sectionElements = this.container.querySelectorAll('.progress-bar__section');
    sectionElements.forEach(el => {
      this.sections.push({
        element: el,
        id: el.dataset.section
      });
    });
    
    // Subscribe to scroll
    this.scrollManager.onProgress((data) => {
      this.update(data.progress, data.section);
    });
    
    // Add click handlers for navigation
    this.addClickHandlers();
  }

  update(progress, currentSection) {
    // Update fill bar
    if (this.fill) {
      this.fill.style.height = `${progress * 100}%`;
    }
    
    // Update section indicators
    this.sections.forEach(section => {
      const isPast = this.isSectionPast(section.id, progress);
      const isCurrent = currentSection?.id === section.id;
      
      section.element.classList.toggle('past', isPast);
      section.element.classList.toggle('current', isCurrent);
    });
  }

  isSectionPast(sectionId, progress) {
    const sectionEnds = {
      'intro': 0.12,
      'sender': 0.42,
      'carrier': 0.72,
      'features': 0.87,
      'team': 1.0
    };
    
    return progress > (sectionEnds[sectionId] || 0);
  }

  addClickHandlers() {
    this.sections.forEach(section => {
      section.element.addEventListener('click', () => {
        this.navigateToSection(section.id);
      });
    });
  }

  navigateToSection(sectionId) {
    // Map progress bar sections to scroll sections
    const sectionMap = {
      'intro': 'intro',
      'sender': 'send-anything',
      'carrier': 'earn-traveling',
      'features': 'features',
      'team': 'team'
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
