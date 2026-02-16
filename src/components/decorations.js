import * as THREE from 'three';
import { ROOM_SIZE, WALL_HEIGHT } from './dungeon.js';

// Ketten an der Decke
function createChain(scene, materials, x, z, length) {
  const group = new THREE.Group();
  const linkGeo = new THREE.TorusGeometry(0.06, 0.015, 6, 12);

  for (let i = 0; i < length; i++) {
    const link = new THREE.Mesh(linkGeo, materials.metal);
    link.position.set(0, -i * 0.11, 0);
    // Alternating rotation for chain links
    link.rotation.x = (i % 2 === 0) ? 0 : Math.PI / 2;
    link.castShadow = true;
    group.add(link);
  }

  group.position.set(x, WALL_HEIGHT, z);
  scene.add(group);
  return group;
}

// Spinnweben (Eck-Cobwebs via Linien + transparente Fläche)
function createCobweb(scene, x, y, z, rotY) {
  const group = new THREE.Group();

  const webMat = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Dreieckige Spinnwebe aus Shape
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.8, 0);
  shape.lineTo(0, -0.8);
  shape.closePath();

  const webGeo = new THREE.ShapeGeometry(shape);
  const web = new THREE.Mesh(webGeo, webMat);
  group.add(web);

  // Fäden (Linien)
  const threadMat = new THREE.LineBasicMaterial({
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.15,
  });

  for (let i = 0; i < 5; i++) {
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    const t = (i + 1) / 6;
    points.push(new THREE.Vector3(0.8 * (1 - t), -0.8 * t, 0));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeo, threadMat);
    group.add(line);
  }

  // Querfäden (gebogen)
  for (let j = 1; j <= 3; j++) {
    const points = [];
    const r = j * 0.2;
    for (let k = 0; k <= 8; k++) {
      const angle = (k / 8) * Math.PI / 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * r,
        -Math.sin(angle) * r,
        0
      ));
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeo, threadMat);
    group.add(line);
  }

  group.position.set(x, y, z);
  group.rotation.y = rotY;
  scene.add(group);
  return group;
}

export function createDecorations(scene, materials) {
  const chains = [];

  // Ketten an verschiedenen Decken-Positionen
  chains.push(createChain(scene, materials, -2, -3, 12));
  chains.push(createChain(scene, materials, 3, -4, 8));
  chains.push(createChain(scene, materials, -1, 2, 15));
  chains.push(createChain(scene, materials, 4, 1, 10));

  // Spinnweben in Ecken
  const hs = ROOM_SIZE / 2;
  const cobwebs = [];
  cobwebs.push(createCobweb(scene, -hs + 0.01, WALL_HEIGHT - 0.1, -hs + 0.01, 0));
  cobwebs.push(createCobweb(scene, hs - 0.01, WALL_HEIGHT - 0.1, -hs + 0.01, Math.PI / 2));
  cobwebs.push(createCobweb(scene, -hs + 0.01, WALL_HEIGHT - 0.1, hs - 0.01, -Math.PI / 2));
  cobwebs.push(createCobweb(scene, hs - 0.01, WALL_HEIGHT - 0.1, hs - 0.01, Math.PI));

  // Zusätzliche tiefere Spinnweben
  cobwebs.push(createCobweb(scene, -hs + 0.01, WALL_HEIGHT * 0.6, -2, 0));
  cobwebs.push(createCobweb(scene, hs - 0.01, WALL_HEIGHT * 0.7, 1, Math.PI / 2));

  return { chains, cobwebs };
}
