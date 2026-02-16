import * as THREE from 'three';
import { ROOM_SIZE, WALL_HEIGHT } from './dungeon.js';

const PARTICLE_COUNT = 300;

export function createParticles(scene) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * ROOM_SIZE * 0.8;
    positions[i3 + 1] = Math.random() * WALL_HEIGHT;
    positions[i3 + 2] = (Math.random() - 0.5) * ROOM_SIZE * 0.8;

    velocities[i3] = (Math.random() - 0.5) * 0.002;
    velocities[i3 + 1] = Math.random() * 0.003 + 0.001;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;

    // Individuelle Größen (0.02 - 0.08)
    sizes[i] = 0.02 + Math.random() * 0.06;

    // Individuelle Farben (warm orange bis blasses gelb)
    const warmth = Math.random();
    colors[i3] = 0.9 + warmth * 0.1;          // R
    colors[i3 + 1] = 0.6 + warmth * 0.3;      // G
    colors[i3 + 2] = 0.3 + warmth * 0.2;      // B
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  return { particles, velocities, sizes };
}

export function updateParticles(particleData, time, enabled) {
  if (!enabled) {
    particleData.particles.visible = false;
    return;
  }
  particleData.particles.visible = true;

  const positions = particleData.particles.geometry.attributes.position.array;
  const sizeAttr = particleData.particles.geometry.attributes.size;
  const vel = particleData.velocities;
  const baseSizes = particleData.sizes;
  const halfRoom = ROOM_SIZE * 0.4;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    // Drift mit Sinus-Wellenbewegung
    positions[i3] += vel[i3] + Math.sin(time * 0.5 + i) * 0.0005;
    positions[i3 + 1] += vel[i3 + 1];
    positions[i3 + 2] += vel[i3 + 2] + Math.cos(time * 0.4 + i) * 0.0005;

    // Größen-Pulsieren (leichtes Flimmern)
    sizeAttr.array[i] = baseSizes[i] * (0.8 + Math.sin(time * 2 + i * 0.7) * 0.3);

    // Wrap um den Raum
    if (positions[i3 + 1] > WALL_HEIGHT) {
      positions[i3 + 1] = 0;
      positions[i3] = (Math.random() - 0.5) * ROOM_SIZE * 0.8;
      positions[i3 + 2] = (Math.random() - 0.5) * ROOM_SIZE * 0.8;
    }
    if (Math.abs(positions[i3]) > halfRoom) positions[i3] *= -0.9;
    if (Math.abs(positions[i3 + 2]) > halfRoom) positions[i3 + 2] *= -0.9;
  }

  particleData.particles.geometry.attributes.position.needsUpdate = true;
  sizeAttr.needsUpdate = true;
}
