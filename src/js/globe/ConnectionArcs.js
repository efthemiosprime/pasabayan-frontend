/**
 * ConnectionArcs
 * Curved dashed lines between package nodes representing delivery routes
 */
import * as THREE from 'three';
import { GLOBE_CONFIG, CONNECTIONS, NODE_POSITIONS, latLonToVector3 } from './GlobeConfig.js';

export class ConnectionArcs {
  constructor() {
    this.group = new THREE.Group();
    this.arcs = [];
    this.dashOffset = 0;
    this.createArcs();
  }

  createArcs() {
    const { arcColor, arcOpacity } = GLOBE_CONFIG;

    CONNECTIONS.forEach(([fromIdx, toIdx]) => {
      const fromNode = NODE_POSITIONS[fromIdx];
      const toNode = NODE_POSITIONS[toIdx];

      const start = latLonToVector3(fromNode.lat, fromNode.lon, GLOBE_CONFIG.radius);
      const end = latLonToVector3(toNode.lat, toNode.lon, GLOBE_CONFIG.radius);

      // Create arc using QuadraticBezierCurve3
      const arc = this.createArc(start, end);
      this.arcs.push(arc);
      this.group.add(arc);
    });
  }

  createArc(start, end) {
    // Calculate midpoint and raise it above the globe surface
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const midZ = (start.z + end.z) / 2;

    // Calculate distance between points to determine arc height
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) +
      Math.pow(end.y - start.y, 2) +
      Math.pow(end.z - start.z, 2)
    );

    // Normalize midpoint and push it outward
    const midLength = Math.sqrt(midX * midX + midY * midY + midZ * midZ);
    const arcHeight = 1 + (distance * 0.3); // Higher arcs for longer distances

    const controlPoint = new THREE.Vector3(
      (midX / midLength) * arcHeight,
      (midY / midLength) * arcHeight,
      (midZ / midLength) * arcHeight
    );

    // Create curve
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(start.x, start.y, start.z),
      controlPoint,
      new THREE.Vector3(end.x, end.y, end.z)
    );

    // Get points along curve
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create dashed line material
    const material = new THREE.LineDashedMaterial({
      color: GLOBE_CONFIG.arcColor,
      transparent: true,
      opacity: GLOBE_CONFIG.arcOpacity,
      dashSize: 0.05,
      gapSize: 0.03,
    });

    const line = new THREE.Line(geometry, material);
    line.computeLineDistances(); // Required for dashed lines

    return line;
  }

  // Animate dash offset for flowing effect
  update(deltaTime) {
    this.dashOffset += deltaTime * 0.5;

    this.arcs.forEach((arc) => {
      // Animate by adjusting the line distances
      const distances = arc.geometry.attributes.lineDistance;
      if (distances) {
        for (let i = 0; i < distances.count; i++) {
          distances.array[i] = distances.array[i] + 0.001;
        }
        distances.needsUpdate = true;
      }
    });
  }

  getMesh() {
    return this.group;
  }

  dispose() {
    this.arcs.forEach((arc) => {
      arc.geometry.dispose();
      arc.material.dispose();
    });
  }
}
