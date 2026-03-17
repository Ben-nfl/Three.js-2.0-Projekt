import GUI from 'lil-gui';

export function createGUI(raceLights, bloomPass, renderer, scene, carParams) {
  // lichter aus dem raceLights-objekt auspacken
  const { sun, hemi, ambient, spotlights } = raceLights;

  // haupt-gui panel erstellen
  const gui = new GUI({ title: 'Race Track Controls' });

  // --- atmosphäre ---
  const atmoFolder = gui.addFolder('Atmosphere');

  // nebeldichte: 0 = kein nebel, 0.03 = sehr dichter nebel
  atmoFolder.add(scene.fog, 'density', 0, 0.03, 0.0005).name('Fog Density');

  // nebelfarbe live ändern
  atmoFolder
    .addColor({ color: '#9dd5f0' }, 'color')
    .name('Fog Color')
    .onChange((v) => scene.fog.color.set(v));

  // belichtung: steuert gesamthelligkeit des renderers
  atmoFolder
    .add(renderer, 'toneMappingExposure', 0.3, 3.0, 0.05)
    .name('Exposure');

  // --- sonne ---
  const sunFolder = gui.addFolder('Sun');

  // sonnenhelligkeit
  sunFolder.add(sun, 'intensity', 0, 6, 0.1).name('Intensity');

  // sonnenfarbe live ändern
  sunFolder
    .addColor({ color: '#fff5e0' }, 'color')
    .name('Color')
    .onChange((v) => sun.color.set(v));

  // --- füllichter ---
  const fillFolder = gui.addFolder('Fill Lights');

  // hemisphärenlicht (himmel/boden)
  fillFolder.add(hemi, 'intensity', 0, 3, 0.05).name('Hemisphere');

  // ambientes licht (grundhelligkeit)
  fillFolder.add(ambient, 'intensity', 0, 2, 0.05).name('Ambient');

  // --- flutlichter ---
  const floodFolder = gui.addFolder('Floodlights');

  // alle 4 spotlights gleichzeitig über einen regler steuern
  const floodParams = { intensity: spotlights[0].intensity };
  floodFolder
    .add(floodParams, 'intensity', 0, 200, 1)
    .name('Intensity')
    .onChange((v) => spotlights.forEach((s) => (s.intensity = v)));

  // --- bloom (leuchthalo) ---
  const bloomFolder = gui.addFolder('Bloom');

  // stärke des glüheffekts
  bloomFolder.add(bloomPass, 'strength', 0, 1.5, 0.01).name('Strength');

  // schwellenwert: nur pixel heller als dieser wert bekommen bloom
  bloomFolder.add(bloomPass, 'threshold', 0, 1, 0.01).name('Threshold');

  // radius: wie weit der bloom-effekt strahlt
  bloomFolder.add(bloomPass, 'radius', 0, 1, 0.01).name('Radius');

  // --- auto ---
  const carFolder = gui.addFolder('Car');

  // fahrgeschwindigkeit in runden pro sekunde
  carFolder.add(carParams, 'speed', 0.01, 0.6, 0.01).name('Speed (rounds/s)');

  // weniger wichtige ordner standardmäßig eingeklappt
  fillFolder.close();
  floodFolder.close();
  bloomFolder.close();

  return gui;
}
