import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TRACK_RX, TRACK_RZ } from './racetrack.js';

// geschwindigkeit kann zur laufzeit über die gui geändert werden
export const carParams = { speed: 0.12 };  // runden pro sekunde

const DRIVE_SPEED = 0.12;    // startwert: runden pro sekunde
const CAR_HEIGHT = 0.12;     // leicht über dem boden damit das auto nicht versunken wirkt
const WHEEL_RADIUS = 0.6;    // radius der räder für die drehgeschwindigkeit

// ramanujan-näherung für den umfang einer ellipse (genauer als pi*(rx+rz))
const _h = Math.pow((TRACK_RX - TRACK_RZ) / (TRACK_RX + TRACK_RZ), 2);
const TRACK_CIRCUMFERENCE = Math.PI * (TRACK_RX + TRACK_RZ) * (1 + 3 * _h / (10 + Math.sqrt(4 - 3 * _h)));

// lineare geschwindigkeit = runden/s × umfang
const CAR_LINEAR_SPEED = DRIVE_SPEED * TRACK_CIRCUMFERENCE;

// winkelgeschwindigkeit der räder = lineare geschwindigkeit / radius
const WHEEL_ANGULAR_SPEED = CAR_LINEAR_SPEED / WHEEL_RADIUS;

// namen der rad-meshes im blender-modell
const WHEEL_NAMES = ['Rad_HL', 'Rad_HR', 'Rad_VL', 'Rad_VR'];

export function createCar(scene) {
  // gltf-loader für das .glb blender-modell
  const loader = new GLTFLoader();

  // container für modell und rad-referenzen
  const carData = {
    model: null,
    wheels: { Rad_HL: null, Rad_HR: null, Rad_VL: null, Rad_VR: null },
  };

  // modell asynchron laden (gibt callback zurück wenn fertig)
  loader.load('/car.glb', (gltf) => {
    const model = gltf.scene;

    // skalierung 1:1 und startposition auf der strecke (bei t=0)
    model.scale.setScalar(1.0);
    model.position.set(TRACK_RX, CAR_HEIGHT, 0);
    model.updateMatrixWorld(true);

    // alle untergeordneten meshes durchgehen
    model.traverse((child) => {
      if (!child.isMesh) return;

      // flache, breite meshes sind die shadow-plane aus blender → verstecken
      const box = new THREE.Box3().setFromObject(child);
      const size = box.getSize(new THREE.Vector3());
      if (size.y < 0.1 && size.x > 1.0) {
        child.visible = false;
        console.log(`Platform ausgeblendet: "${child.name}"`);
        return;
      }

      // alle anderen meshes schatten werfen und empfangen lassen
      child.castShadow = true;
      child.receiveShadow = true;

      // rad-meshes in der carData-map speichern für spätere animation
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
  // solange das modell noch nicht geladen ist nichts tun
  if (!carData.model) return;

  // t = winkel in radiant basierend auf vergangener zeit und geschwindigkeit
  const t = elapsed * carParams.speed * Math.PI * 2;

  // position auf der elliptischen bahn berechnen (parametrische ellipsenformel)
  carData.model.position.x = Math.cos(t) * TRACK_RX;
  carData.model.position.y = CAR_HEIGHT;
  carData.model.position.z = Math.sin(t) * TRACK_RZ;

  // fahrtrichtung: ableitung der ellipse an stelle t → tangente → auto dreht sich korrekt
  carData.model.rotation.y = Math.atan2(-Math.sin(t) * TRACK_RX, Math.cos(t) * TRACK_RZ) - Math.PI / 2;

  // radrotation skaliert mit aktueller geschwindigkeit aus gui
  const linearSpeed = carParams.speed * TRACK_CIRCUMFERENCE;
  const wheelAngle = elapsed * (linearSpeed / WHEEL_RADIUS);
  WHEEL_NAMES.forEach((name) => {
    const wheel = carData.wheels[name];
    if (wheel) wheel.rotation.x = wheelAngle; // räder um x-achse drehen (vorwärts)
  });
}
