/**
 * Device Detection and Capability Tiers
 * Determines rendering quality based on device capabilities
 */

export class DeviceDetect {
  constructor() {
    this.isMobile = this.detectMobile();
    this.isTouch = this.detectTouch();
    this.tier = this.detectTier();
    this.pixelRatio = Math.min(window.devicePixelRatio, this.tier === 'high' ? 2 : 1.5);
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768;
  }

  detectTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  detectTier() {
    // Check for WebGL2 support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) return 'low';

    // Check GPU info if available
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let renderer = '';
    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
    }

    // Check for known low-performance GPUs
    const lowEndGPUs = ['intel', 'mali-4', 'mali-t', 'adreno 3', 'adreno 4', 'powervr'];
    const isLowEnd = lowEndGPUs.some(gpu => renderer.includes(gpu));

    // Mobile devices get lower tier by default
    if (this.isMobile) {
      return isLowEnd ? 'low' : 'medium';
    }

    // Desktop tier detection
    if (isLowEnd) return 'medium';
    
    // Check max texture size as proxy for GPU power
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (maxTextureSize >= 16384) return 'high';
    if (maxTextureSize >= 8192) return 'medium';
    
    return 'low';
  }

  getSettings() {
    const settings = {
      high: {
        cloudCount: 80,
        particleCount: 2000,
        shadowMapSize: 2048,
        enableBloom: true,
        enableDOF: true,
        enableMotionBlur: false,
        antialias: true,
        cloudDetail: 'high'
      },
      medium: {
        cloudCount: 40,
        particleCount: 1000,
        shadowMapSize: 1024,
        enableBloom: true,
        enableDOF: false,
        enableMotionBlur: false,
        antialias: true,
        cloudDetail: 'medium'
      },
      low: {
        cloudCount: 20,
        particleCount: 500,
        shadowMapSize: 512,
        enableBloom: false,
        enableDOF: false,
        enableMotionBlur: false,
        antialias: false,
        cloudDetail: 'low'
      }
    };

    return settings[this.tier];
  }
}

export const device = new DeviceDetect();
