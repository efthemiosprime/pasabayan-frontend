/**
 * App.js - Main Application Controller
 * Orchestrates the entire 3D experience
 */

import * as THREE from 'three';
import { ScrollManager } from './ScrollManager.js';
import { CameraPath } from './CameraPath.js';
import { device } from '../utils/DeviceDetect.js';

export class App {
  constructor() {
    this.container = document.getElementById('webgl-canvas');
    this.isReady = false;
    this.clock = new THREE.Clock();
    this.settings = device.getSettings();
    
    // Scroll state
    this.scrollProgress = 0;
    this.scrollVelocity = 0;
    
    // Store references for external access
    this.objects = {
      airplane: null,
      clouds: null,
      packages: null,
      environment: null,
      timeline3d: null
    };
    
    this.init();
  }

  async init() {
    // Show loading state
    this.showLoading();
    
    // Initialize Three.js
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLights();
    
    // Initialize scroll manager
    this.scrollManager = new ScrollManager({
      journeyLength: 10000
    });
    
    // Initialize camera path
    this.cameraPath = new CameraPath(this.camera);
    
    // Subscribe to scroll updates
    this.scrollManager.onProgress((data) => {
      this.onScroll(data);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => this.onResize());
    
    // Start render loop
    this.animate();
    
    this.isReady = true;
    
    // Hide loading when everything is initialized
    // (Will be called again after objects are loaded)
    this.hideLoading();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: this.settings.antialias,
      alpha: false,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(device.pixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    // Enable shadows on higher tiers
    if (device.tier !== 'low') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }

  initScene() {
    this.scene = new THREE.Scene();
    
    // Beautiful sky gradient like the reference - deep blue to soft peachy pink
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
    
    // Reference-inspired gradient: deep blue -> soft blue -> lavender -> peachy pink
    gradient.addColorStop(0, '#2563eb');      // Deep blue at top
    gradient.addColorStop(0.25, '#3b82f6');   // Medium blue
    gradient.addColorStop(0.45, '#7c9ed9');   // Soft blue-gray
    gradient.addColorStop(0.65, '#b8a5c7');   // Lavender transition
    gradient.addColorStop(0.85, '#e8c4b8');   // Peachy pink
    gradient.addColorStop(1, '#f5d5c8');      // Soft peach at bottom
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 1024);
    
    const texture = new THREE.CanvasTexture(canvas);
    this.scene.background = texture;
    
    // Very light fog for depth - reduced for sharper visuals
    this.scene.fog = new THREE.FogExp2(0xd4b8c4, 0.001);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 30, 50);
    this.camera.lookAt(0, 0, 0);
  }

  initLights() {
    // Soft ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Main sunlight - warm and soft like late afternoon
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 1.0);
    this.sunLight.position.set(30, 80, 40);
    this.sunLight.castShadow = device.tier !== 'low';
    
    if (this.sunLight.castShadow) {
      this.sunLight.shadow.mapSize.width = this.settings.shadowMapSize;
      this.sunLight.shadow.mapSize.height = this.settings.shadowMapSize;
      this.sunLight.shadow.camera.near = 0.5;
      this.sunLight.shadow.camera.far = 500;
      this.sunLight.shadow.camera.left = -100;
      this.sunLight.shadow.camera.right = 100;
      this.sunLight.shadow.camera.top = 100;
      this.sunLight.shadow.camera.bottom = -100;
      this.sunLight.shadow.bias = -0.0001;
    }
    this.scene.add(this.sunLight);
    
    // Soft blue fill light from above
    const fillLight = new THREE.DirectionalLight(0x9ec5ff, 0.4);
    fillLight.position.set(-20, 60, -20);
    this.scene.add(fillLight);
    
    // Hemisphere light - blue sky above, warm ground below
    const hemiLight = new THREE.HemisphereLight(0x7eb4f0, 0xf5d5c8, 0.5);
    this.scene.add(hemiLight);
  }

  onScroll(data) {
    const { progress, velocity, section } = data;
    
    // Store scroll data for use in animate loop
    this.scrollProgress = progress;
    this.scrollVelocity = velocity;
    
    // Very light fog - keep consistent for sharp visuals
    this.scene.fog.density = 0.001;
    
    // Update sun position for time-of-day effect
    const sunAngle = progress * Math.PI * 0.5;
    this.sunLight.position.x = Math.cos(sunAngle) * 100;
    this.sunLight.position.y = 50 + Math.sin(sunAngle) * 50;
  }

  updateObjects(delta, elapsed) {
    const progress = this.scrollProgress || 0;
    const velocity = this.scrollVelocity || 0;
    
    // Update camera path
    this.cameraPath.update(progress, delta);
    
    // Update all 3D objects
    if (this.objects.airplane) {
      this.objects.airplane.update(progress, velocity, delta);
    }
    if (this.objects.clouds) {
      this.objects.clouds.update(progress, elapsed);
    }
    if (this.objects.packages) {
      this.objects.packages.update(progress);
    }
    if (this.objects.timeline3d) {
      this.objects.timeline3d.update(progress, this.camera);
    }
    if (this.objects.environment) {
      this.objects.environment.update(progress, elapsed);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();
    const elapsed = this.clock.elapsedTime;
    
    // Update all 3D objects
    this.updateObjects(delta, elapsed);
    
    // Render scene
    if (this.composer) {
      this.composer.render(delta);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  showLoading() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('active');
    }
  }

  hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.remove('active');
    }
  }

  // Register 3D objects
  registerObject(name, object) {
    this.objects[name] = object;
    if (object.mesh || object.group) {
      this.scene.add(object.mesh || object.group);
    }
    
    // If this is the airplane, connect it to the camera path for chase camera
    if (name === 'airplane') {
      this.cameraPath.setAirplane(object);
    }
  }

  // Set post-processing composer
  setComposer(composer) {
    this.composer = composer;
  }

  destroy() {
    this.scrollManager.destroy();
    this.renderer.dispose();
    
    // Clean up objects
    Object.values(this.objects).forEach(obj => {
      if (obj && obj.destroy) obj.destroy();
    });
  }
}
