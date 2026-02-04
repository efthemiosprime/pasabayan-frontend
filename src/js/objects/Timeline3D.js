/**
 * Timeline3D - 3D timeline path and step markers
 * Creates an animated path with floating step cards in 3D space
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class Timeline3D {
  constructor(scene, settings) {
    this.scene = scene;
    this.settings = settings;
    this.group = new THREE.Group();
    
    this.senderTimeline = null;
    this.carrierTimeline = null;
    this.currentProgress = 0;
    
    this.create();
    scene.add(this.group);
  }

  create() {
    // Create sender timeline (visible during 15-40%)
    // Positioned to the LEFT of camera path, further away (z=-30 to -60)
    this.senderTimeline = this.createTimeline('sender', [
      { 
        position: new THREE.Vector3(-25, 5, -20),
        title: '01',
        subtitle: 'Create Request',
        color: 0xF56565
      },
      { 
        position: new THREE.Vector3(-30, 3, -35),
        title: '02',
        subtitle: 'Find Carrier',
        color: 0xF56565
      },
      { 
        position: new THREE.Vector3(-28, 2, -50),
        title: '03',
        subtitle: 'Secure & Pay',
        color: 0xF56565
      },
      { 
        position: new THREE.Vector3(-22, 0, -65),
        title: '04',
        subtitle: 'Track & Receive',
        color: 0xF56565
      }
    ]);
    
    // Create carrier timeline (visible during 45-70%)
    // Positioned to the RIGHT of camera path
    this.carrierTimeline = this.createTimeline('carrier', [
      { 
        position: new THREE.Vector3(25, 8, -40),
        title: '01',
        subtitle: 'Post Trip',
        color: 0x38B2AC
      },
      { 
        position: new THREE.Vector3(30, 10, -55),
        title: '02',
        subtitle: 'Accept Packages',
        color: 0x38B2AC
      },
      { 
        position: new THREE.Vector3(28, 12, -70),
        title: '03',
        subtitle: 'Pick Up',
        color: 0x38B2AC
      },
      { 
        position: new THREE.Vector3(22, 14, -85),
        title: '04',
        subtitle: 'Deliver & Earn',
        color: 0x38B2AC
      }
    ]);
    
    this.group.add(this.senderTimeline.group);
    this.group.add(this.carrierTimeline.group);
  }

  createTimeline(type, steps) {
    const timelineGroup = new THREE.Group();
    const markers = [];
    const pathPoints = steps.map(s => s.position);
    
    // Create the path curve
    const curve = new THREE.CatmullRomCurve3(pathPoints, false, 'centripetal', 0.5);
    
    // Create tube geometry for the path - thicker for visibility at distance
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.3, 12, false);
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: steps[0].color,
      emissive: steps[0].color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tube.castShadow = true;
    timelineGroup.add(tube);
    
    // Create animated line on top of tube
    const linePoints = curve.getPoints(100);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      linewidth: 2
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    timelineGroup.add(line);
    
    // Create glowing orb that travels along the path - larger
    const orbGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const orbMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.95
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    timelineGroup.add(orb);
    
    // Create step markers
    steps.forEach((step, index) => {
      const marker = this.createStepMarker(step, index);
      markers.push(marker);
      timelineGroup.add(marker.group);
    });
    
    // Initially hidden
    timelineGroup.visible = false;
    
    return {
      group: timelineGroup,
      curve,
      tube,
      orb,
      markers,
      steps,
      type
    };
  }

  createStepMarker(step, index) {
    const group = new THREE.Group();
    group.position.copy(step.position);
    
    // Scale factor for markers (smaller since they're further away)
    const scale = 1.5;
    
    // Main sphere marker - glowing core
    const sphereGeometry = new THREE.SphereGeometry(0.5 * scale, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: step.color,
      emissive: step.color,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(sphere);
    
    // Outer ring - smaller and more subtle
    const ringGeometry = new THREE.TorusGeometry(0.8 * scale, 0.08 * scale, 8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: step.color,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Lay flat
    group.add(ring);
    
    // Pulsing ring (animated) - also flat
    const pulseRingGeometry = new THREE.TorusGeometry(1.0 * scale, 0.05 * scale, 8, 32);
    const pulseRingMaterial = new THREE.MeshBasicMaterial({
      color: step.color,
      transparent: true,
      opacity: 0.3
    });
    const pulseRing = new THREE.Mesh(pulseRingGeometry, pulseRingMaterial);
    pulseRing.rotation.x = Math.PI / 2; // Lay flat
    group.add(pulseRing);
    
    // Number text sprite (these will billboard)
    const numberSprite = this.createTextSprite(step.title, step.color, 1.5);
    numberSprite.position.set(0, 2 * scale, 0);
    group.add(numberSprite);
    
    // Subtitle sprite
    const subtitleSprite = this.createTextSprite(step.subtitle, 0xffffff, 0.8);
    subtitleSprite.position.set(0, -1.5 * scale, 0);
    group.add(subtitleSprite);
    
    // Store for animation
    group.userData = {
      sphere,
      ring,
      pulseRing,
      index,
      originalScale: 1,
      isActive: false
    };
    
    return {
      group,
      sphere,
      ring,
      pulseRing,
      step
    };
  }

  createTextSprite(text, color, size) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Clear
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Text settings
    context.font = 'bold 64px Space Grotesk, Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Convert color to CSS
    const colorHex = typeof color === 'number' 
      ? '#' + color.toString(16).padStart(6, '0')
      : color;
    
    context.fillStyle = colorHex;
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size * 2, size, 1);
    
    return sprite;
  }

  update(progress, camera) {
    this.currentProgress = progress;
    
    // Sender timeline: visible from 15% to 40%
    const senderStart = 0.12;
    const senderEnd = 0.42;
    const senderVisible = progress >= senderStart && progress <= senderEnd;
    this.senderTimeline.group.visible = senderVisible;
    
    if (senderVisible) {
      const senderProgress = (progress - senderStart) / (senderEnd - senderStart);
      this.updateTimeline(this.senderTimeline, senderProgress, camera);
    }
    
    // Carrier timeline: visible from 45% to 72%
    const carrierStart = 0.45;
    const carrierEnd = 0.72;
    const carrierVisible = progress >= carrierStart && progress <= carrierEnd;
    this.carrierTimeline.group.visible = carrierVisible;
    
    if (carrierVisible) {
      const carrierProgress = (progress - carrierStart) / (carrierEnd - carrierStart);
      this.updateTimeline(this.carrierTimeline, carrierProgress, camera);
    }
  }

  updateTimeline(timeline, localProgress, camera) {
    const time = performance.now() * 0.001;
    
    // Update orb position along the path
    const orbT = Math.min(1, localProgress * 1.2);
    const orbPosition = timeline.curve.getPointAt(orbT);
    timeline.orb.position.copy(orbPosition);
    
    // Orb pulsing
    const orbScale = 1 + Math.sin(time * 4) * 0.2;
    timeline.orb.scale.setScalar(orbScale);
    
    // Update each marker
    timeline.markers.forEach((marker, index) => {
      const markerProgress = index / (timeline.markers.length - 1);
      const isActive = localProgress >= markerProgress - 0.1;
      const isPast = localProgress > markerProgress + 0.15;
      
      // Scale animation
      const targetScale = isActive ? (isPast ? 0.9 : 1.2) : 0.7;
      const currentScale = marker.group.scale.x;
      marker.group.scale.setScalar(currentScale + (targetScale - currentScale) * 0.1);
      
      // Opacity animation
      const targetOpacity = isActive ? 1 : 0.4;
      marker.sphere.material.opacity = marker.sphere.material.opacity + (targetOpacity - marker.sphere.material.opacity) * 0.1;
      marker.ring.material.opacity = marker.ring.material.opacity + (targetOpacity * 0.6 - marker.ring.material.opacity) * 0.1;
      
      // Ring pulse animation - horizontal rotation and scale
      if (isActive && !isPast) {
        marker.pulseRing.scale.setScalar(1 + Math.sin(time * 3 + index) * 0.3);
        marker.pulseRing.material.opacity = 0.3 + Math.sin(time * 3 + index) * 0.2;
      }
      
      // Subtle rotation for rings (not billboarding the whole group)
      marker.ring.rotation.z = time * 0.5 + index;
      marker.pulseRing.rotation.z = -time * 0.3 + index;
    });
    
    // Tube draw animation - fade in based on progress
    const tubeOpacity = Math.min(0.8, localProgress * 2);
    timeline.tube.material.opacity = tubeOpacity + Math.sin(time * 2) * 0.05;
  }

  // Highlight a specific step
  highlightStep(timeline, stepIndex) {
    timeline.markers.forEach((marker, index) => {
      if (index === stepIndex) {
        gsap.to(marker.group.scale, {
          x: 1.5,
          y: 1.5,
          z: 1.5,
          duration: 0.3,
          ease: 'back.out'
        });
        marker.sphere.material.emissiveIntensity = 0.8;
      } else {
        gsap.to(marker.group.scale, {
          x: 0.8,
          y: 0.8,
          z: 0.8,
          duration: 0.3
        });
        marker.sphere.material.emissiveIntensity = 0.2;
      }
    });
  }

  destroy() {
    this.scene.remove(this.group);
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  }
}
