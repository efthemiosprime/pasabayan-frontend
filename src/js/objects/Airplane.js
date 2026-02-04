/**
 * Airplane - Loads GLB model with vapor trail
 * Smooth flight through the scene like the reference
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Airplane {
  constructor(scene, settings) {
    this.scene = scene;
    this.settings = settings;
    this.group = new THREE.Group();
    this.model = null;
    this.mixer = null;
    this.isLoaded = false;
    this.propeller = null;
    
    // Smooth movement
    this.currentProgress = 0;
    this.targetPosition = new THREE.Vector3();
    
    // Vapor trail
    this.trail = null;
    this.trailPositions = [];
    this.maxTrailLength = 150;
    
    this.loadModel();
    this.createVaporTrail();
    scene.add(this.group);
  }

  async loadModel() {
    const loader = new GLTFLoader();
    
    try {
      const gltf = await loader.loadAsync('/low_poly_airplane.glb');
      this.model = gltf.scene;
      
      // Setup the model
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Make the material slightly emissive for that soft glow
          if (child.material) {
            child.material = child.material.clone();
            child.material.metalness = 0.1;
            child.material.roughness = 0.6;
          }
          
          // Find propeller
          if (child.name.toLowerCase().includes('propeller') || 
              child.name.toLowerCase().includes('prop')) {
            this.propeller = child;
          }
        }
      });
      
      // Scale the model - make it prominent
      this.model.scale.set(3, 3, 3);
      this.group.add(this.model);
      
      // Setup animations if any
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.model);
        gltf.animations.forEach((clip) => {
          this.mixer.clipAction(clip).play();
        });
      }
      
      this.isLoaded = true;
      console.log('Airplane model loaded successfully');
    } catch (error) {
      console.error('Error loading airplane model:', error);
      this.createFallbackAirplane();
    }
  }

  createFallbackAirplane() {
    // Sleek placeholder airplane
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8faac8,
      metalness: 0.2,
      roughness: 0.5
    });
    
    // Fuselage
    const fuselageGeom = new THREE.CapsuleGeometry(0.3, 1.5, 8, 16);
    const fuselage = new THREE.Mesh(fuselageGeom, bodyMaterial);
    fuselage.rotation.z = Math.PI / 2;
    this.group.add(fuselage);
    
    // Wings
    const wingGeom = new THREE.BoxGeometry(0.1, 2.5, 0.4);
    const wings = new THREE.Mesh(wingGeom, bodyMaterial);
    this.group.add(wings);
    
    // Tail
    const tailGeom = new THREE.BoxGeometry(0.1, 0.8, 0.3);
    const tail = new THREE.Mesh(tailGeom, bodyMaterial);
    tail.position.set(-0.9, 0.4, 0);
    this.group.add(tail);
    
    this.group.scale.set(2, 2, 2);
    this.isLoaded = true;
  }

  createVaporTrail() {
    // Create a line-based vapor trail
    const trailGeometry = new THREE.BufferGeometry();
    
    // Initialize with empty positions
    const positions = new Float32Array(this.maxTrailLength * 3);
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Gradient material for the trail
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      linewidth: 2
    });
    
    this.trail = new THREE.Line(trailGeometry, trailMaterial);
    this.trail.frustumCulled = false;
    this.scene.add(this.trail);
    
    // Also create a thicker ribbon trail for better visibility
    this.createRibbonTrail();
  }

  createRibbonTrail() {
    // Create a mesh-based ribbon trail for the contrail effect
    const ribbonGeometry = new THREE.PlaneGeometry(0.3, 1, 1, this.maxTrailLength - 1);
    const ribbonMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    this.ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    this.ribbon.frustumCulled = false;
    this.scene.add(this.ribbon);
  }

  update(progress, velocity, deltaTime) {
    if (!this.isLoaded) return;
    
    // Update animation mixer
    if (this.mixer && deltaTime) {
      this.mixer.update(deltaTime);
    }
    
    // Airplane always visible
    this.group.visible = true;
    this.trail.visible = true;
    this.ribbon.visible = true;
    
    // Smooth progress interpolation for silky movement
    this.currentProgress += (progress - this.currentProgress) * 0.03;
    
    // Get flight position based on smoothed progress
    this.targetPosition = this.getFlightPosition(this.currentProgress);
    
    // Extra smooth position interpolation
    this.group.position.lerp(this.targetPosition, 0.04);
    
    // Airplane faces forward (flying into the distance)
    // Smooth rotation based on movement
    const pitch = Math.sin(this.currentProgress * Math.PI) * 0.08;
    const bank = Math.sin(this.currentProgress * Math.PI * 3) * 0.05;
    
    // Smoothly interpolate rotation
    const targetRotation = new THREE.Euler(
      pitch,
      -Math.PI / 2,  // Face forward
      bank
    );
    
    this.group.rotation.x += (targetRotation.x - this.group.rotation.x) * 0.03;
    this.group.rotation.y += (targetRotation.y - this.group.rotation.y) * 0.03;
    this.group.rotation.z += (targetRotation.z - this.group.rotation.z) * 0.03;
    
    // Update propeller
    if (this.propeller) {
      this.propeller.rotation.z += 0.4;
    }
    
    // Update vapor trail
    this.updateTrail(this.group.position);
  }

  getFlightPosition(t) {
    // Airplane flies FORWARD through clouds (camera follows from behind)
    // Z axis is the main direction of travel
    const position = new THREE.Vector3();
    
    // Flying forward into the distance
    position.z = 20 - t * 200;  // Start at z=20, fly to z=-180
    
    // Gentle horizontal drift (slight S-curve)
    position.x = Math.sin(t * Math.PI * 2) * 15;
    
    // Altitude changes - rise through clouds, then level out
    position.y = 15 + Math.sin(t * Math.PI) * 20 + t * 10;
    
    return position;
  }
  
  // Get position for camera to follow
  getPosition() {
    return this.group.position.clone();
  }

  updateTrail(currentPosition) {
    // Add current position to trail
    this.trailPositions.unshift(currentPosition.clone());
    
    // Limit trail length
    if (this.trailPositions.length > this.maxTrailLength) {
      this.trailPositions.pop();
    }
    
    // Update line trail - trail comes from BEHIND the airplane (positive Z since plane flies into -Z)
    const positions = this.trail.geometry.attributes.position.array;
    
    for (let i = 0; i < this.maxTrailLength; i++) {
      if (i < this.trailPositions.length) {
        const pos = this.trailPositions[i];
        // Trail behind airplane (airplane faces -Z, so trail is at +Z offset)
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y - 0.5;
        positions[i * 3 + 2] = pos.z + 3 + i * 0.1; // Trail extends behind
      } else {
        const lastPos = this.trailPositions[this.trailPositions.length - 1] || new THREE.Vector3();
        positions[i * 3] = lastPos.x;
        positions[i * 3 + 1] = lastPos.y - 0.5;
        positions[i * 3 + 2] = lastPos.z + 3 + i * 0.1;
      }
    }
    
    this.trail.geometry.attributes.position.needsUpdate = true;
    
    // Update ribbon trail
    if (this.ribbon && this.trailPositions.length > 1) {
      const ribbonPositions = this.ribbon.geometry.attributes.position.array;
      const verticesPerSegment = 2;
      
      for (let i = 0; i < this.maxTrailLength && i < this.trailPositions.length; i++) {
        const pos = this.trailPositions[i];
        const fadeRatio = 1 - (i / this.maxTrailLength);
        const width = 0.5 * fadeRatio;
        
        const idx = i * verticesPerSegment * 3;
        
        // Ribbon behind airplane
        ribbonPositions[idx] = pos.x + width;
        ribbonPositions[idx + 1] = pos.y - 0.3;
        ribbonPositions[idx + 2] = pos.z + 3 + i * 0.1;
        
        ribbonPositions[idx + 3] = pos.x - width;
        ribbonPositions[idx + 4] = pos.y - 0.3;
        ribbonPositions[idx + 5] = pos.z + 3 + i * 0.1;
      }
      
      this.ribbon.geometry.attributes.position.needsUpdate = true;
    }
  }

  destroy() {
    this.scene.remove(this.group);
    this.scene.remove(this.trail);
    this.scene.remove(this.ribbon);
    
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    
    if (this.trail) {
      this.trail.geometry.dispose();
      this.trail.material.dispose();
    }
    if (this.ribbon) {
      this.ribbon.geometry.dispose();
      this.ribbon.material.dispose();
    }
  }
}
