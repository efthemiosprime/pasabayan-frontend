/**
 * GlobeScene
 * Main scene controller - camera, renderer, animation loop
 * Optimized for performance
 */
import * as THREE from 'three';
import { CAMERA_CONFIG } from './GlobeConfig.js';
import { WireframeGlobe } from './WireframeGlobe.js';
import { ConnectionArcs } from './ConnectionArcs.js';
import { PackageNodes } from './PackageNodes.js';
import { DragControls } from './DragControls.js';

export class GlobeScene {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.globeGroup = null;

    this.wireframeGlobe = null;
    this.connectionArcs = null;
    this.packageNodes = null;
    this.dragControls = null;

    this.isRunning = false;
    this.lastTime = 0;
    this.animationId = null;
    this.observer = null;

    // Performance optimizations
    this.isMobile = window.innerWidth < 768;
    this.targetFPS = this.isMobile ? 30 : 60;
    this.frameInterval = 1000 / this.targetFPS;
    this.lastFrameTime = 0;

    // Cache container rect to avoid layout thrashing
    this.containerRect = null;
    this.resizeTimeout = null;

    // Bound methods for proper cleanup
    this.boundHandleResize = this.handleResize.bind(this);
    this.boundAnimate = this.animate.bind(this);

    this.init();
  }

  init() {
    this.createCanvas();
    this.createRenderer();
    this.createScene();
    this.createCamera();
    this.createGlobe();
    this.createControls();
    this.setupVisibilityObserver();
    this.handleResize();

    window.addEventListener('resize', this.boundHandleResize, { passive: true });
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'globe-canvas';
    this.canvas.className = 'globe-canvas';
    this.container.appendChild(this.canvas);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile, // Disable antialiasing on mobile for performance
      alpha: true,
      powerPreference: 'high-performance',
    });

    // Lower pixel ratio on mobile for performance
    const maxPixelRatio = this.isMobile ? 1.5 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    this.renderer.setClearColor(0x000000, 0);

    // Additional optimizations
    this.renderer.sortObjects = false; // Disable sorting since we control render order
  }

  createScene() {
    this.scene = new THREE.Scene();

    // Single ambient light is sufficient for wireframe
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);
  }

  createCamera() {
    const { fov, near, far, position } = CAMERA_CONFIG;
    const aspect = this.container.clientWidth / this.container.clientHeight || 1;

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(position.x, position.y, position.z);
    this.camera.lookAt(0, 0, 0);
  }

  createGlobe() {
    // Group to hold all globe elements for unified rotation
    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    // Create wireframe globe (already optimized for mobile in WireframeGlobe)
    this.wireframeGlobe = new WireframeGlobe();
    this.globeGroup.add(this.wireframeGlobe.getMesh());

    // Create connection arcs
    this.connectionArcs = new ConnectionArcs();
    this.globeGroup.add(this.connectionArcs.getMesh());

    // Create package nodes (HTML overlay)
    this.packageNodes = new PackageNodes(this.container, this.camera);
  }

  createControls() {
    this.dragControls = new DragControls(this.container, (rotation) => {
      this.globeGroup.rotation.x = rotation.x;
      this.globeGroup.rotation.y = rotation.y;
    });

    // Only show grab cursor on desktop (where drag is enabled)
    if (!this.dragControls.isMobile) {
      this.container.style.cursor = 'grab';
    }
  }

  setupVisibilityObserver() {
    // Pause animation when globe is not visible
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.start();
          } else {
            this.stop();
          }
        });
      },
      { threshold: 0.1 }
    );

    this.observer.observe(this.container);
  }

  handleResize() {
    // Debounce resize for performance
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      if (width === 0 || height === 0) return;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);

      // Update cached container rect
      this.containerRect = this.container.getBoundingClientRect();
    }, 100);
  }

  animate(currentTime) {
    if (!this.isRunning) return;

    this.animationId = requestAnimationFrame(this.boundAnimate);

    // Frame rate limiting for mobile
    const elapsed = currentTime - this.lastFrameTime;
    if (elapsed < this.frameInterval) return;

    this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp delta to avoid large jumps
    const clampedDelta = Math.min(deltaTime, 0.1);

    // Update controls (handles auto-rotation)
    this.dragControls.update(clampedDelta);

    // Update globe group matrix for node projection
    this.globeGroup.updateMatrixWorld();

    // Update package nodes positions (use cached rect)
    if (!this.containerRect) {
      this.containerRect = this.container.getBoundingClientRect();
    }
    this.packageNodes.update(this.globeGroup, this.containerRect);

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastFrameTime = this.lastTime;
    this.containerRect = this.container.getBoundingClientRect();
    this.animate(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  dispose() {
    this.stop();

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    window.removeEventListener('resize', this.boundHandleResize);

    // Dispose Three.js objects
    this.wireframeGlobe?.dispose();
    this.connectionArcs?.dispose();
    this.packageNodes?.dispose();
    this.dragControls?.dispose();

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer = null;
    }

    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }

    // Clear references
    this.scene = null;
    this.camera = null;
    this.globeGroup = null;
  }
}
