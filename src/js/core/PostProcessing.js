/**
 * PostProcessing - Visual effects pipeline
 * Bloom, depth of field, color grading
 */

import * as THREE from 'three';
import { 
  EffectComposer, 
  RenderPass, 
  EffectPass,
  BloomEffect,
  DepthOfFieldEffect,
  VignetteEffect,
  ToneMappingEffect,
  SMAAEffect,
  BlendFunction,
  KernelSize
} from 'postprocessing';

export class PostProcessing {
  constructor(renderer, scene, camera, settings) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.settings = settings;
    
    this.composer = null;
    this.effects = {};
    
    this.init();
  }

  init() {
    // Create composer
    this.composer = new EffectComposer(this.renderer, {
      frameBufferType: THREE.HalfFloatType
    });
    
    // Render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Create effects
    const effects = [];
    
    // SMAA for anti-aliasing
    const smaaEffect = new SMAAEffect();
    effects.push(smaaEffect);
    
    // Bloom
    if (this.settings.enableBloom) {
      const bloomEffect = new BloomEffect({
        intensity: 0.5,
        luminanceThreshold: 0.8,
        luminanceSmoothing: 0.3,
        kernelSize: KernelSize.MEDIUM,
        blendFunction: BlendFunction.ADD
      });
      this.effects.bloom = bloomEffect;
      effects.push(bloomEffect);
    }
    
    // Depth of Field
    if (this.settings.enableDOF) {
      const dofEffect = new DepthOfFieldEffect(this.camera, {
        focusDistance: 0.02,
        focalLength: 0.05,
        bokehScale: 3,
        height: 480
      });
      this.effects.dof = dofEffect;
      effects.push(dofEffect);
    }
    
    // Vignette
    const vignetteEffect = new VignetteEffect({
      offset: 0.3,
      darkness: 0.5
    });
    this.effects.vignette = vignetteEffect;
    effects.push(vignetteEffect);
    
    // Tone mapping
    const toneMappingEffect = new ToneMappingEffect({
      mode: THREE.ACESFilmicToneMapping
    });
    effects.push(toneMappingEffect);
    
    // Add all effects in one pass for performance
    const effectPass = new EffectPass(this.camera, ...effects);
    this.composer.addPass(effectPass);
  }

  // Update effects based on scroll progress
  updateWithProgress(progress) {
    // Adjust bloom intensity
    if (this.effects.bloom) {
      // More bloom during dawn/dusk
      const bloomIntensity = progress < 0.2 || progress > 0.8
        ? 0.8
        : 0.4;
      this.effects.bloom.intensity = bloomIntensity;
    }
    
    // Adjust DOF focus based on scene
    if (this.effects.dof) {
      // Focus on packages during sender section, airplane during carrier
      if (progress < 0.4) {
        this.effects.dof.cocMaterial.uniforms.focusDistance.value = 0.015;
      } else {
        this.effects.dof.cocMaterial.uniforms.focusDistance.value = 0.025;
      }
    }
    
    // Vignette intensity
    if (this.effects.vignette) {
      // More vignette during intro and outro
      const vignetteIntensity = (progress < 0.1 || progress > 0.9)
        ? 0.6
        : 0.4;
      this.effects.vignette.uniforms.get('darkness').value = vignetteIntensity;
    }
  }

  setSize(width, height) {
    this.composer.setSize(width, height);
  }

  render(delta) {
    this.composer.render(delta);
  }

  dispose() {
    this.composer.dispose();
  }
}
