/**
 * AudioManager - Ambient sounds and audio control
 * Uses Howler.js for cross-browser audio support
 */

import { Howl, Howler } from 'howler';

export class AudioManager {
  constructor() {
    this.isEnabled = false;
    this.isInitialized = false;
    this.sounds = {};
    this.masterVolume = 0.5;
    this.currentProgress = 0;
    
    // Check localStorage for user preference
    const savedPreference = localStorage.getItem('pasabayan-audio');
    if (savedPreference === 'enabled') {
      this.isEnabled = true;
    }
    
    // Audio will be loaded on first user interaction
    this.init();
  }

  init() {
    // Set global volume
    Howler.volume(this.masterVolume);
    
    // Create ambient sounds with fallback
    // Since we don't have actual audio files, we'll create synthesized sounds
    this.createSynthesizedSounds();
    
    this.isInitialized = true;
  }

  createSynthesizedSounds() {
    // We'll create audio using Web Audio API since we don't have external files
    // This creates a wind-like ambient sound
    
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create nodes for ambient wind sound
    this.createWindSound();
    
    // Create airplane engine sound
    this.createEngineSound();
  }

  createWindSound() {
    // White noise filtered to sound like wind
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    this.windSource = this.audioContext.createBufferSource();
    this.windSource.buffer = noiseBuffer;
    this.windSource.loop = true;
    
    // Low-pass filter for wind effect
    this.windFilter = this.audioContext.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.value = 400;
    this.windFilter.Q.value = 1;
    
    // Gain control
    this.windGain = this.audioContext.createGain();
    this.windGain.gain.value = 0;
    
    // Connect
    this.windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.audioContext.destination);
  }

  createEngineSound() {
    // Low frequency oscillator for engine drone
    this.engineOsc = this.audioContext.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 80;
    
    // Second oscillator for depth
    this.engineOsc2 = this.audioContext.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.value = 120;
    
    // Filter
    this.engineFilter = this.audioContext.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 300;
    
    // Gain
    this.engineGain = this.audioContext.createGain();
    this.engineGain.gain.value = 0;
    
    // Connect
    this.engineOsc.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.audioContext.destination);
  }

  start() {
    if (!this.isEnabled || this.isPlaying) return;
    
    // Resume audio context (required after user interaction)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Start wind
    try {
      this.windSource.start(0);
    } catch (e) {
      // Already started, recreate
      this.createWindSound();
      this.windSource.start(0);
    }
    
    // Start engine
    try {
      this.engineOsc.start(0);
      this.engineOsc2.start(0);
    } catch (e) {
      // Already started, recreate
      this.createEngineSound();
      this.engineOsc.start(0);
      this.engineOsc2.start(0);
    }
    
    this.isPlaying = true;
    
    // Fade in wind
    this.windGain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 2);
  }

  stop() {
    if (!this.isPlaying) return;
    
    // Fade out
    this.windGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
    this.engineGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
    
    this.isPlaying = false;
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    localStorage.setItem('pasabayan-audio', this.isEnabled ? 'enabled' : 'disabled');
    
    if (this.isEnabled) {
      this.start();
    } else {
      this.stop();
    }
    
    return this.isEnabled;
  }

  updateWithProgress(progress, velocity) {
    if (!this.isEnabled || !this.isPlaying) return;
    
    this.currentProgress = progress;
    
    // Adjust wind based on altitude/speed
    const windVolume = 0.1 + Math.abs(velocity) * 0.3;
    const windFrequency = 300 + Math.abs(velocity) * 500;
    
    if (this.windGain) {
      this.windGain.gain.linearRampToValueAtTime(
        Math.min(0.25, windVolume),
        this.audioContext.currentTime + 0.1
      );
    }
    
    if (this.windFilter) {
      this.windFilter.frequency.linearRampToValueAtTime(
        windFrequency,
        this.audioContext.currentTime + 0.1
      );
    }
    
    // Engine sound - louder when airplane is visible (40%+)
    if (progress > 0.35 && progress < 0.95) {
      const engineVolume = 0.08 * (1 - Math.abs(progress - 0.6) * 1.5);
      if (this.engineGain) {
        this.engineGain.gain.linearRampToValueAtTime(
          Math.max(0, engineVolume),
          this.audioContext.currentTime + 0.2
        );
      }
      
      // Pitch changes with progress
      const basePitch = 80 + (progress - 0.35) * 40;
      if (this.engineOsc) {
        this.engineOsc.frequency.linearRampToValueAtTime(
          basePitch,
          this.audioContext.currentTime + 0.1
        );
        this.engineOsc2.frequency.linearRampToValueAtTime(
          basePitch * 1.5,
          this.audioContext.currentTime + 0.1
        );
      }
    } else {
      if (this.engineGain) {
        this.engineGain.gain.linearRampToValueAtTime(
          0,
          this.audioContext.currentTime + 0.5
        );
      }
    }
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.masterVolume);
  }

  // Play a one-shot sound effect
  playEffect(name) {
    if (!this.isEnabled || !this.sounds[name]) return;
    this.sounds[name].play();
  }

  destroy() {
    this.stop();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    Object.values(this.sounds).forEach(sound => {
      sound.unload();
    });
  }
}
