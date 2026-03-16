import * as THREE from 'three';
import { createScene } from './components/scene.js';
import { createRaceTrack } from './components/racetrack.js';
import { createTrees } from './components/trees.js';
import { createRaceLights } from './components/raceLights.js';
import { createCar, updateCar } from './components/car.js';
import { createPostProcessing } from './components/postprocessing.js';

// Init
const canvas = document.getElementById('dungeon-canvas') as HTMLCanvasElement;
const { scene, camera, renderer, controls } = createScene(canvas);

// Rennstrecke aufbauen
createRaceTrack(scene);
createTrees(scene);
const raceLights = createRaceLights(scene);
const carData = createCar(scene);

// Post-Processing (leichter Bloom für Sonnenlicht-Glanz)
const { composer, bloomPass } = createPostProcessing(renderer, scene, camera);
bloomPass.strength = 0.15;
bloomPass.threshold = 0.9;
bloomPass.radius = 0.3;

// Animations-Loop
const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  updateCar(carData, elapsed);

  controls.update();
  composer.render();
}

animate();
