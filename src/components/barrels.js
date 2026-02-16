import * as THREE from 'three';

export function createBarrels(scene, materials) {
  const group = new THREE.Group();

  // CylinderGeometry #8 - Wooden barrels
  const barrelGeo = new THREE.CylinderGeometry(0.4, 0.35, 1.0, 16);

  const barrel1 = new THREE.Mesh(barrelGeo, materials.barrelWood);
  barrel1.position.set(-3.5, 0.5, -4);
  barrel1.castShadow = true;
  barrel1.receiveShadow = true;
  scene.add(barrel1);

  const barrel2 = new THREE.Mesh(barrelGeo, materials.barrelWood);
  barrel2.position.set(-4.2, 0.5, -3.5);
  barrel2.castShadow = true;
  barrel2.receiveShadow = true;
  scene.add(barrel2);

  // Metal bands on barrels
  const bandGeo = new THREE.TorusGeometry(0.38, 0.02, 8, 24);
  [barrel1, barrel2].forEach((barrel) => {
    const topBand = new THREE.Mesh(bandGeo, materials.metal);
    topBand.position.copy(barrel.position);
    topBand.position.y += 0.3;
    topBand.rotation.x = Math.PI / 2;
    scene.add(topBand);

    const botBand = new THREE.Mesh(bandGeo, materials.metal);
    botBand.position.copy(barrel.position);
    botBand.position.y -= 0.3;
    botBand.rotation.x = Math.PI / 2;
    scene.add(botBand);
  });

  // BoxGeometry #9 - Wooden crate
  const crateGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const crate = new THREE.Mesh(crateGeo, materials.wood);
  crate.position.set(-3.0, 0.4, -2.5);
  crate.rotation.y = 0.3;
  crate.castShadow = true;
  crate.receiveShadow = true;
  scene.add(crate);

  return { barrel1, barrel2, crate };
}
