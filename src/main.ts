import * as THREE from 'three';
import { createScene } from './components/scene.js';
import { createMaterials } from './components/materials.js';
import { createDungeon } from './components/dungeon.js';
import { createPillars } from './components/pillars.js';
import { createTorches, updateTorchFlicker } from './components/torches.js';
import { createTreasure, updateTreasure } from './components/treasure.js';
import { createBarrels } from './components/barrels.js';
import { createCrystal, updateCrystal } from './components/crystal.js';
import { createLights, updateLights } from './components/lights.js';
import { createParticles, updateParticles } from './components/particles.js';
import { createDecorations } from './components/decorations.js';
import { createPostProcessing } from './components/postprocessing.js';
import { createEnvMap, applyEnvMap } from './components/envmap.js';
import { createGUI, getDefaultParams } from './components/gui.js';
import { createCar, updateCar } from './components/car.js';

// Typen für die Szenenparameter
interface SceneParams {
  animSpeed: number;
  dustEnabled: boolean;
  _helperCallback?: (show: boolean) => void;
  [key: string]: unknown;
}

// Init
const canvas = document.getElementById('dungeon-canvas') as HTMLCanvasElement;
const { scene, camera, renderer, controls } = createScene(canvas);

// Materials
const materials = createMaterials();

// Environment Map für Reflektionen
const envMap = createEnvMap(renderer);
applyEnvMap(envMap, materials);

// Build dungeon
createDungeon(scene, materials);
createPillars(scene, materials);
const torches = createTorches(scene, materials);
const treasure = createTreasure(scene, materials);
const barrels = createBarrels(scene, materials);
const crystal = createCrystal(scene, materials);
const lights = createLights(scene);
const particleData = createParticles(scene);
createDecorations(scene, materials);
const carData = createCar(scene);

// Post-Processing (Bloom)
const { composer, bloomPass } = createPostProcessing(renderer, scene, camera);

// Light helpers (toggled via GUI)
const helpers: THREE.Object3D[] = [];

function toggleHelpers(show: boolean): void {
  if (show && helpers.length === 0) {
    lights.torchLights.forEach((l: THREE.PointLight) => {
      const h = new THREE.PointLightHelper(l, 0.3);
      scene.add(h);
      helpers.push(h);
    });
    const sh = new THREE.SpotLightHelper(lights.spotLight);
    scene.add(sh);
    helpers.push(sh);
  } else if (!show) {
    helpers.forEach((h: THREE.Object3D) => {
      scene.remove(h);
      (h as THREE.PointLightHelper | THREE.SpotLightHelper).dispose();
    });
    helpers.length = 0;
  }
}

// GUI
const params: SceneParams = getDefaultParams();
params._helperCallback = toggleHelpers;
const gui = createGUI(params, {
  lights,
  materials,
  barrels,
  crystal,
  camera,
  controls,
  renderer,
  scene,
  bloomPass,
});

// Animation loop
const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);

  const elapsed: number = clock.getElapsedTime() * (params.animSpeed as number);

  // Update animations
  updateTorchFlicker(torches, elapsed, params);
  updateLights(lights, elapsed, params);
  updateCrystal(crystal, elapsed, params);
  updateTreasure(treasure, elapsed);
  updateParticles(particleData, elapsed, params.dustEnabled);
  updateCar(carData, elapsed);

  // Update helpers if visible
  helpers.forEach((h) => {
    if ('update' in h && typeof (h as { update?: () => void }).update === 'function') {
      (h as { update: () => void }).update();
    }
  });

  controls.update();

  // Render via Composer (mit Bloom)
  composer.render();
}

animate();
