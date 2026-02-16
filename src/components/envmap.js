import * as THREE from 'three';

// Prozedurale CubeMap für Metall/Gold-Reflektionen
export function createEnvMap(renderer) {
  const size = 128;

  // Erzeuge 6 Canvas-Faces für CubeTexture
  const faces = [];
  const colors = [
    { r: 30, g: 20, b: 15 },  // +X (rechte Wand, warm)
    { r: 25, g: 18, b: 12 },  // -X (linke Wand)
    { r: 20, g: 15, b: 10 },  // +Y (Decke, dunkel)
    { r: 35, g: 25, b: 18 },  // -Y (Boden, etwas heller)
    { r: 28, g: 20, b: 14 },  // +Z (hintere Wand)
    { r: 22, g: 16, b: 11 },  // -Z (vordere Wand)
  ];

  for (let f = 0; f < 6; f++) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const c = colors[f];

    // Gradient für jede Face
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        // Leichte Variation + warm-oranger Hotspot (simuliert Fackellicht)
        const dx = (x / size - 0.5);
        const dy = (y / size - 0.5);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hotspot = Math.max(0, 1 - dist * 2.5);
        const noise = (Math.sin(x * 7.3 + y * 11.7) * 0.5 + 0.5) * 8;

        data[i] = Math.min(255, c.r + hotspot * 80 + noise);
        data[i + 1] = Math.min(255, c.g + hotspot * 40 + noise * 0.5);
        data[i + 2] = Math.min(255, c.b + hotspot * 15 + noise * 0.3);
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    faces.push(canvas);
  }

  const cubeTexture = new THREE.CubeTexture(faces);
  cubeTexture.needsUpdate = true;

  return cubeTexture;
}

export function applyEnvMap(envMap, materials) {
  // Gold und Metal bekommen die Environment-Map
  materials.gold.envMap = envMap;
  materials.gold.envMapIntensity = 0.6;

  materials.metal.envMap = envMap;
  materials.metal.envMapIntensity = 0.4;

  // Kristall bekommt dezente Reflektionen
  materials.crystal.envMap = envMap;
  materials.crystal.envMapIntensity = 0.3;
}
