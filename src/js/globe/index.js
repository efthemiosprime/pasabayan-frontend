/**
 * Globe Module - Public API
 * 3D wireframe globe visualization for the hero section
 */
import { GlobeScene } from './GlobeScene.js';

let globeInstance = null;

/**
 * Initialize the globe visualization
 * @param {string} containerId - ID of the container element
 * @returns {GlobeScene|null} - The globe instance or null if container not found
 */
export function initGlobe(containerId = 'globe-container') {
  const container = document.getElementById(containerId);

  if (!container) {
    console.warn(`Globe container #${containerId} not found`);
    return null;
  }

  // Clean up existing instance if any
  if (globeInstance) {
    globeInstance.dispose();
  }

  // Create new globe instance
  globeInstance = new GlobeScene(container);

  return globeInstance;
}

/**
 * Destroy the globe instance and clean up resources
 */
export function destroyGlobe() {
  if (globeInstance) {
    globeInstance.dispose();
    globeInstance = null;
  }
}

/**
 * Get the current globe instance
 * @returns {GlobeScene|null}
 */
export function getGlobeInstance() {
  return globeInstance;
}

// Export classes for advanced usage
export { GlobeScene } from './GlobeScene.js';
export { WireframeGlobe } from './WireframeGlobe.js';
export { ConnectionArcs } from './ConnectionArcs.js';
export { PackageNodes } from './PackageNodes.js';
export { DragControls } from './DragControls.js';
export * from './GlobeConfig.js';
