/**
 * PackageNodes
 * HTML overlay nodes with 3D-to-screen projection
 */
import * as THREE from 'three';
import { NODE_POSITIONS, latLonToVector3, GLOBE_CONFIG } from './GlobeConfig.js';

export class PackageNodes {
  constructor(container, camera) {
    this.container = container;
    this.camera = camera;
    this.nodesContainer = null;
    this.nodes = [];
    this.positions3D = [];

    this.init();
  }

  init() {
    // Create container for HTML nodes
    this.nodesContainer = document.createElement('div');
    this.nodesContainer.id = 'globe-nodes';
    this.nodesContainer.className = 'globe-nodes';
    this.container.appendChild(this.nodesContainer);

    // Calculate 3D positions and create nodes
    NODE_POSITIONS.forEach((nodeData, index) => {
      const pos3D = latLonToVector3(nodeData.lat, nodeData.lon, GLOBE_CONFIG.radius + nodeData.depth);
      // Create THREE.Vector3 for proper projection
      const vector = new THREE.Vector3(pos3D.x, pos3D.y, pos3D.z);
      this.positions3D.push({ vector, ...nodeData });

      const node = this.createNode(nodeData, index);
      this.nodes.push(node);
      this.nodesContainer.appendChild(node);
    });
  }

  createNode(nodeData, index) {
    const node = document.createElement('div');
    node.className = `globe-node${nodeData.isCenter ? ' globe-node--center' : ''}`;
    node.dataset.index = index;

    // Package icon
    node.innerHTML = `
      <div class="globe-node__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      ${nodeData.isCenter ? '<div class="globe-node__glow"></div>' : ''}
      <div class="globe-node__pulse"></div>
    `;

    return node;
  }

  // Project 3D positions to 2D screen coordinates using globe group's world matrix
  update(globeGroup, containerRect) {
    const width = containerRect.width;
    const height = containerRect.height;

    this.positions3D.forEach((pos, index) => {
      const node = this.nodes[index];

      // Clone the original position vector
      const worldPos = pos.vector.clone();

      // Apply the globe group's rotation
      worldPos.applyMatrix4(globeGroup.matrixWorld);

      // Project to normalized device coordinates (-1 to 1)
      const projected = worldPos.clone().project(this.camera);

      // Convert to screen coordinates
      const screenX = (projected.x * 0.5 + 0.5) * width;
      const screenY = (-projected.y * 0.5 + 0.5) * height;

      // Check if node is behind the globe (z > 0 in world space after rotation means facing camera)
      const isBehind = worldPos.z < 0;

      // Calculate depth-based opacity and scale (worldPos.z ranges roughly from -1.2 to 1.2)
      const normalizedZ = (worldPos.z + 1.5) / 3; // Normalize to 0-1 range
      const nodeScale = 0.6 + normalizedZ * 0.5;
      const nodeOpacity = isBehind ? 0 : (0.5 + normalizedZ * 0.5);

      // Update node position and visibility
      node.style.transform = `translate(-50%, -50%) translate(${screenX}px, ${screenY}px) scale(${nodeScale})`;
      node.style.opacity = nodeOpacity;
      node.style.pointerEvents = isBehind ? 'none' : 'auto';
      node.style.zIndex = Math.round(normalizedZ * 10) + 5;
    });
  }

  getPositions3D() {
    return this.positions3D;
  }

  dispose() {
    if (this.nodesContainer && this.nodesContainer.parentNode) {
      this.nodesContainer.parentNode.removeChild(this.nodesContainer);
    }
  }
}
