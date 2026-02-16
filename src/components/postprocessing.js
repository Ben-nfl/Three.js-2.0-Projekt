import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import * as THREE from 'three';

export function createPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);

  // Standard-Render-Pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Bloom für Kristall-Leuchten und Fackelschein
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.6,   // strength
    0.4,   // radius
    0.85   // threshold
  );
  composer.addPass(bloomPass);

  // Output-Pass (für korrektes Tonemapping)
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // Resize-Handler
  window.addEventListener('resize', () => {
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  return { composer, bloomPass };
}
