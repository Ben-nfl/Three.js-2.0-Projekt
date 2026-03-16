import * as THREE from 'three';

export const TRACK_RX = 20;
export const TRACK_RZ = 14;
export const TRACK_WIDTH = 6;

const SEGMENTS = 120;

function computeEdgePoints() {
  const inner = [];
  const center = [];
  const outer = [];

  for (let i = 0; i <= SEGMENTS; i++) {
    const t = (i / SEGMENTS) * Math.PI * 2;
    const cos_t = Math.cos(t);
    const sin_t = Math.sin(t);

    const cx = cos_t * TRACK_RX;
    const cz = sin_t * TRACK_RZ;

    const tx_raw = -sin_t * TRACK_RX;
    const tz_raw = cos_t * TRACK_RZ;
    const tLen = Math.sqrt(tx_raw * tx_raw + tz_raw * tz_raw);
    const tnx = tx_raw / tLen;
    const tnz = tz_raw / tLen;

    // Outward normal (perpendicular to tangent in XZ)
    const nx = tnz;
    const nz = -tnx;

    inner.push({ x: cx - nx * TRACK_WIDTH / 2, z: cz - nz * TRACK_WIDTH / 2 });
    center.push({ x: cx, z: cz });
    outer.push({ x: cx + nx * TRACK_WIDTH / 2, z: cz + nz * TRACK_WIDTH / 2 });
  }
  return { inner, center, outer };
}

export function createRaceTrack(scene) {
  const { inner, center, outer } = computeEdgePoints();

  // --- Grass ground ---
  const groundGeo = new THREE.PlaneGeometry(150, 120);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x3d8c3d });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // --- Asphalt track surface ---
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= SEGMENTS; i++) {
    positions.push(inner[i].x, 0.01, inner[i].z);
    positions.push(outer[i].x, 0.01, outer[i].z);
    normals.push(0, 1, 0, 0, 1, 0);
    uvs.push(0, i / SEGMENTS, 1, i / SEGMENTS);

    if (i < SEGMENTS) {
      const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
      indices.push(a, b, c, b, d, c);
    }
  }

  const trackGeo = new THREE.BufferGeometry();
  trackGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  trackGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  trackGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  trackGeo.setIndex(indices);

  const track = new THREE.Mesh(trackGeo, new THREE.MeshLambertMaterial({ color: 0x1c1c1c }));
  track.receiveShadow = true;
  scene.add(track);

  // --- Track edge lines ---
  const whiteMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  const yellowMat = new THREE.LineBasicMaterial({ color: 0xffdd00 });

  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(inner.map(p => new THREE.Vector3(p.x, 0.05, p.z))),
    whiteMat
  ));
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(outer.map(p => new THREE.Vector3(p.x, 0.05, p.z))),
    whiteMat
  ));
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(center.map(p => new THREE.Vector3(p.x, 0.05, p.z))),
    yellowMat
  ));

  // --- Red/white curbing ---
  addCurbing(scene, inner, 'inner');
  addCurbing(scene, outer, 'outer');

  // --- Start/Finish line ---
  const sfMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(TRACK_WIDTH, 1.5),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  sfMesh.rotation.x = -Math.PI / 2;
  sfMesh.position.set(TRACK_RX, 0.03, 0);
  scene.add(sfMesh);

  // Checkered pattern on start line (two black strips)
  for (let col = 0; col < 3; col++) {
    const checker = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1.4),
      new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    checker.rotation.x = -Math.PI / 2;
    checker.position.set(TRACK_RX - TRACK_WIDTH / 2 + 1 + col * 2, 0.04, 0);
    scene.add(checker);
  }

  // --- Grandstand ---
  addGrandstand(scene);

  // --- Pit lane marker (simple painted box near start) ---
  const pitBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.15, 3),
    new THREE.MeshLambertMaterial({ color: 0xff8800 })
  );
  pitBox.position.set(TRACK_RX + TRACK_WIDTH / 2 + 0.5, 0.1, 1.5);
  scene.add(pitBox);
}

function addCurbing(scene, edgePoints, side) {
  const redMat = new THREE.MeshLambertMaterial({ color: 0xcc2222 });
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

  for (let i = 0; i < SEGMENTS; i++) {
    const a = edgePoints[i];
    const b = edgePoints[i + 1];

    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.001) continue;

    // Direction of outward normal for curb strip
    const dirX = dx / len;
    const dirZ = dz / len;
    const outX = side === 'inner' ? -dirZ : dirZ;
    const outZ = side === 'inner' ? dirX : -dirX;

    const curbW = 0.5;
    const curbH = 0.04;
    const midX = (a.x + b.x) / 2 + outX * curbW / 2;
    const midZ = (a.z + b.z) / 2 + outZ * curbW / 2;
    const angle = Math.atan2(dx, dz);

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

function addGrandstand(scene) {
  // Tribüne liegt außen an der Start/Ziel-Geraden (X-Seite des Ovals)
  // Äußere Streckenkante bei t=0: x = TRACK_RX + TRACK_WIDTH/2 = 23
  const BASE_X = TRACK_RX + TRACK_WIDTH / 2 + 2.5; // Front der Tribüne (Spur-Seite)
  const STAND_LEN = 28;   // Länge entlang Z-Achse
  const TIERS = 7;
  const STEP_X = 1.8;     // Tiefe pro Stufe (nach außen, +X)
  const STEP_Y = 1.25;    // Höhe pro Stufe
  const SEAT_H = 0.32;    // Dicke der Sitzfläche

  const concreteMat = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 });
  const seatColors = [0x1a3a99, 0xbb1a1a, 0x1a3a99, 0xbb1a1a, 0x1a3a99, 0xbb1a1a, 0x1a3a99];

  // Betonstufen: Jede Stufe ist ein lückenloses Box-Segment das von Boden bis zur
  // jeweiligen Sitzhöhe reicht → ergibt von der Seite gesehen ein echtes Treppenprofil
  for (let row = 0; row < TIERS; row++) {
    const stepTopY = (row + 1) * STEP_Y;
    const stepX = BASE_X + row * STEP_X;

    // Betonsockel dieser Stufe
    const concrete = new THREE.Mesh(
      new THREE.BoxGeometry(STEP_X, stepTopY, STAND_LEN),
      concreteMat
    );
    concrete.position.set(stepX + STEP_X / 2, stepTopY / 2, 0);
    concrete.receiveShadow = true;
    scene.add(concrete);

    // Farbige Sitzfläche obendrauf
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(STEP_X, SEAT_H, STAND_LEN),
      new THREE.MeshLambertMaterial({ color: seatColors[row] })
    );
    seat.position.set(stepX + STEP_X / 2, stepTopY + SEAT_H / 2, 0);
    seat.castShadow = true;
    scene.add(seat);
  }

  const totalW = TIERS * STEP_X;           // Gesamttiefe der Tribüne
  const totalH = TIERS * STEP_Y;           // Gesamthöhe der Sitzreihen
  const backX  = BASE_X + totalW;          // X-Position der Rückwand

  // Rückwand
  const wallH = totalH + 2.5;
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, wallH, STAND_LEN + 0.4),
    concreteMat
  );
  backWall.position.set(backX + 0.25, wallH / 2, 0);
  backWall.castShadow = true;
  scene.add(backWall);

  // Seitenwände (Abschluss links/rechts)
  for (const side of [-1, 1]) {
    const sideWall = new THREE.Mesh(
      new THREE.BoxGeometry(totalW + 0.5, wallH, 0.4),
      concreteMat
    );
    sideWall.position.set(BASE_X + totalW / 2 - 0.25, wallH / 2, side * (STAND_LEN / 2 + 0.2));
    sideWall.castShadow = true;
    scene.add(sideWall);
  }

  // Dach (flache Platte, etwas überstehend)
  const roofY  = wallH + 0.15;
  const roofW  = totalW + 3;       // etwas über Front hinaus
  const roofCX = backX - roofW / 2 + 0.5;
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(roofW, 0.25, STAND_LEN + 1.5),
    new THREE.MeshLambertMaterial({ color: 0x444444 })
  );
  roof.position.set(roofCX, roofY, 0);
  roof.castShadow = true;
  roof.receiveShadow = true;
  scene.add(roof);

  // Vordere Stützsäulen (Dach-Front, Boden bis Dach)
  const colMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
  const colX   = BASE_X - 0.5;
  const colCount = 5;
  for (let c = 0; c < colCount; c++) {
    const colZ = -STAND_LEN / 2 + (c / (colCount - 1)) * STAND_LEN;
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, roofY, 8),
      colMat
    );
    col.position.set(colX, roofY / 2, colZ);
    col.castShadow = true;
    scene.add(col);
  }

  // Werbebanden entlang der Vorderfront (unten)
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
