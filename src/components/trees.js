import * as THREE from 'three';
import { TRACK_RX, TRACK_RZ, TRACK_WIDTH } from './racetrack.js';

const SEGMENTS = 120;

const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3a1e });
const leafMat1 = new THREE.MeshLambertMaterial({ color: 0x2a7a1e });
const leafMat2 = new THREE.MeshLambertMaterial({ color: 0x1e5c14 });

function createTree(scene, x, z, height, radius) {
  const trunkH = height * 0.3;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.28, trunkH, 7),
    trunkMat
  );
  trunk.position.set(x, trunkH / 2, z);
  trunk.castShadow = true;
  scene.add(trunk);

  // Lower cone
  const cone1 = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height * 0.65, 7),
    leafMat1
  );
  cone1.position.set(x, trunkH + height * 0.3, z);
  cone1.castShadow = true;
  scene.add(cone1);

  // Upper narrower cone
  const cone2 = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 0.65, height * 0.45, 7),
    leafMat2
  );
  cone2.position.set(x, trunkH + height * 0.52, z);
  cone2.castShadow = true;
  scene.add(cone2);
}

export function createTrees(scene) {
  const outerOffset = TRACK_WIDTH / 2 + 3.5;
  const innerOffset = TRACK_WIDTH / 2 + 3.0;

  for (let i = 0; i < SEGMENTS; i += 2) {
    const t = (i / SEGMENTS) * Math.PI * 2;
    const cos_t = Math.cos(t);
    const sin_t = Math.sin(t);

    const cx = cos_t * TRACK_RX;
    const cz = sin_t * TRACK_RZ;

    const tx_raw = -sin_t * TRACK_RX;
    const tz_raw = cos_t * TRACK_RZ;
    const tLen = Math.sqrt(tx_raw * tx_raw + tz_raw * tz_raw);
    const tnx = tx_raw / tLen;
    const tnz = tz_raw / tLen;
    const nx = tnz;
    const nz = -tnx;

    // Outer trees – skip grandstand area (t near 0)
    const nearStart = Math.abs(Math.cos(t)) > 0.85 && Math.sin(t) > -0.1 && Math.sin(t) < 0.4;
    if (!nearStart) {
      const spreadOuter = outerOffset + (Math.sin(i * 7.3) * 0.5 + 0.5) * 4;
      const h = 4.5 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 3;
      const r = 1.2 + (Math.sin(i * 2.1) * 0.5 + 0.5) * 0.6;
      createTree(scene, cx + nx * spreadOuter, cz + nz * spreadOuter, h, r);
    }

    // Inner trees (infield)
    if (i % 4 === 0) {
      const spreadInner = innerOffset + (Math.sin(i * 5.1) * 0.5 + 0.5) * 2;
      const ix = cx - nx * spreadInner;
      const iz = cz - nz * spreadInner;
      // Only if clearly inside the oval (avoid clipping the track)
      const normalizedX = ix / (TRACK_RX - TRACK_WIDTH);
      const normalizedZ = iz / (TRACK_RZ - TRACK_WIDTH);
      if (normalizedX * normalizedX + normalizedZ * normalizedZ < 0.85) {
        const h = 3.5 + (Math.sin(i * 4.3) * 0.5 + 0.5) * 2.5;
        const r = 1.0 + (Math.sin(i * 1.9) * 0.5 + 0.5) * 0.5;
        createTree(scene, ix, iz, h, r);
      }
    }
  }

  // Extra trees deep in the infield
  const infieldPositions = [
    [0, 0], [4, 3], [-5, 2], [3, -4], [-3, -5],
    [6, -2], [-6, 4], [0, 6], [0, -6],
  ];
  for (const [px, pz] of infieldPositions) {
    const h = 4 + Math.abs(Math.sin(px + pz)) * 3;
    const r = 1.1 + Math.abs(Math.cos(px * pz)) * 0.5;
    createTree(scene, px, pz, h, r);
  }

  // Extra trees far outside (background forest feel)
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2;
    const dist = TRACK_RX + TRACK_WIDTH / 2 + 12 + Math.sin(i * 3.7) * 5;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist * (TRACK_RZ / TRACK_RX);
    // Skip the grandstand area
    if (Math.abs(x) > TRACK_RX + 5 && x > 0) continue;
    const h = 5 + Math.abs(Math.sin(i * 2.3)) * 4;
    const r = 1.5 + Math.abs(Math.cos(i * 1.7)) * 0.8;
    createTree(scene, x, z, h, r);
  }
}
