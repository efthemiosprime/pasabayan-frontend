/**
 * DragControls
 * Mouse/touch drag rotation with auto-rotate resume
 */
import { ANIMATION_CONFIG } from './GlobeConfig.js';

export class DragControls {
  constructor(element, onRotate) {
    this.element = element;
    this.onRotate = onRotate;

    this.isDragging = false;
    this.previousPosition = { x: 0, y: 0 };
    this.rotation = { x: 0.1, y: 0 }; // Slight initial tilt

    this.autoRotate = true;
    this.autoResumeTimeout = null;

    this.init();
  }

  init() {
    // Mouse events
    this.element.addEventListener('mousedown', this.onDragStart.bind(this));
    window.addEventListener('mousemove', this.onDragMove.bind(this));
    window.addEventListener('mouseup', this.onDragEnd.bind(this));

    // Touch events
    this.element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    window.addEventListener('touchend', this.onDragEnd.bind(this));

    // Prevent context menu on long press
    this.element.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  onDragStart(e) {
    this.isDragging = true;
    this.autoRotate = false;
    this.previousPosition = { x: e.clientX, y: e.clientY };
    this.element.style.cursor = 'grabbing';

    // Clear any pending auto-resume
    if (this.autoResumeTimeout) {
      clearTimeout(this.autoResumeTimeout);
    }
  }

  onTouchStart(e) {
    if (e.touches.length === 1) {
      e.preventDefault();
      this.isDragging = true;
      this.autoRotate = false;
      this.previousPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      if (this.autoResumeTimeout) {
        clearTimeout(this.autoResumeTimeout);
      }
    }
  }

  onDragMove(e) {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.previousPosition.x;
    const deltaY = e.clientY - this.previousPosition.y;

    this.rotation.y += deltaX * ANIMATION_CONFIG.dragSensitivity;
    this.rotation.x += deltaY * ANIMATION_CONFIG.dragSensitivity;

    // Clamp vertical rotation to prevent flipping
    this.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.rotation.x));

    this.previousPosition = { x: e.clientX, y: e.clientY };

    if (this.onRotate) {
      this.onRotate(this.rotation);
    }
  }

  onTouchMove(e) {
    if (!this.isDragging || e.touches.length !== 1) return;
    e.preventDefault();

    const deltaX = e.touches[0].clientX - this.previousPosition.x;
    const deltaY = e.touches[0].clientY - this.previousPosition.y;

    this.rotation.y += deltaX * ANIMATION_CONFIG.dragSensitivity;
    this.rotation.x += deltaY * ANIMATION_CONFIG.dragSensitivity;

    // Clamp vertical rotation
    this.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.rotation.x));

    this.previousPosition = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    if (this.onRotate) {
      this.onRotate(this.rotation);
    }
  }

  onDragEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.element.style.cursor = 'grab';

    // Resume auto-rotate after delay
    this.autoResumeTimeout = setTimeout(() => {
      this.autoRotate = true;
    }, ANIMATION_CONFIG.autoResumeDelay);
  }

  // Called each frame to apply auto-rotation
  update(deltaTime) {
    if (this.autoRotate && !this.isDragging) {
      this.rotation.y += ANIMATION_CONFIG.autoRotateSpeed * deltaTime;

      if (this.onRotate) {
        this.onRotate(this.rotation);
      }
    }
  }

  getRotation() {
    return this.rotation;
  }

  dispose() {
    if (this.autoResumeTimeout) {
      clearTimeout(this.autoResumeTimeout);
    }
  }
}
