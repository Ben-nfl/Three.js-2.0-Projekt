import * as THREE from 'three';
import { TRACK_RX, TRACK_RZ, TRACK_WIDTH } from './racetrack.js';

// farbe und helligkeit der flutlichter
const FLOODLIGHT_COLOR = 0xfff5cc;
const FLOODLIGHT_INTENSITY = 80;

export function createRaceLights(scene) {
  // --- sonne (direktionales licht) ---
  // simuliert sonnenstrahlen aus einer festen richtung
  const sun = new THREE.DirectionalLight(0xfff5e0, 2.2);

  // position der "sonne" im raum (richtung zählt, nicht abstand)
  sun.position.set(40, 50, 30);

  // sonne wirft schatten
  sun.castShadow = true;

  // auflösung der shadow map – höher = schärfere schatten
  sun.shadow.mapSize.set(2048, 2048);

  // nah- und ferngrenze der schattenberechnung
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 200;

  // bereich der shadow-kamera (muss die ganze strecke abdecken)
  sun.shadow.camera.left = -70;
  sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 60;
  sun.shadow.camera.bottom = -60;

  // kleiner bias verhindert "shadow acne" (streifenmuster auf flächen)
  sun.shadow.bias = -0.001;
  scene.add(sun);

  // target muss ebenfalls zur szene hinzugefügt werden
  scene.add(sun.target); // target bleibt im ursprung

  // --- hemisphärenlicht (himmel/boden-fülllicht) ---
  // oben blau (himmel), unten grün (boden) → weiches umgebungslicht
  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x4a7c2f, 0.9);
  scene.add(hemi);

  // --- ambientes licht (grundhelligkeit ohne richtung) ---
  const ambient = new THREE.AmbientLight(0xc8e0ff, 0.4);
  scene.add(ambient);

  // --- flutlichtmasten an 4 positionen rund um die strecke ---
  // winkel in radiant: 45°, 135°, 225°, 315°
  const polePositions = [
    { angle: Math.PI * 0.25, side: 'outer' },
    { angle: Math.PI * 0.75, side: 'outer' },
    { angle: Math.PI * 1.25, side: 'outer' },
    { angle: Math.PI * 1.75, side: 'outer' },
  ];

  const spotlights = [];

  for (const { angle, side } of polePositions) {
    // punkt auf der mittellinie der strecke beim jeweiligen winkel
    const cos_a = Math.cos(angle);
    const sin_a = Math.sin(angle);

    // tangente an der ellipse berechnen
    const tx_raw = -Math.sin(angle) * TRACK_RX;
    const tz_raw = Math.cos(angle) * TRACK_RZ;
    const tLen = Math.sqrt(tx_raw * tx_raw + tz_raw * tz_raw);

    // normierte außen-normale (zeigt von der strecke nach außen)
    const nx = tz_raw / tLen;
    const nz = -tx_raw / tLen;

    // mittelpunkt auf der streckenlinie
    const cx = cos_a * TRACK_RX;
    const cz = sin_a * TRACK_RZ;

    // mastposition: außerhalb der strecke um 5 einheiten versetzt
    const poleX = cx + nx * (TRACK_WIDTH / 2 + 5);
    const poleZ = cz + nz * (TRACK_WIDTH / 2 + 5);
    const poleH = 16; // masthöhe in metern

    // mast-mesh (zylinder)
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, poleH, 8),
      new THREE.MeshLambertMaterial({ color: 0x888888 })
    );
    pole.position.set(poleX, poleH / 2, poleZ); // mittig auf y positionieren
    pole.castShadow = true;
    scene.add(pole);

    // lampengehäuse oben auf dem mast
    const lampHead = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.5, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    lampHead.position.set(poleX, poleH + 0.25, poleZ);
    scene.add(lampHead);

    // leuchtende fläche an der unterseite des gehäuses (emissive = leuchtet selbst)
    const lampGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 0.4),
      new THREE.MeshStandardMaterial({
        color: 0xfff5cc,
        emissive: 0xfff5cc,
        emissiveIntensity: 2.0, // selbstleuchten-stärke
      })
    );
    lampGlow.position.set(poleX, poleH + 0.1, poleZ);
    lampGlow.rotation.x = Math.PI / 2; // plane nach unten drehen
    scene.add(lampGlow);

    // spotlight das von der lampe auf die strecke strahlt
    // parameter: farbe, intensität, reichweite, öffnungswinkel, weichheit, abnahme
    const spot = new THREE.SpotLight(FLOODLIGHT_COLOR, FLOODLIGHT_INTENSITY, 60, Math.PI / 5, 0.4, 1);
    spot.position.set(poleX, poleH, poleZ);

    // spotlight zeigt auf den streckenpunkt auf bodenhöhe
    spot.target.position.set(cx, 0, cz);
    spot.castShadow = true;

    // niedrigere shadow-map auflösung für performance
    spot.shadow.mapSize.set(512, 512);
    spot.shadow.bias = -0.002;
    scene.add(spot);
    scene.add(spot.target); // target muss zur szene hinzugefügt werden
    spotlights.push(spot);
  }

  // alle lichter zurückgeben damit die gui darauf zugreifen kann
  return { sun, hemi, ambient, spotlights };
}
