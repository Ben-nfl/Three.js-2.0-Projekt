import * as THREE from 'three';
import { createTerrainHeightMap, createTerrainNormalMap } from './textures.js';

// halbe breite und höhe der ovalbahn (ellipsen-radien)
export const TRACK_RX = 20;
export const TRACK_RZ = 14;

// breite der asphaltfläche in metern
export const TRACK_WIDTH = 6;

// anzahl der segmente für die ellipse (mehr = runder)
const SEGMENTS = 250;

// berechnet die innere, mittlere und äußere kante der strecke als punktliste
function computeEdgePoints() {
  const inner = [];
  const center = [];
  const outer = [];

  for (let i = 0; i <= SEGMENTS; i++) {
    // t läuft von 0 bis 2*PI → einmal rund um die ellipse
    const t = (i / SEGMENTS) * Math.PI * 2;
    const cos_t = Math.cos(t);
    const sin_t = Math.sin(t);

    // mittelpunkt auf der ellipse bei diesem winkel
    const cx = cos_t * TRACK_RX;
    const cz = sin_t * TRACK_RZ;

    // tangente an der ellipse (ableitung der parametrischen form)
    const tx_raw = -sin_t * TRACK_RX;
    const tz_raw = cos_t * TRACK_RZ;
    const tLen = Math.sqrt(tx_raw * tx_raw + tz_raw * tz_raw);

    // normierte tangente
    const tnx = tx_raw / tLen;
    const tnz = tz_raw / tLen;

    // außen-normale: 90° gedreht zur tangente (zeigt von der mitte nach außen)
    const nx = tnz;
    const nz = -tnx;

    // innere kante = mitte minus halbe breite in normalen-richtung
    inner.push({ x: cx - nx * TRACK_WIDTH / 2, z: cz - nz * TRACK_WIDTH / 2 });
    center.push({ x: cx, z: cz });
    // äußere kante = mitte plus halbe breite in normalen-richtung
    outer.push({ x: cx + nx * TRACK_WIDTH / 2, z: cz + nz * TRACK_WIDTH / 2 });
  }
  return { inner, center, outer };
}

export function createRaceTrack(scene) {
  const { inner, center, outer } = computeEdgePoints();

  // --- grasboden mit höhen- und normalen-karte ---
  const terrainHeightMap = createTerrainHeightMap();
  const terrainNormalMap = createTerrainNormalMap();

  // textur 8×6 mal wiederholen damit sie nicht zu groß wirkt
  terrainHeightMap.repeat.set(8, 6);
  terrainNormalMap.repeat.set(8, 6);

  // große plane als boden mit 80×60 unterteilungen (für displacement)
  const groundGeo = new THREE.PlaneGeometry(150, 120, 80, 60);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x3d8c3d,                              // grüne grasfarbe
    normalMap: terrainNormalMap,                   // gibt dem boden tiefe/struktur
    normalScale: new THREE.Vector2(1.5, 1.5),      // stärke des normaleffekts
    displacementMap: terrainHeightMap,             // hebt/senkt vertices für hügel
    displacementScale: 0.25,                       // maximale höhe der hügel
    displacementBias: -0.12,                       // vertikaler offset der verschiebung
    roughness: 0.9,                                // sehr matt (kein glanz)
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2; // plane von xz-ebene auf yz drehen (liegend)
  ground.receiveShadow = true;
  scene.add(ground);

  // --- asphalt-streckenfläche ---
  // wird manuell als buffgeometry gebaut damit sie der ellipsenform folgt
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= SEGMENTS; i++) {
    // je zwei punkte pro segment: innen und außen, leicht über dem boden (y=0.01)
    positions.push(inner[i].x, 0.01, inner[i].z);
    positions.push(outer[i].x, 0.01, outer[i].z);

    // normale zeigt nach oben
    normals.push(0, 1, 0, 0, 1, 0);

    // uv: u=0 innen, u=1 außen; v entlang der bahn
    uvs.push(0, i / SEGMENTS, 1, i / SEGMENTS);

    if (i < SEGMENTS) {
      // zwei dreiecke pro segment ergeben ein viereck (quad)
      const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
      indices.push(a, b, c, b, d, c);
    }
  }

  // buffgeometry manuell aus arrays aufbauen
  const trackGeo = new THREE.BufferGeometry();
  trackGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  trackGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  trackGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  trackGeo.setIndex(indices);

  // dunkler asphalt
  const track = new THREE.Mesh(trackGeo, new THREE.MeshLambertMaterial({ color: 0x1c1c1c }));
  track.receiveShadow = true;
  scene.add(track);

  // --- streckenmarkierungen (linien) ---
  const whiteMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  const yellowMat = new THREE.LineBasicMaterial({ color: 0xffdd00 });

  // weiße linie innen
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(inner.map(p => new THREE.Vector3(p.x, 0.05, p.z))),
    whiteMat
  ));
  // weiße linie außen
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(outer.map(p => new THREE.Vector3(p.x, 0.05, p.z))),
    whiteMat
  ));
  // gelbe mittellinie
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(center.map(p => new THREE.Vector3(p.x, 0.05, p.z))),
    yellowMat
  ));

  // --- rot-weiße randsteine (curbs) ---
  addCurbing(scene, inner, 'inner');
  addCurbing(scene, outer, 'outer');

  // --- start/ziel-linie ---
  const sfMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(TRACK_WIDTH, 1.5),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  sfMesh.rotation.x = -Math.PI / 2;
  sfMesh.position.set(TRACK_RX, 0.03, 0); // bei t=0, an der rechten seite der ellipse
  scene.add(sfMesh);

  // schachbrettmuster auf der startlinie (3 schwarze streifen)
  for (let col = 0; col < 3; col++) {
    const checker = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1.4),
      new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    checker.rotation.x = -Math.PI / 2;
    checker.position.set(TRACK_RX - TRACK_WIDTH / 2 + 1 + col * 2, 0.04, 0);
    scene.add(checker);
  }

  // --- tribüne ---
  addGrandstand(scene);

  // --- boxengasse-markierung (orange streifen neben der startlinie) ---
  const pitBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.15, 3),
    new THREE.MeshLambertMaterial({ color: 0xff8800 })
  );
  pitBox.position.set(TRACK_RX + TRACK_WIDTH / 2 + 0.5, 0.1, 1.5);
  scene.add(pitBox);
}

// erstellt die rot-weißen randsteine entlang einer kante
function addCurbing(scene, edgePoints, side) {
  const redMat = new THREE.MeshLambertMaterial({ color: 0xcc2222 });
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

  for (let i = 0; i < SEGMENTS; i++) {
    const a = edgePoints[i];
    const b = edgePoints[i + 1];

    // richtungsvektor des segments
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.001) continue; // zu kurze segmente überspringen

    // normierte richtung des segments
    const dirX = dx / len;
    const dirZ = dz / len;

    // außen-richtung: je nachdem ob innen- oder außenkante
    const outX = side === 'inner' ? -dirZ : dirZ;
    const outZ = side === 'inner' ? dirX : -dirX;

    const curbW = 0.5;  // breite des randsteins
    const curbH = 0.04; // höhe des randsteins (sehr flach)

    // mittelposition des randstein-stücks leicht nach außen versetzt
    const midX = (a.x + b.x) / 2 + outX * curbW / 2;
    const midZ = (a.z + b.z) / 2 + outZ * curbW / 2;

    // drehwinkel damit der randstein entlang der kurve ausgerichtet ist
    const angle = Math.atan2(dx, dz);

    // abwechselnd rot und weiß (je 2 segmente)
    const mat = Math.floor(i / 2) % 2 === 0 ? redMat : whiteMat;
    const curbMesh = new THREE.Mesh(
      new THREE.BoxGeometry(curbW, curbH, len),
      mat
    );
    curbMesh.position.set(midX, curbH / 2, midZ);
    curbMesh.rotation.y = angle;
    scene.add(curbMesh);
  }
}

// baut die tribüne neben der start/ziel-geraden
function addGrandstand(scene) {
  // tribüne liegt außen an der start/ziel-geraden (x-seite des ovals)
  const BASE_X = TRACK_RX + TRACK_WIDTH / 2 + 2.5; // vorderkante der tribüne
  const STAND_LEN = 28;   // länge entlang z-achse
  const TIERS = 7;         // anzahl sitzreihen
  const STEP_X = 1.8;     // tiefe pro stufe (nach außen, +x)
  const STEP_Y = 1.25;    // höhe pro stufe
  const SEAT_H = 0.32;    // dicke der sitzfläche

  const concreteMat = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 });

  // abwechselnd blaue und rote sitzreihen
  const seatColors = [0x1a3a99, 0xbb1a1a, 0x1a3a99, 0xbb1a1a, 0x1a3a99, 0xbb1a1a, 0x1a3a99];

  // jede stufe ist ein voller betonsockel von boden bis sitzfläche → echtes treppenprofil
  for (let row = 0; row < TIERS; row++) {
    const stepTopY = (row + 1) * STEP_Y; // oberkante dieser stufe
    const stepX = BASE_X + row * STEP_X; // x-position dieser stufe

    // betonsockel: reicht vom boden bis zur sitzkante
    const concrete = new THREE.Mesh(
      new THREE.BoxGeometry(STEP_X, stepTopY, STAND_LEN),
      concreteMat
    );
    concrete.position.set(stepX + STEP_X / 2, stepTopY / 2, 0);
    concrete.receiveShadow = true;
    scene.add(concrete);

    // farbige sitzfläche obendrauf
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(STEP_X, SEAT_H, STAND_LEN),
      new THREE.MeshLambertMaterial({ color: seatColors[row] })
    );
    seat.position.set(stepX + STEP_X / 2, stepTopY + SEAT_H / 2, 0);
    seat.castShadow = true;
    scene.add(seat);
  }

  const totalW = TIERS * STEP_X;   // gesamttiefe der tribüne
  const totalH = TIERS * STEP_Y;   // gesamthöhe der sitzreihen
  const backX  = BASE_X + totalW;  // x-position der rückwand

  // rückwand
  const wallH = totalH + 2.5;
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, wallH, STAND_LEN + 0.4),
    concreteMat
  );
  backWall.position.set(backX + 0.25, wallH / 2, 0);
  backWall.castShadow = true;
  scene.add(backWall);

  // seitenwände links und rechts
  for (const side of [-1, 1]) {
    const sideWall = new THREE.Mesh(
      new THREE.BoxGeometry(totalW + 0.5, wallH, 0.4),
      concreteMat
    );
    sideWall.position.set(BASE_X + totalW / 2 - 0.25, wallH / 2, side * (STAND_LEN / 2 + 0.2));
    sideWall.castShadow = true;
    scene.add(sideWall);
  }

  // dach (flache platte, etwas über die vorderseite hinaus)
  const roofY  = wallH + 0.15;
  const roofW  = totalW + 3;
  const roofCX = backX - roofW / 2 + 0.5;
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(roofW, 0.25, STAND_LEN + 1.5),
    new THREE.MeshLambertMaterial({ color: 0x444444 })
  );
  roof.position.set(roofCX, roofY, 0);
  roof.castShadow = true;
  roof.receiveShadow = true;
  scene.add(roof);

  // vordere stützsäulen (tragen das dach auf der strecken-seite)
  const colMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
  const colX   = BASE_X - 0.5;
  const colCount = 5;
  for (let c = 0; c < colCount; c++) {
    // säulen gleichmäßig über die länge der tribüne verteilen
    const colZ = -STAND_LEN / 2 + (c / (colCount - 1)) * STAND_LEN;
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, roofY, 8),
      colMat
    );
    col.position.set(colX, roofY / 2, colZ);
    col.castShadow = true;
    scene.add(col);
  }

  // werbebanden an der vorderfront (verschiedene farben)
  const bannerColors = [0xffdd00, 0xff4400, 0x0044ff, 0x00aa44, 0xffdd00, 0xff4400, 0x0044ff];
  const bannerCount = 7;
  const bannerW = STAND_LEN / bannerCount;
  for (let b = 0; b < bannerCount; b++) {
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.0, bannerW - 0.1),
      new THREE.MeshLambertMaterial({ color: bannerColors[b % bannerColors.length] })
    );
    banner.position.set(BASE_X - 0.05, 0.5, -STAND_LEN / 2 + bannerW * b + bannerW / 2);
    scene.add(banner);
  }
}
