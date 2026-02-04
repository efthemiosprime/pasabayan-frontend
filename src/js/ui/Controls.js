/**
 * Controls - UI control buttons (sound toggle, etc.)
 */

export class Controls {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.soundToggle = document.getElementById('sound-toggle');
    
    this.init();
  }

  init() {
    this.setupSoundToggle();
    this.setupKeyboardShortcuts();
    
    // Show controls after intro
    setTimeout(() => {
      document.getElementById('ui-controls')?.classList.add('visible');
    }, 2000);
  }

  setupSoundToggle() {
    if (!this.soundToggle) return;
    
    // Set initial state
    this.updateSoundButton(this.audioManager.isEnabled);
    
    // Click handler
    this.soundToggle.addEventListener('click', () => {
      const isEnabled = this.audioManager.toggle();
      this.updateSoundButton(isEnabled);
    });
  }

  updateSoundButton(isEnabled) {
    if (!this.soundToggle) return;
    
    this.soundToggle.classList.toggle('active', isEnabled);
    this.soundToggle.setAttribute('aria-pressed', isEnabled);
    
    const label = isEnabled ? 'Mute sound' : 'Enable sound';
    this.soundToggle.setAttribute('aria-label', label);
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // M key to toggle mute
      if (e.key === 'm' || e.key === 'M') {
        const isEnabled = this.audioManager.toggle();
        this.updateSoundButton(isEnabled);
      }
      
      // Escape to show/hide UI
      if (e.key === 'Escape') {
        this.toggleUI();
      }
    });
  }

  toggleUI() {
    const controls = document.getElementById('ui-controls');
    const progressBar = document.getElementById('progress-bar');
    
    [controls, progressBar].forEach(el => {
      if (el) {
        el.classList.toggle('hidden-ui');
      }
    });
  }

  destroy() {
    // Clean up event listeners if needed
  }
}
