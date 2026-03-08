import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const DRIVE_RADIUS = 3.5;
const DRIVE_SPEED = 0.4;   // Runden pro Sekunde
const CAR_HEIGHT = 0.0;
const WHEEL_RADIUS = 0.6;  // Größerer Wert = langsamere Radrotation

// Umfang der Kreisbahn → Radgeschwindigkeit physikalisch korrekt ableiten
const CAR_LINEAR_SPEED = DRIVE_SPEED * 2 * Math.PI * DRIVE_RADIUS;
const WHEEL_ANGULAR_SPEED = CAR_LINEAR_SPEED / WHEEL_RADIUS;

const WHEEL_NAMES = ['Rad_HL', 'Rad_HR', 'Rad_VL', 'Rad_VR'];

export function createCar(scene) {
  const loader = new GLTFLoader();
  const carData = {
    model: null,
    wheels: { Rad_HL: null, Rad_HR: null, Rad_VL: null, Rad_VR: null },
  };

  loader.load('/car.glb', (gltf) => {
    const model = gltf.scene;

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

      // Räder gezielt nach Namen suchen
      if (WHEEL_NAMES.includes(child.name)) {
        carData.wheels[child.name] = child;
      }
    });

    model.scale.setScalar(0.5);
    model.position.set(DRIVE_RADIUS, CAR_HEIGHT, 0);
    scene.add(model);
    carData.model = model;

    const found = WHEEL_NAMES.filter(n => carData.wheels[n] !== null);
    console.log(`Car geladen. Räder gefunden: ${found.join(', ')}`);
  }, undefined, (err) => {
    console.error('Fehler beim Laden von car.glb:', err);
  });

  return carData;
}

export function updateCar(carData, elapsed) {
  if (!carData.model) return;

  // Position auf Kreisbahn
  const angle = elapsed * DRIVE_SPEED * Math.PI * 2;
  carData.model.position.x = Math.cos(angle) * DRIVE_RADIUS;
  carData.model.position.z = Math.sin(angle) * DRIVE_RADIUS;

  // Fahrtrichtung (Tangente)
  const tangentAngle = angle + Math.PI / 2;
  carData.model.rotation.y = -tangentAngle;

  // Physikalisch korrekte Radrotation: Strecke / Radius = Winkel
  const wheelAngle = elapsed * WHEEL_ANGULAR_SPEED;

  WHEEL_NAMES.forEach((name) => {
    const wheel = carData.wheels[name];
    if (!wheel) return;
    // Räder drehen sich um ihre lokale X-Achse (Achsrichtung nach Blender-Export)
    wheel.rotation.x = wheelAngle;
  });
}
