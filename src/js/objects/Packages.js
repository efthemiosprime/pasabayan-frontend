/**
 * Packages - Animated delivery packages for the sender section
 * Packages float, assemble, and load into the airplane
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class Packages {
  constructor(scene, settings) {
    this.scene = scene;
    this.settings = settings;
    this.group = new THREE.Group();
    this.packages = [];
    this.packageCount = 12;
    this.assemblyProgress = 0;
    
    this.create();
    scene.add(this.group);
  }

  create() {
    // Package colors (warm tones for sender section)
    const colors = [
      0xF56565, // Red
      0xED8936, // Orange
      0xECC94B, // Yellow
      0xFC8181, // Light red
      0xFBD38D, // Light orange
      0xFAF089  // Light yellow
    ];
    
    // Create various package sizes
    for (let i = 0; i < this.packageCount; i++) {
      const package_ = this.createPackage(colors[i % colors.length]);
      
      // Store animation data
      package_.userData = {
        index: i,
        // Start position (scattered)
        startPosition: new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          5 + Math.random() * 15,
          (Math.random() - 0.5) * 20
        ),
        // Assembly position (forming a neat pile)
        assemblyPosition: this.getAssemblyPosition(i),
        // Loading position (moving toward airplane)
        loadPosition: new THREE.Vector3(
          5 + (i % 4) * 0.5,
          8 + Math.floor(i / 4) * 0.4,
          -5 + (i % 3) * 0.3
        ),
        // Animation properties
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatPhase: Math.random() * Math.PI * 2,
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01
        ),
        originalRotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
      };
      
      // Set initial position
      package_.position.copy(package_.userData.startPosition);
      package_.rotation.copy(package_.userData.originalRotation);
      package_.visible = false;
      
      this.packages.push(package_);
      this.group.add(package_);
    }
    
    // Create collection box
    this.createCollectionBox();
  }

  createPackage(color) {
    const group = new THREE.Group();
    
    // Random size
    const width = 0.4 + Math.random() * 0.4;
    const height = 0.3 + Math.random() * 0.3;
    const depth = 0.35 + Math.random() * 0.3;
    
    // Box body
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.1
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);
    
    // Tape strip
    const tapeGeometry = new THREE.BoxGeometry(width * 1.02, 0.03, depth * 0.2);
    const tapeMaterial = new THREE.MeshStandardMaterial({
      color: 0xD69E2E,
      roughness: 0.5
    });
    const tape = new THREE.Mesh(tapeGeometry, tapeMaterial);
    tape.position.y = height / 2 + 0.015;
    group.add(tape);
    
    // Side tape
    const sideTapeGeometry = new THREE.BoxGeometry(width * 0.15, height * 1.02, 0.02);
    const sideTape = new THREE.Mesh(sideTapeGeometry, tapeMaterial);
    sideTape.position.z = depth / 2 + 0.01;
    group.add(sideTape);
    
    // Label
    const labelGeometry = new THREE.PlaneGeometry(width * 0.5, height * 0.4);
    const labelMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, 0, depth / 2 + 0.01);
    group.add(label);
    
    return group;
  }

  getAssemblyPosition(index) {
    // Create a neat pile formation
    const layer = Math.floor(index / 4);
    const posInLayer = index % 4;
    
    const layerOffset = layer * 0.5;
    const x = (posInLayer % 2 - 0.5) * 0.8 - 5;
    const y = 3 + layer * 0.45;
    const z = Math.floor(posInLayer / 2) * 0.7 - 0.35;
    
    return new THREE.Vector3(x, y, z);
  }

  createCollectionBox() {
    // Large cardboard box that packages assemble into
    const boxGroup = new THREE.Group();
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xD4A574,
      roughness: 0.8,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9
    });
    
    // Box body (open top)
    const boxSize = { w: 2.5, h: 1.5, d: 2 };
    
    // Bottom
    const bottomGeometry = new THREE.BoxGeometry(boxSize.w, 0.1, boxSize.d);
    const bottom = new THREE.Mesh(bottomGeometry, material);
    bottom.position.y = 2;
    bottom.castShadow = true;
    bottom.receiveShadow = true;
    boxGroup.add(bottom);
    
    // Walls
    const wallMaterial = material.clone();
    
    // Front wall
    const frontGeometry = new THREE.BoxGeometry(boxSize.w, boxSize.h, 0.08);
    const frontWall = new THREE.Mesh(frontGeometry, wallMaterial);
    frontWall.position.set(0, 2 + boxSize.h / 2, boxSize.d / 2);
    frontWall.castShadow = true;
    boxGroup.add(frontWall);
    
    // Back wall
    const backWall = frontWall.clone();
    backWall.position.z = -boxSize.d / 2;
    boxGroup.add(backWall);
    
    // Side walls
    const sideGeometry = new THREE.BoxGeometry(0.08, boxSize.h, boxSize.d);
    const leftWall = new THREE.Mesh(sideGeometry, wallMaterial);
    leftWall.position.set(-boxSize.w / 2, 2 + boxSize.h / 2, 0);
    leftWall.castShadow = true;
    boxGroup.add(leftWall);
    
    const rightWall = leftWall.clone();
    rightWall.position.x = boxSize.w / 2;
    boxGroup.add(rightWall);
    
    // Flaps (will animate open/closed)
    this.flaps = [];
    const flapGeometry = new THREE.BoxGeometry(boxSize.w / 2 - 0.05, 0.06, boxSize.d * 0.4);
    
    // Left flap
    const leftFlap = new THREE.Mesh(flapGeometry, wallMaterial);
    leftFlap.position.set(-boxSize.w / 4, 2 + boxSize.h, 0);
    leftFlap.geometry.translate(boxSize.w / 4, 0, 0);
    this.flaps.push({ mesh: leftFlap, axis: 'z', dir: 1 });
    boxGroup.add(leftFlap);
    
    // Right flap
    const rightFlap = new THREE.Mesh(flapGeometry, wallMaterial);
    rightFlap.position.set(boxSize.w / 4, 2 + boxSize.h, 0);
    rightFlap.geometry.translate(-boxSize.w / 4, 0, 0);
    this.flaps.push({ mesh: rightFlap, axis: 'z', dir: -1 });
    boxGroup.add(rightFlap);
    
    // Position the collection box
    boxGroup.position.set(-5, 0, 0);
    this.collectionBox = boxGroup;
    this.group.add(boxGroup);
    
    // Initially hidden
    boxGroup.visible = false;
  }

  update(progress) {
    // Packages are visible from 10% to 60%
    const packagesStart = 0.08;
    const packagesEnd = 0.55;
    
    // Phase 1: 10-25% - Packages floating, appearing
    // Phase 2: 25-35% - Packages assembling
    // Phase 3: 35-55% - Packages loading into airplane
    
    if (progress < packagesStart || progress > packagesEnd) {
      this.packages.forEach(p => p.visible = false);
      this.collectionBox.visible = false;
      return;
    }
    
    const localProgress = (progress - packagesStart) / (packagesEnd - packagesStart);
    const time = performance.now() * 0.001;
    
    // Show collection box during assembly phase
    this.collectionBox.visible = localProgress > 0.2 && localProgress < 0.7;
    
    // Update flaps (open during loading)
    const flapAngle = localProgress > 0.5 
      ? Math.min(1, (localProgress - 0.5) * 5) * Math.PI * 0.4
      : Math.max(0, 1 - localProgress * 5) * Math.PI * 0.4;
    
    this.flaps.forEach(flap => {
      if (flap.axis === 'z') {
        flap.mesh.rotation.z = flapAngle * flap.dir;
      }
    });
    
    // Update each package
    this.packages.forEach((package_, i) => {
      const data = package_.userData;
      const delay = i * 0.05;
      
      // Staggered appearance
      const appearProgress = Math.max(0, (localProgress - delay) / 0.2);
      package_.visible = appearProgress > 0;
      
      if (!package_.visible) return;
      
      // Calculate position based on phase
      let targetPosition;
      let targetRotation;
      
      if (localProgress < 0.3) {
        // Phase 1: Floating around
        const floatProgress = Math.min(1, localProgress / 0.3);
        
        targetPosition = data.startPosition.clone();
        targetPosition.y += Math.sin(time * data.floatSpeed + data.floatPhase) * 1;
        targetPosition.x += Math.sin(time * data.floatSpeed * 0.7 + data.floatPhase) * 0.5;
        
        // Rotate while floating
        targetRotation = data.originalRotation.clone();
        
        // Scale up on appear
        const scale = Math.min(1, appearProgress);
        package_.scale.setScalar(scale);
        
      } else if (localProgress < 0.55) {
        // Phase 2: Assembling into box
        const assembleProgress = (localProgress - 0.3) / 0.25;
        const eased = this.easeInOutCubic(Math.min(1, assembleProgress - delay * 2));
        
        targetPosition = new THREE.Vector3().lerpVectors(
          data.startPosition,
          data.assemblyPosition,
          eased
        );
        
        // Straighten rotation
        targetRotation = new THREE.Euler(
          data.originalRotation.x * (1 - eased),
          data.originalRotation.y * (1 - eased),
          data.originalRotation.z * (1 - eased)
        );
        
      } else {
        // Phase 3: Loading toward airplane
        const loadProgress = (localProgress - 0.55) / 0.45;
        const eased = this.easeInOutCubic(Math.min(1, loadProgress));
        
        targetPosition = new THREE.Vector3().lerpVectors(
          data.assemblyPosition,
          data.loadPosition,
          eased
        );
        
        // Stay straight
        targetRotation = new THREE.Euler(0, 0, 0);
        
        // Fade out as they "load"
        package_.traverse(child => {
          if (child.material) {
            child.material.opacity = Math.max(0, 1 - loadProgress * 1.5);
            child.material.transparent = true;
          }
        });
      }
      
      // Apply transforms with smoothing
      package_.position.lerp(targetPosition, 0.1);
      
      // Smooth rotation
      package_.rotation.x += (targetRotation.x - package_.rotation.x) * 0.05;
      package_.rotation.y += (targetRotation.y - package_.rotation.y) * 0.05;
      package_.rotation.z += (targetRotation.z - package_.rotation.z) * 0.05;
    });
  }

  easeInOutCubic(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Burst effect when packages appear
  burst() {
    this.packages.forEach((package_, i) => {
      const delay = i * 0.05;
      
      gsap.from(package_.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        delay: delay,
        ease: 'back.out(1.7)'
      });
    });
  }

  destroy() {
    this.scene.remove(this.group);
    this.packages.forEach(package_ => {
      package_.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
  }
}
