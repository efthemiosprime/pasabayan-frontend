/**
 * WireframeGlobe
 * Custom lat/long line geometry for authentic globe look
 * Optimized: Uses merged geometry for fewer draw calls
 */
import * as THREE from 'three';
import { GLOBE_CONFIG } from './GlobeConfig.js';

export class WireframeGlobe {
  constructor() {
    this.group = new THREE.Group();
    this.material = null;
    this.createMergedGeometry();
  }

  createMergedGeometry() {
    const { radius, latLines, lonLines, segments, globeColor, globeOpacity } = GLOBE_CONFIG;

    // Shared material for all lines
    this.material = new THREE.LineBasicMaterial({
      color: globeColor,
      transparent: true,
      opacity: globeOpacity,
    });

    // Collect all points for latitude and longitude lines
    const allPoints = [];

    // Create latitude circles from -75 to 75 degrees
    for (let i = 0; i <= latLines; i++) {
      const lat = -75 + (150 / latLines) * i;
      const phi = (90 - lat) * (Math.PI / 180);
      const circleRadius = radius * Math.sin(phi);
      const y = radius * Math.cos(phi);

      for (let j = 0; j < segments; j++) {
        const theta1 = (j / segments) * Math.PI * 2;
        const theta2 = ((j + 1) / segments) * Math.PI * 2;

        allPoints.push(
          circleRadius * Math.cos(theta1), y, circleRadius * Math.sin(theta1),
          circleRadius * Math.cos(theta2), y, circleRadius * Math.sin(theta2)
        );
      }
    }

    // Create longitude arcs
    for (let i = 0; i < lonLines; i++) {
      const lon = (360 / lonLines) * i;
      const theta = (lon + 180) * (Math.PI / 180);

      for (let j = 0; j < segments; j++) {
        const phi1 = (j / segments) * Math.PI;
        const phi2 = ((j + 1) / segments) * Math.PI;

        allPoints.push(
          -radius * Math.sin(phi1) * Math.cos(theta),
          radius * Math.cos(phi1),
          radius * Math.sin(phi1) * Math.sin(theta),
          -radius * Math.sin(phi2) * Math.cos(theta),
          radius * Math.cos(phi2),
          radius * Math.sin(phi2) * Math.sin(theta)
        );
      }
    }

    // Create single merged BufferGeometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(allPoints, 3));

    // Use LineSegments for better performance with many line segments
    const lines = new THREE.LineSegments(geometry, this.material);
    lines.frustumCulled = false; // Globe is always visible when container is
    this.group.add(lines);
  }

  getMesh() {
    return this.group;
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
    });

    if (this.material) {
      this.material.dispose();
    }
  }
}
