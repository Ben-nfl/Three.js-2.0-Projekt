import * as THREE from 'three';

export function createTreasure(scene, materials) {
  const group = new THREE.Group();
  group.position.set(2, 0, -4);

  // BoxGeometry #5 - Treasure chest body
  const chestGeo = new THREE.BoxGeometry(1.2, 0.6, 0.7);
  const chest = new THREE.Mesh(chestGeo, materials.wood);
  chest.position.y = 0.3;
  chest.castShadow = true;
  chest.receiveShadow = true;
  group.add(chest);

  // Chest lid (animiert: langsam öffnen/schließen)
  // Pivot-Punkt am hinteren Rand via Sub-Group
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.6, -0.35);
  group.add(lidPivot);

  const lidGeo = new THREE.BoxGeometry(1.2, 0.15, 0.7);
  const lid = new THREE.Mesh(lidGeo, materials.wood);
  lid.position.set(0, 0.075, 0.35);
  lid.castShadow = true;
  lidPivot.add(lid);

  // Metal bands on chest
  const bandGeo = new THREE.BoxGeometry(1.25, 0.08, 0.72);
  const band1 = new THREE.Mesh(bandGeo, materials.metal);
  band1.position.set(0, 0.15, 0);
  group.add(band1);
  const band2 = new THREE.Mesh(bandGeo, materials.metal);
  band2.position.set(0, 0.45, 0);
  group.add(band2);

  // CylinderGeometry #6 - Gold coins (scattered)
  const coinGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16);
  for (let i = 0; i < 8; i++) {
    const coin = new THREE.Mesh(coinGeo, materials.gold);
    coin.position.set(
      (Math.sin(i * 1.7) * 0.4),
      0.62 + i * 0.02,
      (Math.cos(i * 2.3) * 0.2)
    );
    coin.rotation.x = Math.random() * 0.3;
    coin.rotation.z = Math.random() * 0.3;
    coin.castShadow = true;
    group.add(coin);
  }

  // LatheGeometry #7 - Golden goblet
  const gobletPoints = [];
  gobletPoints.push(new THREE.Vector2(0.15, 0));
  gobletPoints.push(new THREE.Vector2(0.12, 0.02));
  gobletPoints.push(new THREE.Vector2(0.04, 0.08));
  gobletPoints.push(new THREE.Vector2(0.03, 0.15));
  gobletPoints.push(new THREE.Vector2(0.04, 0.2));
  gobletPoints.push(new THREE.Vector2(0.08, 0.25));
  gobletPoints.push(new THREE.Vector2(0.12, 0.35));
  gobletPoints.push(new THREE.Vector2(0.12, 0.38));
  gobletPoints.push(new THREE.Vector2(0.11, 0.38));

  const gobletGeo = new THREE.LatheGeometry(gobletPoints, 24);
  const goblet = new THREE.Mesh(gobletGeo, materials.gold);
  goblet.position.set(-0.3, 0.6, 0.1);
  goblet.castShadow = true;
  group.add(goblet);

  scene.add(group);

  return { group, goblet, chest, lidPivot };
}

export function updateTreasure(treasure, time) {
  // Auto-rotate the goblet
  treasure.goblet.rotation.y = time * 0.5;

  // Truhendeckel langsam öffnen/schließen (Sinus-Zyklus)
  // Bereich: -0.1 (fast geschlossen) bis -1.2 (weit offen)
  const lidAngle = -0.15 + Math.sin(time * 0.3) * -0.5 - 0.5;
  treasure.lidPivot.rotation.x = lidAngle;
}
