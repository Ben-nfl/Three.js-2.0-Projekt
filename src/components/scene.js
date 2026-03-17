import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene(canvas) {
  // neue three.js-szene erstellen
  const scene = new THREE.Scene();

  // hintergrundfarbe auf hellblau setzen (himmel)
  scene.background = new THREE.Color(0x87ceeb);

  // exponentieller nebel – objekte weit hinten verschwinden im dunst
  scene.fog = new THREE.FogExp2(0x9dd5f0, 0.006);

  // perspektivkamera mit 60° sichtfeld
  const camera = new THREE.PerspectiveCamera(
    60,                                  // sichtfeld in grad
    window.innerWidth / window.innerHeight, // seitenverhältnis
    0.1,                                 // nächste sichtbare distanz
    300                                  // weiteste sichtbare distanz
  );

  // startposition der kamera – leicht erhöht und zurückversetzt
  camera.position.set(0, 28, 48);

  // kamera schaut auf den mittelpunkt der szene
  camera.lookAt(0, 0, 0);

  // webgl-renderer auf dem canvas erstellen
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true, // kantenglättung aktivieren
  });

  // renderer auf fenstergröße einstellen
  renderer.setSize(window.innerWidth, window.innerHeight);

  // pixelratio begrenzen (max 2) damit es auf high-dpi screens nicht zu langsam wird
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // schatten aktivieren
  renderer.shadowMap.enabled = true;

  // weiche schatten (pcf = percentage closer filtering)
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // filmisches tonemapping für realistischere farbdarstellung
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // belichtungswert – höher = heller
  renderer.toneMappingExposure = 1.2;

  // orbit-controls: kamera mit maus drehen, zoomen, schwenken
  const controls = new OrbitControls(camera, renderer.domElement);

  // sanftes nachziehen der kamerabewegung
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // drehmittelpunkt im ursprung
  controls.target.set(0, 0, 0);

  // kamera darf nicht unter den boden schauen
  controls.maxPolarAngle = Math.PI * 0.82;

  // zoom-grenzen
  controls.minDistance = 5;
  controls.maxDistance = 90;
  controls.update();

  // bei fenstergrößenänderung kamera und renderer anpassen
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // projektion nach aspect-änderung neu berechnen
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls };
}
