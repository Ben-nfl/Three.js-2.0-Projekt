import * as THREE from 'three';
import { ROOM_SIZE } from './dungeon.js';

// Prozeduralen Glow-Sprite-Textur erzeugen
function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, 'rgba(255, 150, 50, 0.6)');
  gradient.addColorStop(0.3, 'rgba(255, 100, 20, 0.25)');
  gradient.addColorStop(0.7, 'rgba(255, 60, 0, 0.05)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createTorches(scene, materials) {
  const torches = [];
  const glowTexture = createGlowTexture();

  // CylinderGeometry #11 - torch handles
  const handleGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.6, 8);

  // ConeGeometry #10 - flame shapes
  const flameGeo = new THREE.ConeGeometry(0.12, 0.35, 8);

  const torchPositions = [
    { pos: [-ROOM_SIZE / 2 + 0.15, 2.8, -2], rotZ: 0.3 },   // Left wall
    { pos: [ROOM_SIZE / 2 - 0.15, 2.8, -2], rotZ: -0.3 },    // Right wall
    { pos: [0, 2.8, -ROOM_SIZE / 2 + 0.15], rotZ: 0 },       // Back wall
  ];

  torchPositions.forEach((t, index) => {
    const torchGroup = new THREE.Group();

    // Handle
    const handle = new THREE.Mesh(handleGeo, materials.wood);
    handle.castShadow = true;
    torchGroup.add(handle);

    // Flame
    const flame = new THREE.Mesh(flameGeo, materials.torchFire);
    flame.position.y = 0.45;
    torchGroup.add(flame);

    // Emissive Glow Sprite (Billboard)
    const glowMat = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xFF8833,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMat);
    glow.position.y = 0.45;
    glow.scale.set(1.5, 1.5, 1);
    torchGroup.add(glow);

    torchGroup.position.set(t.pos[0], t.pos[1], t.pos[2]);
    torchGroup.rotation.z = t.rotZ;

    scene.add(torchGroup);

    torches.push({
      group: torchGroup,
      flame,
      glow,
      index,
      baseY: t.pos[1],
    });
  });

  return torches;
}

export function updateTorchFlicker(torches, time, params) {
  const speed = params.flickerSpeed || 1.0;
  const amount = params.flickerAmount || 1.0;

  torches.forEach((torch) => {
    const t = time * speed;
    const offset = torch.index * 2.1;

    // Overlapping sine waves at different frequencies + pseudo-random noise
    const flicker =
      Math.sin(t * 8 + offset) * 0.15 +
      Math.sin(t * 13.7 + offset * 1.3) * 0.1 +
      Math.sin(t * 23.1 + offset * 0.7) * 0.05 +
      (Math.sin(t * 47 + offset * 3.1) * 0.5 + 0.5) * 0.08;

    // Scale flame to flicker
    const scaleY = 1.0 + flicker * amount;
    const scaleXZ = 1.0 + flicker * amount * 0.3;
    torch.flame.scale.set(scaleXZ, scaleY, scaleXZ);

    // Slight random sway
    torch.flame.rotation.x = Math.sin(t * 5 + offset) * 0.1 * amount;
    torch.flame.rotation.z = Math.cos(t * 4.3 + offset) * 0.08 * amount;

    // Glow sprite pulsieren
    if (torch.glow) {
      const glowScale = 1.3 + flicker * amount * 0.8;
      torch.glow.scale.set(glowScale, glowScale, 1);
      torch.glow.material.opacity = 0.5 + flicker * amount * 0.3;
    }
  });
}
