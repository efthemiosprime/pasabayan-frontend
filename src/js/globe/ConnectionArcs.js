/**
 * ConnectionArcs
 * Curved dashed lines between package nodes representing delivery routes
 * Optimized: Merged geometry, reduced points on mobile
 */
import * as THREE from 'three';
import { GLOBE_CONFIG, CONNECTIONS, NODE_POSITIONS, latLonToVector3 } from './GlobeConfig.js';

export class ConnectionArcs {
  constructor() {
    this.group = new THREE.Group();
    this.material = null;
    this.isMobile = window.innerWidth < 768;
    this.createArcs();
  }

  createArcs() {
    const { arcColor, arcOpacity } = GLOBE_CONFIG;

    // Shared material for all arcs
    this.material = new THREE.LineDashedMaterial({
      color: arcColor,
      transparent: true,
      opacity: arcOpacity,
      dashSize: 0.05,
      gapSize: 0.03,
    });

    // Fewer points per curve on mobile
    const curvePoints = this.isMobile ? 25 : 50;

    // Collect all arc points for merged geometry
    const allPoints = [];
    const allDistances = [];
    let currentDistance = 0;

    CONNECTIONS.forEach(([fromIdx, toIdx]) => {
      const fromNode = NODE_POSITIONS[fromIdx];
      const toNode = NODE_POSITIONS[toIdx];

      if (!fromNode || !toNode) return;

      const start = latLonToVector3(fromNode.lat, fromNode.lon, GLOBE_CONFIG.radius);
      const end = latLonToVector3(toNode.lat, toNode.lon, GLOBE_CONFIG.radius);

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
      const arcHeight = 1 + (distance * 0.3);

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

      // Get points along curve and add to merged geometry
      const points = curve.getPoints(curvePoints);

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        allPoints.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);

        // Calculate line distances for dashing
        const segmentLength = p1.distanceTo(p2);
        allDistances.push(currentDistance, currentDistance + segmentLength);
        currentDistance += segmentLength;
      }

      // Reset distance for each arc to have independent dash patterns
      currentDistance = 0;
    });

    // Create merged geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(allPoints, 3));

    // Create line segments
    const lines = new THREE.LineSegments(geometry, this.material);
    lines.computeLineDistances(); // Required for dashed lines
    lines.frustumCulled = false;

    this.group.add(lines);
  }

  // No animation needed - static dashed lines are performant
  update(deltaTime) {
    // Intentionally empty - dash pattern is static for better performance
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
