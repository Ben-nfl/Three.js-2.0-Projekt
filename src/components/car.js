import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TRACK_RX, TRACK_RZ } from './racetrack.js';

// Mutable so GUI can adjust it at runtime
export const carParams = { speed: 0.12 };  // Runden pro Sekunde

const DRIVE_SPEED = 0.12;    // Runden pro Sekunde (initial)
const CAR_HEIGHT = 0.12;     // Leicht über dem Boden
const WHEEL_RADIUS = 0.6;

// Ramanujan-Näherung für Oval-Umfang
const _h = Math.pow((TRACK_RX - TRACK_RZ) / (TRACK_RX + TRACK_RZ), 2);
const TRACK_CIRCUMFERENCE = Math.PI * (TRACK_RX + TRACK_RZ) * (1 + 3 * _h / (10 + Math.sqrt(4 - 3 * _h)));
const CAR_LINEAR_SPEED = DRIVE_SPEED * TRACK_CIRCUMFERENCE;
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

    model.scale.setScalar(1.0);
    model.position.set(TRACK_RX, CAR_HEIGHT, 0);
    model.updateMatrixWorld(true);

    model.traverse((child) => {
      if (!child.isMesh) return;

      // Flache, breite Meshes sind die Platform/Schatten-Ebene aus Blender → ausblenden
      const box = new THREE.Box3().setFromObject(child);
      const size = box.getSize(new THREE.Vector3());
      if (size.y < 0.1 && size.x > 1.0) {
        child.visible = false;
        console.log(`Platform ausgeblendet: "${child.name}"`);
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;

      if (WHEEL_NAMES.includes(child.name)) {
        carData.wheels[child.name] = child;
      }
    });

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

  const t = elapsed * carParams.speed * Math.PI * 2;

  // Position auf Oval-Bahn
  carData.model.position.x = Math.cos(t) * TRACK_RX;
  carData.model.position.y = CAR_HEIGHT;
  carData.model.position.z = Math.sin(t) * TRACK_RZ;

  // Tangenten-Richtung des Ovals → Fahrtrichtung
  carData.model.rotation.y = Math.atan2(-Math.sin(t) * TRACK_RX, Math.cos(t) * TRACK_RZ) - Math.PI / 2;

  // Radrotation skaliert mit aktueller Geschwindigkeit
  const linearSpeed = carParams.speed * TRACK_CIRCUMFERENCE;
  const wheelAngle = elapsed * (linearSpeed / WHEEL_RADIUS);
  WHEEL_NAMES.forEach((name) => {
    const wheel = carData.wheels[name];
    if (wheel) wheel.rotation.x = wheelAngle;
  });
}
