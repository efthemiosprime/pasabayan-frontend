/**
 * Loader - Asset loading with progress tracking
 */

import * as THREE from 'three';

export class Loader {
  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.callbacks = [];
    this.progress = 0;
    this.isComplete = false;
    
    this.setupLoadingManager();
  }

  setupLoadingManager() {
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(`Started loading: ${url}`);
    };
    
    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.progress = itemsLoaded / itemsTotal;
      this.updateProgress(this.progress);
    };
    
    this.loadingManager.onLoad = () => {
      this.isComplete = true;
      this.updateProgress(1);
      this.callbacks.forEach(cb => cb(1, true));
    };
    
    this.loadingManager.onError = (url) => {
      console.error(`Error loading: ${url}`);
    };
  }

  updateProgress(progress) {
    // Update loading bar
    const progressBar = document.querySelector('.loader__progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }
    
    this.callbacks.forEach(cb => cb(progress, this.isComplete));
  }

  onProgress(callback) {
    this.callbacks.push(callback);
    
    // If already complete, call immediately
    if (this.isComplete) {
      callback(1, true);
    }
  }

  loadTexture(url) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });
  }

  // Simulate loading for procedural assets
  simulateLoading(duration = 2000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const update = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        this.progress = progress;
        this.updateProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          this.isComplete = true;
          resolve();
        }
      };
      
      update();
    });
  }
}

export const loader = new Loader();
