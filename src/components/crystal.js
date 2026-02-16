import * as THREE from 'three';

export function createCrystal(scene, materials) {
  const group = new THREE.Group();
  group.position.set(0, 2.5, -1);

  // TorusKnotGeometry #12 - outer ring
  const outerRingGeo = new THREE.TorusKnotGeometry(0.8, 0.08, 128, 16, 2, 3);
  const outerRing = new THREE.Mesh(outerRingGeo, materials.crystal);
  outerRing.castShadow = true;
  group.add(outerRing);

  // IcosahedronGeometry #13 - inner core
  const coreGeo = new THREE.IcosahedronGeometry(0.35, 1);
  const core = new THREE.Mesh(coreGeo, materials.crystal.clone());
  core.material.emissiveIntensity = 1.0;
  group.add(core);

  // OctahedronGeometry #14 - 6 orbiting shards
  const shardGeo = new THREE.OctahedronGeometry(0.08, 0);
  const shards = [];

  for (let i = 0; i < 6; i++) {
    const shardMat = materials.crystal.clone();
    shardMat.emissiveIntensity = 0.8;
    const shard = new THREE.Mesh(shardGeo, shardMat);
    group.add(shard);
    shards.push({
      mesh: shard,
      angle: (i / 6) * Math.PI * 2,
      radius: 0.55 + (i % 2) * 0.2,
      speed: 1.0 + (i % 3) * 0.4,
      yOffset: (i % 2 === 0 ? 0.15 : -0.15),
    });
  }

  // Glow sphere (transparent)
  const glowGeo = new THREE.SphereGeometry(0.6, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00FFCC,
    transparent: true,
    opacity: 0.08,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  group.add(glow);

  scene.add(group);

  return { group, outerRing, core, shards, glow };
}

export function updateCrystal(crystal, time, params) {
  const speed = params.rotationSpeed || 1.0;
  const floatHeight = params.floatHeight || 0.5;
  const pulseSpeed = params.pulseSpeed || 1.0;

  // Float the whole group up and down
  crystal.group.position.y = 2.5 + Math.sin(time * pulseSpeed) * floatHeight;

  // Rotate outer ring
  crystal.outerRing.rotation.y = time * speed * 0.5;
  crystal.outerRing.rotation.x = time * speed * 0.3;

  // Counter-rotate and pulse core
  crystal.core.rotation.y = -time * speed * 0.8;
  crystal.core.rotation.z = time * speed * 0.4;
  const pulse = 1.0 + Math.sin(time * pulseSpeed * 2) * 0.15;
  crystal.core.scale.setScalar(pulse);

  // Orbit shards
  if (params.orbitEnabled !== false) {
    crystal.shards.forEach((s) => {
      const angle = s.angle + time * s.speed * speed;
      s.mesh.position.x = Math.cos(angle) * s.radius;
      s.mesh.position.z = Math.sin(angle) * s.radius;
      s.mesh.position.y = s.yOffset + Math.sin(time * 2 + s.angle) * 0.1;
      s.mesh.rotation.x = time * 2;
      s.mesh.rotation.y = time * 3;
    });
  }

  // Pulse glow sphere
  const glowPulse = 1.0 + Math.sin(time * pulseSpeed * 1.5) * 0.2;
  crystal.glow.scale.setScalar(glowPulse);
  crystal.glow.material.opacity = 0.05 + Math.sin(time * pulseSpeed) * 0.04;
}
