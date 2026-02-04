/**
 * Clouds - Loads GLB cloud model and scatters instances through 3D space
 * Creates an immersive flying-through-clouds experience
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Clouds {
  constructor(scene, settings) {
    this.scene = scene;
    this.settings = settings;
    this.cloudCount = settings.cloudCount || 80;
    this.group = new THREE.Group();
    this.clouds = [];
    this.cloudGeometry = null;
    this.cloudMaterial = null;
    this.time = 0;
    this.isLoaded = false;
    
    this.loadModel();
    scene.add(this.group);
  }

  async loadModel() {
    const loader = new GLTFLoader();
    
    try {
      const gltf = await loader.loadAsync('/low_poly_cloud.glb');
      
      // Extract geometry and material from the loaded model
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          this.cloudGeometry = child.geometry.clone();
          // Create our own material for better control
          this.cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
            roughness: 1,
            metalness: 0,
            side: THREE.DoubleSide
          });
        }
      });
      
      if (this.cloudGeometry) {
        this.createCloudField();
        this.isLoaded = true;
        console.log('Cloud model loaded successfully');
      } else {
        throw new Error('No geometry found in cloud model');
      }
    } catch (error) {
      console.error('Error loading cloud model:', error);
      this.createFallbackClouds();
    }
  }

  createCloudField() {
    // Create clouds along the flight path so airplane flies THROUGH them
    // Airplane flies from z=20 to z=-180, so scatter clouds along that path
    
    // Clouds near the start (z: 30 to -20)
    this.createCloudLayer({
      count: 20,
      xRange: [-50, 50],
      yRange: [10, 40],
      zRange: [-20, 40],
      scaleRange: [8, 18],
      speedRange: [0.005, 0.01],
      opacity: 0.85,
      color: 0xe8eef8
    });
    
    // Clouds in the middle section (z: -20 to -80)
    this.createCloudLayer({
      count: 30,
      xRange: [-60, 60],
      yRange: [15, 50],
      zRange: [-80, -20],
      scaleRange: [10, 22],
      speedRange: [0.005, 0.01],
      opacity: 0.8,
      color: 0xdce4f0
    });
    
    // Clouds further along (z: -80 to -140)
    this.createCloudLayer({
      count: 25,
      xRange: [-70, 70],
      yRange: [20, 55],
      zRange: [-140, -80],
      scaleRange: [12, 25],
      speedRange: [0.003, 0.008],
      opacity: 0.7,
      color: 0xd0d8e8
    });
    
    // Distant clouds (z: -140 to -200)
    this.createCloudLayer({
      count: 20,
      xRange: [-80, 80],
      yRange: [25, 60],
      zRange: [-200, -140],
      scaleRange: [15, 30],
      speedRange: [0.002, 0.005],
      opacity: 0.5,
      color: 0xc8d0e0
    });
    
    // Small accent clouds scattered throughout
    this.createCloudLayer({
      count: 40,
      xRange: [-50, 50],
      yRange: [10, 45],
      zRange: [-180, 30],
      scaleRange: [4, 10],
      speedRange: [0.01, 0.02],
      opacity: 0.6,
      color: 0xf0f4fa
    });
  }

  createCloudLayer(config) {
    const { count, xRange, yRange, zRange, scaleRange, speedRange, opacity, color } = config;
    
    for (let i = 0; i < count; i++) {
      // Create material with specified color
      const cloudMat = new THREE.MeshStandardMaterial({
        color: color || 0xffffff,
        transparent: true,
        opacity: opacity * (0.85 + Math.random() * 0.15),
        depthWrite: false,
        roughness: 1,
        metalness: 0,
        side: THREE.DoubleSide
      });
      
      const cloud = new THREE.Mesh(this.cloudGeometry, cloudMat);
      
      // Random position within range
      const x = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
      const y = yRange[0] + Math.random() * (yRange[1] - yRange[0]);
      const z = zRange[0] + Math.random() * (zRange[1] - zRange[0]);
      
      cloud.position.set(x, y, z);
      
      // Random scale
      const scale = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
      // Stretch clouds horizontally for more natural look
      cloud.scale.set(
        scale * (0.8 + Math.random() * 0.4),
        scale * (0.6 + Math.random() * 0.3),
        scale * (0.8 + Math.random() * 0.4)
      );
      
      // Random rotation
      cloud.rotation.y = Math.random() * Math.PI * 2;
      cloud.rotation.x = (Math.random() - 0.5) * 0.2;
      
      // Set opacity
      cloud.material.opacity = opacity * (0.8 + Math.random() * 0.2);
      
      // Store animation data
      const cloudData = {
        mesh: cloud,
        originalPosition: cloud.position.clone(),
        speed: speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]),
        rotationSpeed: (Math.random() - 0.5) * 0.002,
        bobSpeed: 0.3 + Math.random() * 0.4,
        bobPhase: Math.random() * Math.PI * 2,
        bobAmount: 0.5 + Math.random() * 1.5,
        driftDirection: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          0,
          Math.random() * 0.3 - 0.1
        ).normalize(),
        wrapBounds: {
          x: xRange,
          z: zRange
        }
      };
      
      this.clouds.push(cloudData);
      this.group.add(cloud);
    }
  }

  createFallbackClouds() {
    // Fallback procedural clouds if model fails to load
    this.cloudGeometry = this.createProceduralCloudGeometry();
    this.cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      roughness: 1,
      metalness: 0
    });
    
    this.createCloudField();
    this.isLoaded = true;
  }

  createProceduralCloudGeometry() {
    // Create fluffy cloud from merged spheres
    const spheres = [];
    const baseGeom = new THREE.SphereGeometry(1, 8, 8);
    spheres.push(baseGeom);
    
    // Add bumps
    const bumps = [
      { x: 0.7, y: 0.3, z: 0, r: 0.6 },
      { x: -0.5, y: 0.2, z: 0.3, r: 0.5 },
      { x: 0.2, y: 0.5, z: -0.3, r: 0.4 },
      { x: -0.3, y: -0.2, z: 0.4, r: 0.5 },
      { x: 0.4, y: -0.2, z: -0.2, r: 0.45 }
    ];
    
    bumps.forEach(bump => {
      const bumpGeom = new THREE.SphereGeometry(bump.r, 6, 6);
      bumpGeom.translate(bump.x, bump.y, bump.z);
      spheres.push(bumpGeom);
    });
    
    // Merge
    const positions = [];
    const normals = [];
    
    spheres.forEach(geom => {
      const pos = geom.attributes.position.array;
      const norm = geom.attributes.normal.array;
      for (let i = 0; i < pos.length; i++) {
        positions.push(pos[i]);
        normals.push(norm[i]);
      }
      geom.dispose();
    });
    
    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    
    return merged;
  }

  update(progress, time) {
    if (!this.isLoaded) return;
    
    this.time = time;
    
    this.clouds.forEach(cloudData => {
      const { mesh, originalPosition, speed, rotationSpeed, bobSpeed, bobPhase, bobAmount, driftDirection, wrapBounds } = cloudData;
      
      // Horizontal drift
      mesh.position.x += driftDirection.x * speed;
      mesh.position.z += driftDirection.z * speed;
      
      // Vertical bobbing
      mesh.position.y = originalPosition.y + Math.sin(time * bobSpeed + bobPhase) * bobAmount;
      
      // Slow rotation
      mesh.rotation.y += rotationSpeed;
      
      // Wrap around when out of bounds
      if (mesh.position.x > wrapBounds.x[1] + 20) {
        mesh.position.x = wrapBounds.x[0] - 20;
      } else if (mesh.position.x < wrapBounds.x[0] - 20) {
        mesh.position.x = wrapBounds.x[1] + 20;
      }
      
      if (mesh.position.z > wrapBounds.z[1] + 30) {
        mesh.position.z = wrapBounds.z[0] - 30;
      }
      
      // Fade clouds based on scroll progress for dramatic effect
      const baseMaterialOpacity = mesh.material.userData.baseOpacity || mesh.material.opacity;
      mesh.material.userData.baseOpacity = baseMaterialOpacity;
      
      // More visible during cloud-heavy sections
      let targetOpacity = baseMaterialOpacity;
      if (progress < 0.1) {
        // Fade in at start
        targetOpacity = baseMaterialOpacity * (0.3 + progress * 7);
      } else if (progress > 0.9) {
        // Slight fade at end
        targetOpacity = baseMaterialOpacity * (1 - (progress - 0.9) * 3);
      }
      
      mesh.material.opacity += (targetOpacity - mesh.material.opacity) * 0.05;
    });
  }

  // Get cloud density at a position (for effects like fog)
  getDensityAt(position) {
    let density = 0;
    
    this.clouds.forEach(cloudData => {
      const distance = position.distanceTo(cloudData.mesh.position);
      const cloudRadius = cloudData.mesh.scale.x * 2;
      
      if (distance < cloudRadius) {
        density += (1 - distance / cloudRadius) * 0.3;
      }
    });
    
    return Math.min(1, density);
  }

  destroy() {
    this.scene.remove(this.group);
    
    this.clouds.forEach(cloudData => {
      cloudData.mesh.geometry.dispose();
      cloudData.mesh.material.dispose();
    });
    
    if (this.cloudGeometry) this.cloudGeometry.dispose();
    if (this.cloudMaterial) this.cloudMaterial.dispose();
  }
}
