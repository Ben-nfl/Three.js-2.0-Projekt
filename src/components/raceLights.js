import * as THREE from 'three';
import { TRACK_RX, TRACK_RZ, TRACK_WIDTH } from './racetrack.js';

const FLOODLIGHT_COLOR = 0xfff5cc;
const FLOODLIGHT_INTENSITY = 80;

export function createRaceLights(scene) {
  // --- Sun (directional light) ---
  const sun = new THREE.DirectionalLight(0xfff5e0, 2.2);
  sun.position.set(40, 50, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 200;
  sun.shadow.camera.left = -70;
  sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 60;
  sun.shadow.camera.bottom = -60;
  sun.shadow.bias = -0.001;
  scene.add(sun);
  scene.add(sun.target); // target stays at origin

  // --- Hemisphere light (sky/ground fill) ---
  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x4a7c2f, 0.9);
  scene.add(hemi);

  // --- Ambient fill ---
  const ambient = new THREE.AmbientLight(0xc8e0ff, 0.4);
  scene.add(ambient);

  // --- Floodlight poles around track (4 positions) ---
  const polePositions = [
    { angle: Math.PI * 0.25, side: 'outer' },
    { angle: Math.PI * 0.75, side: 'outer' },
    { angle: Math.PI * 1.25, side: 'outer' },
    { angle: Math.PI * 1.75, side: 'outer' },
  ];

  const spotlights = [];

  for (const { angle, side } of polePositions) {
    const cos_a = Math.cos(angle);
    const sin_a = Math.sin(angle);
    const tx_raw = -Math.sin(angle) * TRACK_RX;
    const tz_raw = Math.cos(angle) * TRACK_RZ;
    const tLen = Math.sqrt(tx_raw * tx_raw + tz_raw * tz_raw);
    const nx = tz_raw / tLen;
    const nz = -tx_raw / tLen;

    const cx = cos_a * TRACK_RX;
    const cz = sin_a * TRACK_RZ;
    const poleX = cx + nx * (TRACK_WIDTH / 2 + 5);
    const poleZ = cz + nz * (TRACK_WIDTH / 2 + 5);
    const poleH = 16;

    // Pole mesh
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, poleH, 8),
      new THREE.MeshLambertMaterial({ color: 0x888888 })
    );
    pole.position.set(poleX, poleH / 2, poleZ);
    pole.castShadow = true;
    scene.add(pole);

    // Lamp head
    const lampHead = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.5, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    lampHead.position.set(poleX, poleH + 0.25, poleZ);
    scene.add(lampHead);

    // Emissive lamp surface (glow effect)
    const lampGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 0.4),
      new THREE.MeshStandardMaterial({
        color: 0xfff5cc,
        emissive: 0xfff5cc,
        emissiveIntensity: 2.0,
      })
    );
    lampGlow.position.set(poleX, poleH + 0.1, poleZ);
    lampGlow.rotation.x = Math.PI / 2;
    scene.add(lampGlow);

    // SpotLight pointing at track center
    const spot = new THREE.SpotLight(FLOODLIGHT_COLOR, FLOODLIGHT_INTENSITY, 60, Math.PI / 5, 0.4, 1);
    spot.position.set(poleX, poleH, poleZ);
    spot.target.position.set(cx, 0, cz);
    spot.castShadow = true;
    spot.shadow.mapSize.set(512, 512);
    spot.shadow.bias = -0.002;
    scene.add(spot);
    scene.add(spot.target);
    spotlights.push(spot);
  }

  return { sun, hemi, ambient, spotlights };
}
