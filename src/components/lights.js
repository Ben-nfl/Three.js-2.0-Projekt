import * as THREE from 'three';
import { ROOM_SIZE, WALL_HEIGHT } from './dungeon.js';

export function createLights(scene) {
  // 1. AmbientLight - very dark blue fill
  const ambient = new THREE.AmbientLight(0x1a1a3a, 0.15);
  scene.add(ambient);

  // 2-4. PointLights for torches (warm orange, flickering)
  const torchLight1 = new THREE.PointLight(0xFF8833, 1.5, 10, 1.5);
  torchLight1.position.set(-ROOM_SIZE / 2 + 0.5, 3.2, -2);
  torchLight1.castShadow = true;
  torchLight1.shadow.mapSize.set(512, 512);
  torchLight1.shadow.radius = 4;
  scene.add(torchLight1);

  const torchLight2 = new THREE.PointLight(0xFF8833, 1.5, 10, 1.5);
  torchLight2.position.set(ROOM_SIZE / 2 - 0.5, 3.2, -2);
  torchLight2.castShadow = true;
  torchLight2.shadow.mapSize.set(512, 512);
  torchLight2.shadow.radius = 4;
  scene.add(torchLight2);

  const torchLight3 = new THREE.PointLight(0xCC6622, 1.2, 10, 1.5);
  torchLight3.position.set(0, 3.2, -ROOM_SIZE / 2 + 0.5);
  torchLight3.castShadow = true;
  torchLight3.shadow.mapSize.set(512, 512);
  torchLight3.shadow.radius = 4;
  scene.add(torchLight3);

  // 5. Crystal light - cyan-green, pulsing
  const crystalLight = new THREE.PointLight(0x00FFAA, 1.0, 8, 1.5);
  crystalLight.position.set(0, 2.5, -1);
  scene.add(crystalLight);

  // 6. SpotLight - ceiling crack beam
  const spotLight = new THREE.SpotLight(0xFFEECC, 0.8, 12, Math.PI / 8, 0.5, 1);
  spotLight.position.set(1, WALL_HEIGHT - 0.1, -2);
  spotLight.target.position.set(1, 0, -2);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.set(512, 512);
  scene.add(spotLight);
  scene.add(spotLight.target);

  // 7. HemisphereLight - subtle fill
  const hemiLight = new THREE.HemisphereLight(0x222244, 0x111100, 0.1);
  scene.add(hemiLight);

  const torchLights = [torchLight1, torchLight2, torchLight3];

  return {
    ambient,
    torchLights,
    crystalLight,
    spotLight,
    hemiLight,
  };
}

export function updateLights(lights, time, params) {
  const speed = params.flickerSpeed || 1.0;
  const amount = params.flickerAmount || 1.0;
  const baseIntensity = params.torchIntensity || 1.5;

  // Flicker torch lights with overlapping sine waves
  lights.torchLights.forEach((light, i) => {
    const t = time * speed;
    const offset = i * 2.1;

    const flicker =
      Math.sin(t * 8 + offset) * 0.2 +
      Math.sin(t * 13.7 + offset * 1.3) * 0.15 +
      Math.sin(t * 23.1 + offset * 0.7) * 0.08 +
      (Math.sin(t * 47 + offset * 3.1) * 0.5 + 0.5) * 0.1;

    light.intensity = baseIntensity + flicker * amount * baseIntensity;
  });

  // Pulse crystal light
  const crystalPulse = params.crystalIntensity || 1.0;
  const pulseSpeed = params.crystalPulseSpeed || 1.0;
  lights.crystalLight.intensity =
    crystalPulse * (1.0 + Math.sin(time * pulseSpeed * 2) * 0.3);

  // Update crystal light position to follow crystal
  lights.crystalLight.position.y = 2.5 + Math.sin(time * pulseSpeed) * 0.5;
}
