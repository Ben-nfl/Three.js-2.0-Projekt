import GUI from 'lil-gui';

export function createGUI(raceLights, bloomPass, renderer, scene, carParams) {
  const { sun, hemi, ambient, spotlights } = raceLights;

  const gui = new GUI({ title: 'Race Track Controls' });

  // --- Atmosphere ---
  const atmoFolder = gui.addFolder('Atmosphere');
  atmoFolder.add(scene.fog, 'density', 0, 0.03, 0.0005).name('Fog Density');
  atmoFolder
    .addColor({ color: '#9dd5f0' }, 'color')
    .name('Fog Color')
    .onChange((v) => scene.fog.color.set(v));
  atmoFolder
    .add(renderer, 'toneMappingExposure', 0.3, 3.0, 0.05)
    .name('Exposure');

  // --- Sun ---
  const sunFolder = gui.addFolder('Sun');
  sunFolder.add(sun, 'intensity', 0, 6, 0.1).name('Intensity');
  sunFolder
    .addColor({ color: '#fff5e0' }, 'color')
    .name('Color')
    .onChange((v) => sun.color.set(v));

  // --- Fill Lights ---
  const fillFolder = gui.addFolder('Fill Lights');
  fillFolder.add(hemi, 'intensity', 0, 3, 0.05).name('Hemisphere');
  fillFolder.add(ambient, 'intensity', 0, 2, 0.05).name('Ambient');

  // --- Floodlights ---
  const floodFolder = gui.addFolder('Floodlights');
  const floodParams = { intensity: spotlights[0].intensity };
  floodFolder
    .add(floodParams, 'intensity', 0, 200, 1)
    .name('Intensity')
    .onChange((v) => spotlights.forEach((s) => (s.intensity = v)));

  // --- Bloom ---
  const bloomFolder = gui.addFolder('Bloom');
  bloomFolder.add(bloomPass, 'strength', 0, 1.5, 0.01).name('Strength');
  bloomFolder.add(bloomPass, 'threshold', 0, 1, 0.01).name('Threshold');
  bloomFolder.add(bloomPass, 'radius', 0, 1, 0.01).name('Radius');

  // --- Car ---
  const carFolder = gui.addFolder('Car');
  carFolder.add(carParams, 'speed', 0.01, 0.6, 0.01).name('Speed (rounds/s)');

  // Start mit geschlossenen Ordnern außer Atmosphere
  fillFolder.close();
  floodFolder.close();
  bloomFolder.close();

  return gui;
}
