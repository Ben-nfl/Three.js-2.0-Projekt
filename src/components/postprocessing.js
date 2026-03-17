import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import * as THREE from 'three';

export function createPostProcessing(renderer, scene, camera) {
  // effect composer: verwaltet eine kette von nachbearbeitungs-passes
  const composer = new EffectComposer(renderer);

  // erster pass: normale szene rendern (pflicht als basis)
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // zweiter pass: bloom-effekt für leuchtendes licht und sonnenschein
  // parameter: auflösung, stärke, radius, schwellenwert
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.6,   // stärke des leuchteffekts
    0.4,   // radius wie weit der bloom strahlt
    0.85   // schwellenwert: nur sehr helle pixel bekommen bloom
  );
  composer.addPass(bloomPass);

  // letzter pass: korrigiert die farben für die bildschirmausgabe (tonemapping)
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // bei fenstergröße-änderung auflösung des composers anpassen
  window.addEventListener('resize', () => {
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  return { composer, bloomPass };
}
