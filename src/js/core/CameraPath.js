/**
 * CameraPath - Spline-based camera movement system
 * Camera follows a 3D path based on scroll progress
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class CameraPath {
  constructor(camera, options = {}) {
    this.camera = camera;
    this.progress = 0;
    this.targetProgress = 0;
    
    // Smoothing factor for camera movement (lower = smoother)
    this.smoothness = options.smoothness || 0.02;
    
    // Look-at target
    this.lookAtTarget = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);
    
    // Camera shake
    this.shakeIntensity = 0;
    this.shakeDecay = 0.95;
    
    // Create the camera path
    this.createPath();
    
    // Create look-at path (where camera looks)
    this.createLookAtPath();
  }

  createPath() {
    // Camera follows airplane from behind
    // These points mirror the airplane's path but offset behind it
    // Airplane path: z = 20 - t * 200, so camera is at z + 30 (behind)
    
    this.useChaseCamera = true;
    
    // Fallback path (not used when chase camera is active)
    const points = [
      new THREE.Vector3(0, 25, 50),
      new THREE.Vector3(0, 30, 30),
      new THREE.Vector3(0, 35, 0),
      new THREE.Vector3(0, 35, -50),
      new THREE.Vector3(0, 30, -100),
      new THREE.Vector3(0, 25, -150)
    ];

    this.path = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    this.pathFrames = this.path.computeFrenetFrames(100, false);
  }

  createLookAtPath() {
    // Look at points ahead of camera (where airplane is)
    const lookAtPoints = [
      new THREE.Vector3(0, 20, 0),
      new THREE.Vector3(0, 25, -20),
      new THREE.Vector3(0, 30, -50),
      new THREE.Vector3(0, 30, -100),
      new THREE.Vector3(0, 25, -150),
      new THREE.Vector3(0, 20, -200)
    ];

    this.lookAtPath = new THREE.CatmullRomCurve3(lookAtPoints, false, 'centripetal', 0.5);
  }
  
  // Set reference to airplane for chase camera
  setAirplane(airplane) {
    this.airplane = airplane;
  }

  // FOV changes for dramatic effect
  getFOV(progress) {
    // Start wide, get narrower during action, wide again at end
    const baseFOV = 60;
    
    if (progress < 0.1) {
      // Intro - wide establishing shot
      return baseFOV + 10;
    } else if (progress < 0.4) {
      // Sender section - normal
      return baseFOV;
    } else if (progress > 0.5 && progress < 0.8) {
      // Airplane chase - slightly narrow for speed feel
      return baseFOV - 5 + Math.sin(progress * Math.PI * 4) * 3;
    } else {
      // Ending - wide
      return baseFOV + 5;
    }
  }

  update(progress, deltaTime) {
    this.targetProgress = progress;
    
    // Smooth interpolation
    this.progress += (this.targetProgress - this.progress) * this.smoothness;
    
    let position, lookAt;
    
    if (this.useChaseCamera && this.airplane) {
      // Chase camera - follow airplane from behind, CLOSER
      const airplanePos = this.airplane.getPosition();
      
      // Camera positioned close behind and slightly above the airplane
      const cameraOffset = new THREE.Vector3(
        Math.sin(this.progress * Math.PI * 2) * 3,  // Gentle horizontal sway
        5 + Math.sin(this.progress * Math.PI) * 2,   // Height offset (closer)
        18  // Much closer behind airplane
      );
      
      position = new THREE.Vector3(
        airplanePos.x + cameraOffset.x,
        airplanePos.y + cameraOffset.y,
        airplanePos.z + cameraOffset.z
      );
      
      // Look at the airplane (not ahead of it)
      lookAt = new THREE.Vector3(
        airplanePos.x,
        airplanePos.y + 1,
        airplanePos.z - 5  // Just slightly ahead
      );
    } else {
      // Fallback to path-based camera
      position = this.path.getPointAt(this.progress);
      lookAt = this.lookAtPath.getPointAt(this.progress);
    }
    
    // Apply camera shake if any
    if (this.shakeIntensity > 0.001) {
      position.x += (Math.random() - 0.5) * this.shakeIntensity;
      position.y += (Math.random() - 0.5) * this.shakeIntensity;
      position.z += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= this.shakeDecay;
    }
    
    // Very smooth camera movement with easing
    // Use smaller lerp value for silky smooth motion
    this.camera.position.lerp(position, 0.02);
    
    // Very smooth look-at transition
    this.currentLookAt.lerp(lookAt, 0.02);
    this.camera.lookAt(this.currentLookAt);
    
    // Update FOV
    const targetFOV = this.getFOV(this.progress);
    this.camera.fov += (targetFOV - this.camera.fov) * 0.02;
    this.camera.updateProjectionMatrix();
  }

  shake(intensity = 0.5) {
    this.shakeIntensity = intensity;
  }

  // Get camera forward direction for effects
  getDirection() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }

  // Debug visualization
  createDebugVisualization(scene) {
    // Path line
    const points = this.path.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    // Look-at path
    const lookAtPoints = this.lookAtPath.getPoints(100);
    const lookAtGeometry = new THREE.BufferGeometry().setFromPoints(lookAtPoints);
    const lookAtMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const lookAtLine = new THREE.Line(lookAtGeometry, lookAtMaterial);
    scene.add(lookAtLine);

    return { pathLine: line, lookAtLine };
  }
}
