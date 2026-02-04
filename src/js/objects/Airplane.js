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
    
    // Visibility control - airplane enters at 2% and exits at 82%
    this.enterProgress = 0.02;  // Airplane enters scene
    this.exitProgress = 0.82;   // Airplane exits before HTML sections (88%)
    this.isVisible = false;
    
    // Create flight path that passes by cards
    this.createFlightPath();
    
    // Set initial position OFF-SCREEN (behind/above camera)
    const initialPos = this.flightPath.getPointAt(0);
    this.group.position.copy(initialPos);
    
    // Set initial rotation to face along the path (into -Z direction)
    const initialTangent = this.flightPath.getTangentAt(0.01);
    const angle = Math.atan2(initialTangent.x, -initialTangent.z);
    this.group.rotation.y = angle;
    
    // Start hidden
    this.group.visible = false;
    
    this.loadModel();
    this.createVaporTrail();
    scene.add(this.group);
  }
  
  createFlightPath() {
    // Create a spline path that:
    // 1. Starts OFF-SCREEN (behind camera, high up)
    // 2. Enters scene when scrolling starts
    // 3. Passes by each card location
    // 4. Flies OUT of scene before HTML sections appear
    //
    // Cards are spaced out:
    // Sender (right): Z = -40, -120, -200, -280 at X ≈ 16-18
    // Carrier (left): Z = -380, -460, -540, -620 at X ≈ -16 to -18
    const pathPoints = [
      // Start OFF-SCREEN - behind and above camera
      new THREE.Vector3(0, 60, 150),      // Way behind camera (starts hidden)
      new THREE.Vector3(0, 40, 100),      // Descending toward scene
      new THREE.Vector3(0, 25, 50),       // Entering visible area
      new THREE.Vector3(4, 20, 0),        // Now visible, approaching cards
      
      // Pass by sender cards
      new THREE.Vector3(6, 22, -40),      // Pass by sender card 1
      new THREE.Vector3(8, 30, -120),     // Pass by sender card 2
      new THREE.Vector3(6, 38, -200),     // Pass by sender card 3
      new THREE.Vector3(4, 46, -280),     // Pass by sender card 4
      
      // Transition to carrier side
      new THREE.Vector3(0, 50, -330),     // Transition to left side
      
      // Pass by carrier cards
      new THREE.Vector3(-4, 54, -380),    // Pass by carrier card 1
      new THREE.Vector3(-8, 62, -460),    // Pass by carrier card 2
      new THREE.Vector3(-6, 70, -540),    // Pass by carrier card 3
      new THREE.Vector3(-4, 78, -620),    // Pass by carrier card 4
      
      // FLY OUT - exit scene dramatically before HTML sections
      new THREE.Vector3(0, 85, -680),     // Start exit
      new THREE.Vector3(10, 100, -720),   // Banking right and climbing
      new THREE.Vector3(40, 130, -780),   // Flying away to the right
      new THREE.Vector3(100, 180, -850),  // Far off into the distance (hidden)
    ];
    
    this.flightPath = new THREE.CatmullRomCurve3(pathPoints, false, 'centripetal', 0.5);
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
      
      // Correct model orientation - most GLB airplane models face +X or -X
      // Rotate to face -Z (Three.js forward direction)
      this.model.rotation.y = -Math.PI / 2;  // Rotate 90 degrees
      
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
    
    // Initialize positions at the starting location (not zeros to avoid black lines)
    const initialPos = this.flightPath ? this.flightPath.getPointAt(0) : new THREE.Vector3(0, 60, 150);
    const positions = new Float32Array(this.maxTrailLength * 3);
    for (let i = 0; i < this.maxTrailLength; i++) {
      positions[i * 3] = initialPos.x;
      positions[i * 3 + 1] = initialPos.y;
      positions[i * 3 + 2] = initialPos.z + i * 0.1;
    }
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // White vapor trail material - starts hidden
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,  // Start hidden
      linewidth: 1
    });
    
    this.trail = new THREE.Line(trailGeometry, trailMaterial);
    this.trail.frustumCulled = false;
    this.trail.visible = false;  // Start hidden
    this.scene.add(this.trail);
    
    // Also create a thicker ribbon trail for better visibility
    this.createRibbonTrail();
    
    // Initialize trail positions array with starting position
    for (let i = 0; i < 10; i++) {
      this.trailPositions.push(initialPos.clone());
    }
  }

  createRibbonTrail() {
    // Create a mesh-based ribbon trail for the contrail effect
    const initialPos = this.flightPath ? this.flightPath.getPointAt(0) : new THREE.Vector3(0, 60, 150);
    const ribbonGeometry = new THREE.PlaneGeometry(0.3, 1, 1, this.maxTrailLength - 1);
    
    // Initialize ribbon positions at starting location
    const ribbonPositions = ribbonGeometry.attributes.position.array;
    for (let i = 0; i < this.maxTrailLength; i++) {
      const idx = i * 2 * 3;
      ribbonPositions[idx] = initialPos.x + 0.15;
      ribbonPositions[idx + 1] = initialPos.y;
      ribbonPositions[idx + 2] = initialPos.z + i * 0.1;
      ribbonPositions[idx + 3] = initialPos.x - 0.15;
      ribbonPositions[idx + 4] = initialPos.y;
      ribbonPositions[idx + 5] = initialPos.z + i * 0.1;
    }
    ribbonGeometry.attributes.position.needsUpdate = true;
    
    const ribbonMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,  // Start hidden
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    this.ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    this.ribbon.frustumCulled = false;
    this.ribbon.visible = false;  // Start hidden
    this.scene.add(this.ribbon);
  }

  update(progress, velocity, deltaTime) {
    if (!this.isLoaded) return;
    
    // Update animation mixer
    if (this.mixer && deltaTime) {
      this.mixer.update(deltaTime);
    }
    
    // Control visibility based on scroll progress
    // Enter at 2%, exit at 82% (before HTML sections at 88%)
    const fadeInStart = this.enterProgress;
    const fadeInEnd = this.enterProgress + 0.03;   // Fade in over 3%
    const fadeOutStart = this.exitProgress;
    const fadeOutEnd = this.exitProgress + 0.05;   // Fade out over 5%
    
    let opacity = 0;
    if (progress < fadeInStart) {
      // Before entry - hidden
      opacity = 0;
    } else if (progress < fadeInEnd) {
      // Fading in
      opacity = (progress - fadeInStart) / (fadeInEnd - fadeInStart);
    } else if (progress < fadeOutStart) {
      // Fully visible
      opacity = 1;
    } else if (progress < fadeOutEnd) {
      // Fading out (flying away)
      opacity = 1 - (progress - fadeOutStart) / (fadeOutEnd - fadeOutStart);
    } else {
      // After exit - hidden
      opacity = 0;
    }
    
    opacity = Math.max(0, Math.min(1, opacity));
    this.isVisible = opacity > 0.01;
    
    // Set visibility
    this.group.visible = this.isVisible;
    if (this.trail) this.trail.visible = this.isVisible;
    if (this.ribbon) this.ribbon.visible = this.isVisible;
    
    // Update trail opacity for fade effect
    if (this.trail && this.trail.material) {
      this.trail.material.opacity = 0.5 * opacity;
    }
    if (this.ribbon && this.ribbon.material) {
      this.ribbon.material.opacity = 0.4 * opacity;
    }
    
    // Only update position if visible
    if (!this.isVisible) return;
    
    // Smooth progress interpolation for silky movement
    this.currentProgress += (progress - this.currentProgress) * 0.03;
    
    // Get flight position based on smoothed progress
    this.targetPosition = this.getFlightPosition(this.currentProgress);
    
    // Extra smooth position interpolation
    this.group.position.lerp(this.targetPosition, 0.04);
    
    // Get flight direction from path tangent for natural orientation
    if (this.flightPath) {
      const t = Math.min(0.99, Math.max(0.01, this.currentProgress));
      const tangent = this.flightPath.getTangentAt(t);
      
      // Calculate yaw (rotation around Y axis) to face movement direction
      const targetYaw = Math.atan2(tangent.x, -tangent.z);
      
      // Calculate pitch based on vertical movement
      const targetPitch = Math.atan2(-tangent.y, Math.sqrt(tangent.x * tangent.x + tangent.z * tangent.z)) * 0.5;
      
      // Calculate bank based on horizontal turning rate
      const targetBank = -tangent.x * 0.4;
      
      // Create target rotation using Euler angles (YXZ order for aircraft)
      const targetEuler = new THREE.Euler(targetPitch, targetYaw, targetBank, 'YXZ');
      const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);
      
      // Smooth rotation interpolation
      this.group.quaternion.slerp(targetQuaternion, 0.05);
    }
    
    // Update propeller
    if (this.propeller) {
      this.propeller.rotation.z += 0.4;
    }
    
    // Update vapor trail
    this.updateTrail(this.group.position);
  }

  getFlightPosition(t) {
    // Use the spline path that passes by each card
    if (this.flightPath) {
      return this.flightPath.getPointAt(Math.min(1, Math.max(0, t)));
    }
    
    // Fallback if path not ready
    return new THREE.Vector3(0, 20, 20 - t * 260);
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
