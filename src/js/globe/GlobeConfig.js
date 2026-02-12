/**
 * Globe Configuration
 * Constants and mobile/desktop configs for the 3D globe visualization
 */

// Check if device is mobile
const isMobile = () => window.innerWidth < 768;

// Globe geometry
export const GLOBE_CONFIG = {
  // Globe radius
  radius: 1,

  // Latitude/longitude grid lines
  get latLines() { return isMobile() ? 8 : 12; },
  get lonLines() { return isMobile() ? 16 : 24; },

  // Line segments for smooth curves
  segments: 64,

  // Colors - Black/gray wireframe
  globeColor: 0x2D3748,
  globeOpacity: 0.5, // Slightly more visible

  // Connection arc color (sender purple)
  arcColor: 0xA855F7,
  arcOpacity: 0.8,

  // Central node glow color (purple)
  centralGlowColor: 0x8B5CF6,
};

// Camera settings
export const CAMERA_CONFIG = {
  fov: 45,
  near: 0.1,
  far: 100,
  position: { x: 0, y: 0, z: 4 }, // Zoomed out more
};

// Animation settings
export const ANIMATION_CONFIG = {
  // Auto-rotation speed (radians per second)
  autoRotateSpeed: 0.05,

  // Resume auto-rotate after this many ms of inactivity
  autoResumeDelay: 3000,

  // Drag sensitivity
  dragSensitivity: 0.005,

  // Arc dash animation speed
  dashAnimationSpeed: 0.01,
};

// Package node positions (lat, lon in degrees, depth modifier)
export const NODE_POSITIONS = [
  { lat: 45, lon: -75, depth: 0.15, label: 'Toronto', isCenter: true },   // Central node
  { lat: 51, lon: -114, depth: 0.1, label: 'Calgary' },
  { lat: 49, lon: -123, depth: 0.12, label: 'Vancouver' },
  { lat: 40, lon: -74, depth: 0.08, label: 'New York' },
  { lat: 14, lon: 121, depth: 0.1, label: 'Manila' },
  { lat: 35, lon: 139, depth: 0.12, label: 'Tokyo' },
  { lat: 51, lon: 0, depth: 0.08, label: 'London' },
  { lat: -34, lon: 151, depth: 0.1, label: 'Sydney' },
];

// Connection pairs (indices into NODE_POSITIONS)
export const CONNECTIONS = [
  [0, 1], // Toronto - Calgary
  [0, 2], // Toronto - Vancouver
  [0, 3], // Toronto - New York
  [0, 4], // Toronto - Manila
  [1, 2], // Calgary - Vancouver
  [3, 6], // New York - London
  [4, 5], // Manila - Tokyo
];

// Responsive container sizing
export const CONTAINER_CONFIG = {
  maxWidth: {
    mobile: '100%',
    desktop: '500px',
    lg: '550px',
  },
  height: {
    mobile: '350px',
    desktop: '400px',
    lg: '500px',
  },
};

// Convert lat/lon to 3D coordinates on sphere
export function latLonToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}
