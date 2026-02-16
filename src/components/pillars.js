import * as THREE from 'three';
import { ROOM_SIZE, WALL_HEIGHT } from './dungeon.js';

export function createPillars(scene, materials) {
  const pillars = [];
  const pillarRadius = 0.35;
  const pillarHeight = WALL_HEIGHT - 0.5;

  // CylinderGeometry #3 - stone pillars
  const pillarGeo = new THREE.CylinderGeometry(
    pillarRadius, pillarRadius * 1.15, pillarHeight, 12
  );

  // TorusGeometry #4 - capital rings
  const ringGeo = new THREE.TorusGeometry(pillarRadius * 1.3, 0.08, 8, 24);

  const offset = ROOM_SIZE / 2 - 1.5;
  const positions = [
    [-offset, 0, -offset],
    [offset, 0, -offset],
    [-offset, 0, offset],
    [offset, 0, offset],
  ];

  positions.forEach((pos) => {
    const pillar = new THREE.Mesh(pillarGeo, materials.stone);
    pillar.position.set(pos[0], pillarHeight / 2, pos[2]);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    scene.add(pillar);

    // Capital ring at the top
    const ring = new THREE.Mesh(ringGeo, materials.stone);
    ring.position.set(pos[0], pillarHeight - 0.1, pos[2]);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Base ring at the bottom
    const baseRing = new THREE.Mesh(ringGeo, materials.stone);
    baseRing.position.set(pos[0], 0.1, pos[2]);
    baseRing.rotation.x = Math.PI / 2;
    scene.add(baseRing);

    pillars.push(pillar);
  });

  return pillars;
}
