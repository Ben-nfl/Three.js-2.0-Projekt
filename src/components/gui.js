import GUI from 'lil-gui';
import * as THREE from 'three';

export function createGUI(params, deps) {
  const { lights, materials, barrels, crystal, camera, controls, renderer, scene, bloomPass } = deps;
  const gui = new GUI({ title: 'Dungeon Controls' });

  // --- Atmosphere ---
  const atmo = gui.addFolder('Atmosphere');
  atmo.add(params, 'fogDensity', 0, 0.15, 0.001).name('Fog Density').onChange((v) => {
    scene.fog.density = v;
  });
  atmo.addColor(params, 'fogColor').name('Fog Color').onChange((v) => {
    scene.fog.color.set(v);
  });
  atmo.add(params, 'ambientIntensity', 0, 1, 0.01).name('Ambient').onChange((v) => {
    lights.ambient.intensity = v;
  });
  atmo.add(params, 'exposure', 0.1, 3, 0.05).name('Exposure').onChange((v) => {
    renderer.toneMappingExposure = v;
  });
  if (bloomPass) {
    atmo.add(params, 'bloomStrength', 0, 2, 0.05).name('Bloom').onChange((v) => {
      bloomPass.strength = v;
    });
    atmo.add(params, 'bloomThreshold', 0, 1, 0.01).name('Bloom Threshold').onChange((v) => {
      bloomPass.threshold = v;
    });
  }

  // --- Torches ---
  const torchFolder = gui.addFolder('Torches');
  torchFolder.add(params, 'torchIntensity', 0, 5, 0.1).name('Intensity');
  torchFolder.addColor(params, 'torchColor').name('Color').onChange((v) => {
    lights.torchLights.forEach((l) => l.color.set(v));
  });
  torchFolder.add(params, 'flickerSpeed', 0.1, 3, 0.1).name('Flicker Speed');
  torchFolder.add(params, 'flickerAmount', 0, 2, 0.1).name('Flicker Amount');

  // --- Crystal ---
  const crystalFolder = gui.addFolder('Crystal');
  crystalFolder.add(params, 'crystalIntensity', 0, 3, 0.1).name('Light Intensity');
  crystalFolder.addColor(params, 'crystalColor').name('Color').onChange((v) => {
    lights.crystalLight.color.set(v);
    crystal.core.material.emissive.set(v);
    crystal.outerRing.material.emissive.set(v);
  });
  crystalFolder.add(params, 'crystalPulseSpeed', 0.1, 3, 0.1).name('Pulse Speed');
  crystalFolder.add(params, 'rotationSpeed', 0.1, 3, 0.1).name('Rotation Speed');
  crystalFolder.add(params, 'floatHeight', 0, 1.5, 0.05).name('Float Height');

  // --- Materials ---
  const matFolder = gui.addFolder('Materials');
  matFolder.addColor(params, 'stoneColor').name('Stone Color').onChange((v) => {
    materials.stone.color.set(v);
  });
  matFolder.add(params, 'stoneRoughness', 0, 1, 0.01).name('Stone Roughness').onChange((v) => {
    materials.stone.roughness = v;
  });
  matFolder.addColor(params, 'woodColor').name('Wood Color').onChange((v) => {
    materials.wood.color.set(v);
  });
  matFolder.add(params, 'goldMetalness', 0, 1, 0.01).name('Gold Metalness').onChange((v) => {
    materials.gold.metalness = v;
  });
  matFolder.addColor(params, 'crystalEmissive').name('Crystal Emissive').onChange((v) => {
    materials.crystal.emissive.set(v);
  });

  // --- Objects ---
  const objFolder = gui.addFolder('Objects');
  objFolder.add(params, 'crateX', -5, 5, 0.1).name('Crate X').onChange((v) => {
    barrels.crate.position.x = v;
  });
  objFolder.add(params, 'crateZ', -5, 5, 0.1).name('Crate Z').onChange((v) => {
    barrels.crate.position.z = v;
  });
  objFolder.add(params, 'barrelRotation', 0, Math.PI * 2, 0.01).name('Barrel Rotation').onChange((v) => {
    barrels.barrel1.rotation.y = v;
    barrels.barrel2.rotation.y = v * 0.7;
  });

  // --- Animation ---
  const animFolder = gui.addFolder('Animation');
  animFolder.add(params, 'animSpeed', 0.1, 3, 0.1).name('Speed');
  animFolder.add(params, 'dustEnabled').name('Dust Particles');
  animFolder.add(params, 'orbitEnabled').name('Crystal Orbit');

  // --- Debug ---
  const debugFolder = gui.addFolder('Debug');
  debugFolder.add(params, 'wireframe').name('Wireframe').onChange((v) => {
    materials.stone.wireframe = v;
    materials.stoneFloor.wireframe = v;
    materials.wood.wireframe = v;
    materials.metal.wireframe = v;
    materials.gold.wireframe = v;
    materials.crystal.wireframe = v;
    materials.barrelWood.wireframe = v;
    if (materials.ceiling) materials.ceiling.wireframe = v;
  });
  debugFolder.add(params, 'showHelpers').name('Light Helpers').onChange((v) => {
    params._helperCallback?.(v);
  });
  debugFolder.add({
    resetCamera: () => {
      camera.position.set(0, 3, 8);
      controls.target.set(0, 1.5, 0);
      controls.update();
    },
  }, 'resetCamera').name('Reset Camera');

  // Start mit einigen Ordnern geschlossen
  matFolder.close();
  objFolder.close();
  debugFolder.close();

  return gui;
}

export function getDefaultParams() {
  return {
    // Atmosphere
    fogDensity: 0.04,
    fogColor: '#0a0808',
    ambientIntensity: 1.2,
    exposure: 2.0,
    bloomStrength: 0.6,
    bloomThreshold: 0.85,

    // Torches
    torchIntensity: 4.0,
    torchColor: '#ff8833',
    flickerSpeed: 1.0,
    flickerAmount: 1.0,

    // Crystal
    crystalIntensity: 1.0,
    crystalColor: '#00ffaa',
    crystalPulseSpeed: 1.0,
    rotationSpeed: 1.0,
    floatHeight: 0.5,

    // Materials
    stoneColor: '#666666',
    stoneRoughness: 0.9,
    woodColor: '#a0704a',
    goldMetalness: 1.0,
    crystalEmissive: '#00ffaa',

    // Objects
    crateX: -3.0,
    crateZ: -2.5,
    barrelRotation: 0,

    // Animation
    animSpeed: 1.0,
    dustEnabled: true,
    orbitEnabled: true,

    // Debug
    wireframe: false,
    showHelpers: false,
  };
}
