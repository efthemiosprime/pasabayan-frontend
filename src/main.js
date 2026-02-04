/**
 * Main Entry Point - Pasabayan 3D Experience
 */

import './styles/main.scss';
import { App } from './js/core/App.js';
import { Airplane } from './js/objects/Airplane.js';
import { Clouds } from './js/objects/Clouds.js';
import { Packages } from './js/objects/Packages.js';
import { Environment } from './js/objects/Environment.js';
import { Timeline3D } from './js/objects/Timeline3D.js';
import { PostProcessing } from './js/core/PostProcessing.js';
import { AudioManager } from './js/core/AudioManager.js';
import { ContentOverlay } from './js/ui/ContentOverlay.js';
import { ProgressBar } from './js/ui/ProgressBar.js';
import { Controls } from './js/ui/Controls.js';
import { device } from './js/utils/DeviceDetect.js';

class Experience {
  constructor() {
    this.app = null;
    this.init();
  }

  async init() {
    // Initialize core app
    this.app = new App();
    
    // Wait for app to be ready
    await this.waitForReady();
    
    // Initialize 3D objects
    await this.initObjects();
    
    // Initialize post-processing
    this.initPostProcessing();
    
    // Initialize audio
    this.initAudio();
    
    // Initialize UI
    this.initUI();
    
    // Start experience
    this.start();
  }

  waitForReady() {
    return new Promise((resolve) => {
      const check = () => {
        if (this.app.isReady) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }

  async initObjects() {
    const { scene, settings } = this.app;
    
    // Create environment (sky, particles, ground reference)
    const environment = new Environment(scene, settings);
    this.app.registerObject('environment', environment);
    
    // Create clouds
    const clouds = new Clouds(scene, settings);
    this.app.registerObject('clouds', clouds);
    
    // Create packages for sender section
    const packages = new Packages(scene, settings);
    this.app.registerObject('packages', packages);
    
    // Create 3D timeline
    const timeline3d = new Timeline3D(scene, settings);
    this.app.registerObject('timeline3d', timeline3d);
    
    // Create airplane
    const airplane = new Airplane(scene, settings);
    this.app.registerObject('airplane', airplane);
  }

  initPostProcessing() {
    if (device.tier === 'low') return;
    
    const postProcessing = new PostProcessing(
      this.app.renderer,
      this.app.scene,
      this.app.camera,
      this.app.settings
    );
    
    this.app.setComposer(postProcessing.composer);
  }

  initAudio() {
    this.audioManager = new AudioManager();
    
    // Connect to scroll manager
    this.app.scrollManager.onProgress((data) => {
      this.audioManager.updateWithProgress(data.progress, data.velocity);
    });
  }

  initUI() {
    // Content overlay (text sections)
    this.contentOverlay = new ContentOverlay(this.app.scrollManager);
    
    // Progress bar
    this.progressBar = new ProgressBar(this.app.scrollManager);
    
    // Controls (sound toggle, etc.)
    this.controls = new Controls(this.audioManager);
  }

  start() {
    // Hide loader with animation
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.classList.remove('active');
        loader.classList.remove('fade-out');
      }, 1000);
    }
    
    // Start scroll manager
    this.app.scrollManager.start();
    
    // Play intro animation
    this.playIntro();
  }

  playIntro() {
    // Intro title animation
    const titleLines = document.querySelectorAll('.title-main__line');
    titleLines.forEach((line, i) => {
      setTimeout(() => {
        line.classList.add('animate-in');
      }, 500 + i * 200);
    });
    
    // Subtitle fade in
    const subtitle = document.querySelector('.content-section--intro .subtitle');
    if (subtitle) {
      setTimeout(() => {
        subtitle.classList.add('animate-in');
      }, 1200);
    }
    
    // Scroll hint
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
      setTimeout(() => {
        scrollHint.classList.add('animate-in');
      }, 1800);
    }
  }
}

// Start the experience when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Experience();
});
