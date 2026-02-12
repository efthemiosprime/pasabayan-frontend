/**
 * GlobeScene
 * Main scene controller - camera, renderer, animation loop
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

    window.addEventListener('resize', this.handleResize.bind(this));
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
      antialias: true,
      alpha: true, // Transparent background
    });

    // Cap pixel ratio at 2 for performance
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
  }

  createScene() {
    this.scene = new THREE.Scene();

    // Add subtle ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Add directional light for subtle shading
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);
  }

  createCamera() {
    const { fov, near, far, position } = CAMERA_CONFIG;
    const aspect = this.container.clientWidth / this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(position.x, position.y, position.z);
    this.camera.lookAt(0, 0, 0);
  }

  createGlobe() {
    // Group to hold all globe elements for unified rotation
    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    // Create wireframe globe
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

    this.container.style.cursor = 'grab';
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
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  animate(currentTime) {
    if (!this.isRunning) return;

    this.animationId = requestAnimationFrame(this.animate.bind(this));

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp delta to avoid large jumps
    const clampedDelta = Math.min(deltaTime, 0.1);

    // Update controls (handles auto-rotation)
    this.dragControls.update(clampedDelta);

    // Update connection arcs animation
    this.connectionArcs.update(clampedDelta);

    // Update globe group matrix for node projection
    this.globeGroup.updateMatrixWorld();

    // Update package nodes positions
    const containerRect = this.container.getBoundingClientRect();
    this.packageNodes.update(this.globeGroup, containerRect);

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
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
    }

    window.removeEventListener('resize', this.handleResize.bind(this));

    this.wireframeGlobe?.dispose();
    this.connectionArcs?.dispose();
    this.packageNodes?.dispose();
    this.dragControls?.dispose();

    this.renderer?.dispose();

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
