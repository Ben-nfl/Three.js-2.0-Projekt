import * as THREE from 'three';
import { TRACK_RX, TRACK_RZ, TRACK_WIDTH } from './racetrack.js';

// anzahl segmente muss mit racetrack übereinstimmen
const SEGMENTS = 120;

// bereich der tribüne ausrechnen damit dort keine bäume spawnen
const GRANDSTAND_X_MIN = TRACK_RX + TRACK_WIDTH / 2 + 1.0;
const GRANDSTAND_X_MAX = TRACK_RX + TRACK_WIDTH / 2 + 2.5 + 7 * 1.8 + 1.5;
const GRANDSTAND_Z_HALF = 28 / 2 + 2.0;

// gibt true zurück wenn eine position im tribünen-bereich liegt
function isInGrandstand(x, z) {
  return x >= GRANDSTAND_X_MIN && x <= GRANDSTAND_X_MAX && Math.abs(z) <= GRANDSTAND_Z_HALF;
}

// gemeinsame materialien für alle bäume (einmal erstellen = besser für performance)
const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3a1e }); // braun für stamm
const leafMat1 = new THREE.MeshLambertMaterial({ color: 0x2a7a1e }); // hellgrün für unteren kegel
const leafMat2 = new THREE.MeshLambertMaterial({ color: 0x1e5c14 }); // dunkelgrün für oberen kegel

// erstellt einen einzelnen baum an position x/z mit gegebener höhe und kronenradius
function createTree(scene, x, z, height, radius) {
  // stamm ist 30% der gesamthöhe
  const trunkH = height * 0.3;

  // stamm als zylinder (unten etwas dicker als oben)
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.28, trunkH, 7),
    trunkMat
  );
  trunk.position.set(x, trunkH / 2, z); // mittig auf y setzen
  trunk.castShadow = true;
  scene.add(trunk);

  // unterer kegel: bildet die hauptkrone
  const cone1 = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height * 0.65, 7),
    leafMat1
  );
  cone1.position.set(x, trunkH + height * 0.3, z);
  cone1.castShadow = true;
  scene.add(cone1);

  // oberer schmaler kegel: macht den baum realistischer (zweischichtig)
  const cone2 = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 0.65, height * 0.45, 7),
    leafMat2
  );
  cone2.position.set(x, trunkH + height * 0.52, z);
  cone2.castShadow = true;
  scene.add(cone2);
}

export function createTrees(scene) {
  // abstand der bäume zur streckenkante
  const outerOffset = TRACK_WIDTH / 2 + 3.5; // außen etwas weiter
  const innerOffset = TRACK_WIDTH / 2 + 3.0; // innen etwas näher

  // jeden zweiten punkt der ellipse für bäume nutzen (i += 2)
  for (let i = 0; i < SEGMENTS; i += 2) {
    // winkel an dieser position der ellipse
    const t = (i / SEGMENTS) * Math.PI * 2;
    const cos_t = Math.cos(t);
    const sin_t = Math.sin(t);

    // mittelpunkt auf der ellipse
    const cx = cos_t * TRACK_RX;
    const cz = sin_t * TRACK_RZ;

    // tangente berechnen
    const tx_raw = -sin_t * TRACK_RX;
    const tz_raw = cos_t * TRACK_RZ;
    const tLen = Math.sqrt(tx_raw * tx_raw + tz_raw * tz_raw);
    const tnx = tx_raw / tLen;
    const tnz = tz_raw / tLen;

    // außen-normale (zeigt von der mitte nach außen)
    const nx = tnz;
    const nz = -tnx;

    // außenbäume – tribünenbereich wird übersprungen
    {
      // zufälliger extra-abstand basierend auf index (sieht natürlicher aus)
      const spreadOuter = outerOffset + (Math.sin(i * 7.3) * 0.5 + 0.5) * 4;
      const tx = cx + nx * spreadOuter;
      const tz = cz + nz * spreadOuter;
      if (!isInGrandstand(tx, tz)) {
        // zufällige höhe und kronenradius pro baum
        const h = 4.5 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 3;
        const r = 1.2 + (Math.sin(i * 2.1) * 0.5 + 0.5) * 0.6;
        createTree(scene, tx, tz, h, r);
      }
    }

    // innenbäume (infield) – nur jeden 4. punkt für weniger bäume
    if (i % 4 === 0) {
      const spreadInner = innerOffset + (Math.sin(i * 5.1) * 0.5 + 0.5) * 2;
      const ix = cx - nx * spreadInner; // nach innen versetzt
      const iz = cz - nz * spreadInner;

      // prüfen ob der baum wirklich innerhalb des ovals liegt (nicht auf der strecke)
      const normalizedX = ix / (TRACK_RX - TRACK_WIDTH);
      const normalizedZ = iz / (TRACK_RZ - TRACK_WIDTH);
      if (normalizedX * normalizedX + normalizedZ * normalizedZ < 0.85 && !isInGrandstand(ix, iz)) {
        const h = 3.5 + (Math.sin(i * 4.3) * 0.5 + 0.5) * 2.5;
        const r = 1.0 + (Math.sin(i * 1.9) * 0.5 + 0.5) * 0.5;
        createTree(scene, ix, iz, h, r);
      }
    }
  }

  // zusätzliche bäume direkt im infield-zentrum
  const infieldPositions = [
    [0, 0], [4, 3], [-5, 2], [3, -4], [-3, -5],
    [6, -2], [-6, 4], [0, 6], [0, -6],
  ];
  for (const [px, pz] of infieldPositions) {
    if (isInGrandstand(px, pz)) continue;
    const h = 4 + Math.abs(Math.sin(px + pz)) * 3;
    const r = 1.1 + Math.abs(Math.cos(px * pz)) * 0.5;
    createTree(scene, px, pz, h, r);
  }

  // hintergrundbäume weit außen (erzeugen einen wald-rand rundum)
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2;
    // abstand: außerhalb der strecke + 12 einheiten + zufällige variation
    const dist = TRACK_RX + TRACK_WIDTH / 2 + 12 + Math.sin(i * 3.7) * 5;
    const x = Math.cos(angle) * dist;
    // z wird mit dem ellipsen-verhältnis skaliert damit der kreis oval wird
    const z = Math.sin(angle) * dist * (TRACK_RZ / TRACK_RX);
    if (isInGrandstand(x, z)) continue;
    const h = 5 + Math.abs(Math.sin(i * 2.3)) * 4;
    const r = 1.5 + Math.abs(Math.cos(i * 1.7)) * 0.8;
    createTree(scene, x, z, h, r);
  }
}
