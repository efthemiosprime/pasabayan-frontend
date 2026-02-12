/**
 * WireframeGlobe
 * Custom lat/long line geometry for authentic globe look
 */
import * as THREE from 'three';
import { GLOBE_CONFIG } from './GlobeConfig.js';

export class WireframeGlobe {
  constructor() {
    this.group = new THREE.Group();
    this.createLatitudeLines();
    this.createLongitudeLines();
  }

  createLatitudeLines() {
    const { radius, latLines, segments, globeColor, globeOpacity } = GLOBE_CONFIG;
    const material = new THREE.LineBasicMaterial({
      color: globeColor,
      transparent: true,
      opacity: globeOpacity,
    });

    // Create latitude circles from -75 to 75 degrees
    for (let i = 0; i <= latLines; i++) {
      const lat = -75 + (150 / latLines) * i;
      const phi = (90 - lat) * (Math.PI / 180);
      const circleRadius = radius * Math.sin(phi);
      const y = radius * Math.cos(phi);

      const points = [];
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
          circleRadius * Math.cos(theta),
          y,
          circleRadius * Math.sin(theta)
        ));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      this.group.add(line);
    }
  }

  createLongitudeLines() {
    const { radius, lonLines, segments, globeColor, globeOpacity } = GLOBE_CONFIG;
    const material = new THREE.LineBasicMaterial({
      color: globeColor,
      transparent: true,
      opacity: globeOpacity,
    });

    // Create longitude arcs
    for (let i = 0; i < lonLines; i++) {
      const lon = (360 / lonLines) * i;
      const theta = (lon + 180) * (Math.PI / 180);

      const points = [];
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * Math.PI;
        points.push(new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      this.group.add(line);
    }
  }

  getMesh() {
    return this.group;
  }

  dispose() {
    this.group.traverse((child) => {
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
  }
}
