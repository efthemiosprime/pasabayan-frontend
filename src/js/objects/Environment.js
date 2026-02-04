/**
 * Environment - Sky, particles, and atmospheric elements
 */

import * as THREE from 'three';

export class Environment {
  constructor(scene, settings) {
    this.scene = scene;
    this.settings = settings;
    this.group = new THREE.Group();
    this.particles = null;
    this.time = 0;
    
    this.create();
    scene.add(this.group);
  }

  create() {
    this.createSkyDome();
    this.createParticles();
    this.createSunFlare();
    this.createDistantElements();
  }

  createSkyDome() {
    // Gradient sky sphere
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    
    // Custom shader for gradient sky
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0044aa) },
        bottomColor: { value: new THREE.Color(0x89CFF0) },
        horizonColor: { value: new THREE.Color(0xffd4a3) },
        offset: { value: 20 },
        exponent: { value: 0.6 },
        sunPosition: { value: new THREE.Vector3(100, 50, -100) },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 horizonColor;
        uniform float offset;
        uniform float exponent;
        uniform vec3 sunPosition;
        uniform float time;
        
        varying vec3 vWorldPosition;
        
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          
          // Main gradient
          vec3 color;
          if (h > 0.0) {
            color = mix(horizonColor, topColor, pow(h, exponent));
          } else {
            color = mix(horizonColor, bottomColor, pow(-h, exponent * 0.5));
          }
          
          // Sun glow
          vec3 sunDir = normalize(sunPosition);
          vec3 viewDir = normalize(vWorldPosition);
          float sunDot = dot(viewDir, sunDir);
          
          if (sunDot > 0.9) {
            float sunIntensity = pow((sunDot - 0.9) / 0.1, 2.0);
            color = mix(color, vec3(1.0, 0.95, 0.8), sunIntensity * 0.5);
          }
          
          // Atmospheric scattering near horizon
          float horizonFactor = 1.0 - abs(h);
          horizonFactor = pow(horizonFactor, 3.0);
          color = mix(color, horizonColor, horizonFactor * 0.3);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false
    });
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.skyMaterial = skyMaterial;
    this.group.add(sky);
  }

  createParticles() {
    const particleCount = this.settings.particleCount || 1000;
    
    // Geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Position - distributed in viewing area
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      
      // Color - soft whites and blues
      const colorChoice = Math.random();
      if (colorChoice < 0.7) {
        // White/light particles (dust, sparkles)
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.95 + Math.random() * 0.05;
      } else {
        // Golden particles (sun dust)
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.2;
      }
      
      // Size
      sizes[i] = 0.1 + Math.random() * 0.3;
      
      // Velocity for animation
      velocities[i * 3] = (Math.random() - 0.5) * 0.05;
      velocities[i * 3 + 1] = Math.random() * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    this.particleVelocities = velocities;
    
    // Material with custom shader
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: window.devicePixelRatio }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float pixelRatio;
        
        void main() {
          vColor = color;
          vec3 pos = position;
          
          // Gentle floating motion
          pos.y += sin(time * 0.5 + position.x * 0.1) * 0.5;
          pos.x += sin(time * 0.3 + position.z * 0.1) * 0.3;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Soft circular particle
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          alpha *= 0.6;
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.particleMaterial = material;
    this.group.add(this.particles);
  }

  createSunFlare() {
    // Sun sprite
    const sunGeometry = new THREE.PlaneGeometry(30, 30);
    const sunMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vUv - vec2(0.5);
          float dist = length(center);
          
          // Core glow
          float core = 1.0 - smoothstep(0.0, 0.2, dist);
          
          // Outer glow with rays
          float rays = 0.0;
          float angle = atan(center.y, center.x);
          rays += sin(angle * 8.0 + time) * 0.1;
          rays += sin(angle * 12.0 - time * 0.5) * 0.05;
          
          float outer = (1.0 - smoothstep(0.1, 0.5, dist)) * (0.3 + rays);
          
          float alpha = core + outer;
          vec3 color = vec3(1.0, 0.95, 0.85);
          
          gl_FragColor = vec4(color, alpha * 0.8);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(100, 60, -150);
    sun.lookAt(0, 0, 0);
    this.sun = sun;
    this.sunMaterial = sunMaterial;
    this.group.add(sun);
  }

  createDistantElements() {
    // Distant mountains/terrain for depth
    const mountainMaterial = new THREE.MeshBasicMaterial({
      color: 0x667799,
      transparent: true,
      opacity: 0.3,
      fog: true
    });
    
    // Create simple mountain silhouettes
    for (let i = 0; i < 5; i++) {
      const width = 80 + Math.random() * 60;
      const height = 20 + Math.random() * 30;
      
      const shape = new THREE.Shape();
      shape.moveTo(-width / 2, 0);
      
      // Create mountain peaks
      const peaks = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j <= peaks; j++) {
        const x = -width / 2 + (width / peaks) * j;
        const y = j % 2 === 1 ? height * (0.5 + Math.random() * 0.5) : height * 0.2;
        shape.lineTo(x, y);
      }
      
      shape.lineTo(width / 2, 0);
      shape.lineTo(-width / 2, 0);
      
      const geometry = new THREE.ShapeGeometry(shape);
      const mountain = new THREE.Mesh(geometry, mountainMaterial.clone());
      
      const angle = (i / 5) * Math.PI * 2;
      mountain.position.set(
        Math.cos(angle) * 300,
        -10,
        Math.sin(angle) * 300 - 100
      );
      mountain.rotation.y = -angle + Math.PI;
      mountain.material.opacity = 0.15 + Math.random() * 0.15;
      
      this.group.add(mountain);
    }
  }

  update(progress, time) {
    this.time = time;
    
    // Update particle animation
    if (this.particleMaterial) {
      this.particleMaterial.uniforms.time.value = time;
    }
    
    // Update sun
    if (this.sunMaterial) {
      this.sunMaterial.uniforms.time.value = time;
    }
    
    // Update sky based on progress (time of day effect)
    if (this.skyMaterial) {
      const dayProgress = progress;
      
      // Color transitions
      const topColors = [
        new THREE.Color(0x001133), // Dawn
        new THREE.Color(0x0066cc), // Morning
        new THREE.Color(0x0077ff), // Day
        new THREE.Color(0x0055aa), // Afternoon
        new THREE.Color(0x1a1a44)  // Dusk
      ];
      
      const horizonColors = [
        new THREE.Color(0xff6633), // Dawn
        new THREE.Color(0xffd4a3), // Morning
        new THREE.Color(0xffeedd), // Day
        new THREE.Color(0xffcc88), // Afternoon
        new THREE.Color(0xff7744)  // Dusk
      ];
      
      // Interpolate colors based on progress
      const colorIndex = dayProgress * (topColors.length - 1);
      const lowerIndex = Math.floor(colorIndex);
      const upperIndex = Math.min(lowerIndex + 1, topColors.length - 1);
      const t = colorIndex - lowerIndex;
      
      const topColor = topColors[lowerIndex].clone().lerp(topColors[upperIndex], t);
      const horizonColor = horizonColors[lowerIndex].clone().lerp(horizonColors[upperIndex], t);
      
      this.skyMaterial.uniforms.topColor.value = topColor;
      this.skyMaterial.uniforms.horizonColor.value = horizonColor;
      
      // Sun position based on progress
      const sunAngle = (progress - 0.3) * Math.PI;
      this.skyMaterial.uniforms.sunPosition.value.set(
        Math.cos(sunAngle) * 100,
        Math.sin(sunAngle) * 80 + 30,
        -100
      );
      
      // Update sun mesh position
      if (this.sun) {
        this.sun.position.set(
          Math.cos(sunAngle) * 100,
          Math.sin(sunAngle) * 60 + 40,
          -150
        );
      }
    }
    
    // Particle drift
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length / 3; i++) {
        // Slow drift
        positions[i * 3] += this.particleVelocities[i * 3];
        positions[i * 3 + 1] += this.particleVelocities[i * 3 + 1];
        positions[i * 3 + 2] += this.particleVelocities[i * 3 + 2];
        
        // Wrap around
        if (positions[i * 3] > 100) positions[i * 3] = -100;
        if (positions[i * 3] < -100) positions[i * 3] = 100;
        if (positions[i * 3 + 1] > 60) positions[i * 3 + 1] = 0;
        if (positions[i * 3 + 2] > 100) positions[i * 3 + 2] = -100;
        if (positions[i * 3 + 2] < -100) positions[i * 3 + 2] = 100;
      }
      
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }

  destroy() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
