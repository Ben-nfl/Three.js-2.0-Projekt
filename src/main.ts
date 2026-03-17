import * as THREE from 'three';
import { createScene } from './components/scene.js';
import { createRaceTrack } from './components/racetrack.js';
import { createTrees } from './components/trees.js';
import { createRaceLights } from './components/raceLights.js';
import { createCar, updateCar, carParams } from './components/car.js';
import { createPostProcessing } from './components/postprocessing.js';
import { createGUI } from './components/gui.js';

// canvas-element aus dem html holen, auf dem three.js rendert
const canvas = document.getElementById('dungeon-canvas') as HTMLCanvasElement;

// szene, kamera, renderer und kamera-steuerung initialisieren
const { scene, camera, renderer, controls } = createScene(canvas);

// rennstrecke mit asphalt, randsteinen und tribüne aufbauen
createRaceTrack(scene);

// bäume rund um die strecke und im infield platzieren
createTrees(scene);

// alle lichter erstellen (sonne, fill-lights, flutlichtmasten)
const raceLights = createRaceLights(scene);

// 3d-automodell laden und auf der strecke platzieren
const carData = createCar(scene);

// postprocessing-pipeline aufbauen (bloom für glanzeffekte)
const { composer, bloomPass } = createPostProcessing(renderer, scene, camera);

// bloom nur schwach einstellen – leichter sonnenlicht-glanz
bloomPass.strength = 0.15;
bloomPass.threshold = 0.9;
bloomPass.radius = 0.3;

// debug-gui mit reglern für licht, bloom und autogeschwindigkeit
createGUI(raceLights, bloomPass, renderer, scene, carParams);

// zeitgeber für die animation (gibt sekunden seit start zurück)
const clock = new THREE.Clock();

function animate(): void {
  // nächsten frame anfordern → erzeugt dauerschleife
  requestAnimationFrame(animate);

  // vergangene zeit seit start in sekunden
  const elapsed = clock.getElapsedTime();

  // auto auf der ovalbahn bewegen und räder drehen
  updateCar(carData, elapsed);

  // orbit-controls sanft nachführen (damping)
  controls.update();

  // szene mit postprocessing rendern (statt renderer.render direkt)
  composer.render();
}

animate();
