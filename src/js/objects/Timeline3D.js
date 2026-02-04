/**
 * Timeline3D - 3D floating card panels in the airplane's flight path
 * Creates immersive cards that the airplane flies through
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class Timeline3D {
  constructor(scene, settings) {
    this.scene = scene;
    this.settings = settings;
    this.group = new THREE.Group();
    
    this.senderCards = [];
    this.carrierCards = [];
    this.currentProgress = 0;
    this.isInitialized = false;
    
    this.create();
    scene.add(this.group);
    
    // Ensure all cards are hidden on initial load
    // This prevents any flash before the first update() call
    this.hideAllCards();
  }
  
  hideAllCards() {
    [...this.senderCards, ...this.carrierCards].forEach(card => {
      card.group.visible = false;
      // Also hide materials to prevent any potential rendering
      card.cardMesh.material.opacity = 0;
      card.border.material.opacity = 0;
      card.glow.material.opacity = 0;
      card.content.material.opacity = 0;
    });
  }

  create() {
    // Sender cards - on RIGHT side, LARGE SPACING between cards (80 units)
    this.senderCards = this.createCardSet('sender', [
      {
        position: new THREE.Vector3(16, 22, -40),    // Right side
        rotation: new THREE.Euler(0, -0.35, 0),      // Facing camera/flight path
        number: '01',
        title: 'Create Your Package Request',
        description: 'List what you need delivered with photos, dimensions, and dates.',
        tags: ['Easy Listing', 'Photo Upload', 'Flexible Dates'],
        color: 0xF56565
      },
      {
        position: new THREE.Vector3(18, 30, -120),   // Right side - 80 units deeper
        rotation: new THREE.Euler(0, -0.35, 0),
        number: '02',
        title: 'Find the Perfect Carrier',
        description: 'Browse verified travelers heading your way.',
        tags: ['Verified Travelers', 'Real Reviews', 'Route Matching'],
        color: 0xF56565
      },
      {
        position: new THREE.Vector3(16, 38, -200),   // Right side - 80 units deeper
        rotation: new THREE.Euler(0, -0.35, 0),
        number: '03',
        title: 'Secure & Pay',
        description: 'Book your carrier with escrow protection.',
        tags: ['Escrow Protection', 'Secure Payment', 'Money-Back Guarantee'],
        color: 0xF56565
      },
      {
        position: new THREE.Vector3(18, 46, -280),   // Right side - 80 units deeper
        rotation: new THREE.Euler(0, -0.35, 0),
        number: '04',
        title: 'Track & Receive',
        description: 'Follow your package in real-time.',
        tags: ['Live GPS Tracking', 'Delivery Code', 'Rate & Review'],
        color: 0xF56565
      }
    ]);

    // Carrier cards - on LEFT side, LARGE SPACING (80 units)
    this.carrierCards = this.createCardSet('carrier', [
      {
        position: new THREE.Vector3(-16, 54, -380), // Left side - starts after sender cards
        rotation: new THREE.Euler(0, 0.35, 0),       // Facing camera/flight path
        number: '01',
        title: 'Post Your Trip',
        description: 'Share your travel plans and available space.',
        tags: ['Quick Setup', 'Set Your Price', 'Any Destination'],
        color: 0x38B2AC
      },
      {
        position: new THREE.Vector3(-18, 62, -460), // Left side - 80 units deeper
        rotation: new THREE.Euler(0, 0.35, 0),
        number: '02',
        title: 'Browse & Accept Packages',
        description: 'Review and accept packages that fit your schedule.',
        tags: ['You Choose', 'No Obligations', 'See Details First'],
        color: 0x38B2AC
      },
      {
        position: new THREE.Vector3(-16, 70, -540), // Left side - 80 units deeper
        rotation: new THREE.Euler(0, 0.35, 0),
        number: '03',
        title: 'Pick Up the Package',
        description: 'Meet the sender and verify contents.',
        tags: ['Easy Meetup', 'Package Verification', 'In-App Chat'],
        color: 0x38B2AC
      },
      {
        position: new THREE.Vector3(-18, 78, -620), // Left side - 80 units deeper
        rotation: new THREE.Euler(0, 0.35, 0),
        number: '04',
        title: 'Deliver & Get Paid',
        description: 'Complete delivery and receive instant payment.',
        tags: ['Instant Payout', 'Build Reputation', 'Earn Reviews'],
        color: 0x38B2AC
      }
    ]);
  }

  createCardSet(type, cardsData) {
    const cards = [];
    
    cardsData.forEach((data, index) => {
      const card = this.create3DCard(data, index);
      cards.push(card);
      this.group.add(card.group);
    });
    
    return cards;
  }

  create3DCard(data, index) {
    const group = new THREE.Group();
    group.position.copy(data.position);
    group.rotation.copy(data.rotation);
    
    // Card dimensions
    const cardWidth = 10;
    const cardHeight = 7;
    
    // Create glass-like card panel
    const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
    const cardMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      side: THREE.DoubleSide
    });
    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    group.add(cardMesh);
    
    // Glowing border
    const borderGeometry = new THREE.EdgesGeometry(cardGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.8
    });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    border.position.z = 0.01;
    group.add(border);
    
    // Create content texture
    const contentTexture = this.createCardTexture(data);
    const contentGeometry = new THREE.PlaneGeometry(cardWidth * 0.9, cardHeight * 0.9);
    const contentMaterial = new THREE.MeshBasicMaterial({
      map: contentTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const content = new THREE.Mesh(contentGeometry, contentMaterial);
    content.position.z = 0.05;
    group.add(content);
    
    // Number badge (floating)
    const badge = this.createNumberBadge(data.number, data.color);
    badge.position.set(-cardWidth/2 + 0.8, cardHeight/2 - 0.8, 0.2);
    group.add(badge);
    
    // Add glow effect behind card
    const glowGeometry = new THREE.PlaneGeometry(cardWidth + 1, cardHeight + 1);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = -0.1;
    group.add(glow);
    
    // Store reference data
    group.userData = {
      type: data.color === 0xF56565 ? 'sender' : 'carrier',
      index,
      originalPosition: data.position.clone(),
      originalRotation: data.rotation.clone(),
      color: data.color,
      cardMesh,
      border,
      glow,
      content
    };
    
    // Start hidden - will be shown when in scroll range
    group.visible = false;
    
    return {
      group,
      data,
      cardMesh,
      border,
      glow,
      content
    };
  }

  createCardTexture(data) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // Higher resolution for sharper text
    canvas.width = 1024;
    canvas.height = 720;
    
    // Clear with transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Title - larger for high res
    ctx.font = 'bold 72px Space Grotesk, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(data.title, 60, 120);
    
    // Description - larger for high res
    ctx.font = '44px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.wrapText(ctx, data.description, 60, 220, canvas.width - 120, 55);
    
    // Tags - larger for high res
    const colorHex = '#' + data.color.toString(16).padStart(6, '0');
    ctx.font = '32px Inter, Arial, sans-serif';
    let tagX = 60;
    let tagY = 400;
    
    data.tags.forEach(tag => {
      const tagWidth = ctx.measureText(tag).width + 48;
      
      // Check if tag fits on current line
      if (tagX + tagWidth > canvas.width - 60) {
        tagX = 60;
        tagY += 70;
      }
      
      // Tag background
      ctx.fillStyle = colorHex + '33'; // 20% opacity
      this.roundRect(ctx, tagX, tagY, tagWidth, 50, 25);
      ctx.fill();
      
      // Tag border
      ctx.strokeStyle = colorHex + '88';
      ctx.lineWidth = 2;
      this.roundRect(ctx, tagX, tagY, tagWidth, 50, 25);
      ctx.stroke();
      
      // Tag text
      ctx.fillStyle = colorHex;
      ctx.fillText(tag, tagX + 24, tagY + 35);
      
      tagX += tagWidth + 20;
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16;  // Sharper at angles
    return texture;
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  createNumberBadge(number, color) {
    const group = new THREE.Group();
    
    // Badge background (circle)
    const circleGeometry = new THREE.CircleGeometry(0.6, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    group.add(circle);
    
    // Number text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;
    
    ctx.font = 'bold 40px Space Grotesk, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(number, 32, 34);
    
    const texture = new THREE.CanvasTexture(canvas);
    const numberGeometry = new THREE.PlaneGeometry(1, 1);
    const numberMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });
    const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
    numberMesh.position.z = 0.01;
    group.add(numberMesh);
    
    // Pulse ring
    const ringGeometry = new THREE.RingGeometry(0.65, 0.75, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.userData.isPulseRing = true;
    group.add(ring);
    
    return group;
  }

  update(progress, camera) {
    this.currentProgress = progress;
    const time = performance.now() * 0.001;
    
    // Mark as initialized after first update
    this.isInitialized = true;
    
    // Use SCROLL PROGRESS to control card visibility (not camera distance)
    // This ensures cards are COMPLETELY GONE before HTML sections appear at 88%
    
    // Sender cards: visible from 5% to 38% progress (each card ~8%)
    const senderStart = 0.05;
    const senderEnd = 0.38;
    const senderCardDuration = (senderEnd - senderStart) / this.senderCards.length;
    
    this.senderCards.forEach((card, index) => {
      const cardStart = senderStart + index * senderCardDuration;
      const cardEnd = cardStart + senderCardDuration;
      this.updateCardByProgress(card, progress, cardStart, cardEnd, time);
    });
    
    // Carrier cards: visible from 42% to 80% progress (each card ~9.5%)
    // Must end at 80% so they're fully gone by ~83% (with fade out)
    const carrierStart = 0.42;
    const carrierEnd = 0.80;
    const carrierCardDuration = (carrierEnd - carrierStart) / this.carrierCards.length;
    
    this.carrierCards.forEach((card, index) => {
      const cardStart = carrierStart + index * carrierCardDuration;
      const cardEnd = cardStart + carrierCardDuration;
      this.updateCardByProgress(card, progress, cardStart, cardEnd, time);
    });
  }

  updateCardByProgress(card, progress, cardStart, cardEnd, time) {
    const userData = card.group.userData;
    
    // Cards FADE IN only, then STAY VISIBLE (no fade out)
    // They disappear instantly when far past the camera
    const fadeInDuration = 0.03;   // 3% of scroll to fade in
    
    let opacity = 0;
    let isVisible = false;
    
    if (progress < cardStart - fadeInDuration) {
      // Not yet visible
      opacity = 0;
      isVisible = false;
    } else if (progress < cardStart) {
      // Fading in
      opacity = (progress - (cardStart - fadeInDuration)) / fadeInDuration;
      isVisible = true;
    } else if (progress <= cardEnd + 0.05) {
      // Fully visible - stays at full opacity even a bit past cardEnd
      opacity = 1;
      isVisible = true;
    } else {
      // Past the card - hide it (no fade, just gone)
      opacity = 0;
      isVisible = false;
    }
    
    opacity = Math.max(0, Math.min(1, opacity));
    
    // Set visibility
    card.group.visible = isVisible;
    
    if (!card.group.visible) return;
    
    // Calculate if this card is "active" (currently the focus card)
    const isActive = progress >= cardStart && progress <= cardEnd;
    
    // Apply opacity to materials - cards stay at full opacity once visible
    card.cardMesh.material.opacity = 0.85 * opacity;
    card.border.material.opacity = 0.8 * opacity;
    card.glow.material.opacity = (isActive ? 0.25 : 0.1) * opacity;
    card.content.material.opacity = opacity;
    
    // Scale - cards grow slightly when active
    const scale = isActive ? 1.05 : 0.95;
    card.group.scale.setScalar(scale);
    
    // Floating animation
    const floatY = Math.sin(time * 1.2 + userData.index * 0.5) * 0.4;
    const floatX = Math.cos(time * 1.0 + userData.index * 0.7) * 0.2;
    
    card.group.position.y = userData.originalPosition.y + floatY;
    card.group.position.x = userData.originalPosition.x + floatX;
    
    // Subtle rotation wobble
    card.group.rotation.y = userData.originalRotation.y + Math.sin(time * 0.6 + userData.index) * 0.03;
    
    // Pulse ring animation on badge
    card.group.traverse(child => {
      if (child.userData && child.userData.isPulseRing) {
        const pulseScale = 1 + Math.sin(time * 2.5) * 0.15;
        child.scale.setScalar(pulseScale);
        child.material.opacity = (0.3 + Math.sin(time * 2.5) * 0.2) * opacity;
      }
    });
    
    // Border glow intensity when active
    if (isActive) {
      card.border.material.opacity = (0.8 + Math.sin(time * 3) * 0.2) * opacity;
    }
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
