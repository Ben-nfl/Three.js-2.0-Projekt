import * as THREE from 'three';

// Procedural height map for the dungeon floor
export function createHeightMap() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base dark gray
  ctx.fillStyle = '#444';
  ctx.fillRect(0, 0, size, size);

  // Multi-octave sine noise for organic bumps
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // Layered sine waves at different frequencies
      let height = 0;
      height += Math.sin(x * 0.05) * Math.sin(y * 0.05) * 30;
      height += Math.sin(x * 0.12 + 1.3) * Math.sin(y * 0.09 + 0.7) * 15;
      height += Math.sin(x * 0.25 + 2.1) * Math.cos(y * 0.22 + 1.5) * 8;

      // Feinere Cobblestone grid (32px statt 64px für mehr Detail)
      const gridSize = 32;
      const gridX = x % gridSize;
      const gridY = y % gridSize;
      const edgeDist = Math.min(gridX, gridSize - gridX, gridY, gridSize - gridY);
      const gridFactor = Math.min(edgeDist / 5, 1.0);
      height += (1 - gridFactor) * -25;

      // Random per-stone offset (seeded by grid cell)
      const cellX = Math.floor(x / gridSize);
      const cellY = Math.floor(y / gridSize);
      const seed = Math.sin(cellX * 127.1 + cellY * 311.7) * 43758.5453;
      const stoneOffset = (seed - Math.floor(seed)) * 15 - 7;
      height += stoneOffset * gridFactor;

      const value = Math.max(0, Math.min(255, 128 + height));
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural normal map for brick/stone surfaces
export function createNormalMap() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Neutral normal (pointing up in tangent space = 128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  const brickW = 64;
  const brickH = 32;
  const mortarWidth = 3;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      const row = Math.floor(y / brickH);
      const offsetX = (row % 2 === 0) ? 0 : brickW / 2;
      const bx = (x + offsetX) % brickW;
      const by = y % brickH;

      let nx = 128;
      let ny = 128;

      // Mortar grooves (create edge normals)
      if (bx < mortarWidth) {
        nx = 100; // normal points left at left edge
      } else if (bx > brickW - mortarWidth) {
        nx = 156; // normal points right at right edge
      }
      if (by < mortarWidth) {
        ny = 156; // normal points up at top edge
      } else if (by > brickH - mortarWidth) {
        ny = 100; // normal points down at bottom edge
      }

      // Random surface noise
      const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      nx += (noise - 0.5) * 10;
      ny += ((noise * 1.7) % 1 - 0.5) * 10;

      data[i] = Math.max(0, Math.min(255, nx));
      data[i + 1] = Math.max(0, Math.min(255, ny));
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural wood grain texture
export function createWoodTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Brown base
  ctx.fillStyle = '#8B5E3C';
  ctx.fillRect(0, 0, size, size);

  // Wood grain lines using bezier curves
  ctx.strokeStyle = 'rgba(60, 35, 15, 0.4)';
  ctx.lineWidth = 1.5;

  for (let i = 0; i < 40; i++) {
    const yBase = (i / 40) * size;
    ctx.beginPath();
    ctx.moveTo(0, yBase);
    ctx.bezierCurveTo(
      size * 0.25, yBase + Math.sin(i * 0.8) * 6,
      size * 0.75, yBase + Math.cos(i * 1.1) * 8,
      size, yBase + Math.sin(i * 0.5) * 4
    );
    ctx.stroke();
  }

  // Subtle color variation
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let j = 0; j < data.length; j += 4) {
    const noise = (Math.random() - 0.5) * 12;
    data[j] = Math.max(0, Math.min(255, data[j] + noise));
    data[j + 1] = Math.max(0, Math.min(255, data[j + 1] + noise * 0.7));
    data[j + 2] = Math.max(0, Math.min(255, data[j + 2] + noise * 0.4));
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural terrain height map (gentle rolling hills for grass ground)
export function createTerrainHeightMap() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let h = 128;
      h += Math.sin(x * 0.018) * Math.sin(y * 0.015) * 45;
      h += Math.sin(x * 0.047 + 1.3) * Math.sin(y * 0.038 + 0.7) * 22;
      h += Math.sin(x * 0.09 + 2.1) * Math.cos(y * 0.082 + 1.5) * 10;
      // subtle pixel noise
      h += ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) * 6 - 3;
      const v = Math.max(0, Math.min(255, h));
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Procedural terrain normal map (derived from terrain height gradient)
export function createTerrainNormalMap() {
  const size = 512;

  // Pre-compute height buffer
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let h = 128;
      h += Math.sin(x * 0.018) * Math.sin(y * 0.015) * 45;
      h += Math.sin(x * 0.047 + 1.3) * Math.sin(y * 0.038 + 0.7) * 22;
      h += Math.sin(x * 0.09 + 2.1) * Math.cos(y * 0.082 + 1.5) * 10;
      heights[y * size + x] = h;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const xl = heights[y * size + Math.max(0, x - 1)];
      const xr = heights[y * size + Math.min(size - 1, x + 1)];
      const yd = heights[Math.max(0, y - 1) * size + x];
      const yu = heights[Math.min(size - 1, y + 1) * size + x];

      const scale = 0.045;
      let nx = (xl - xr) * scale;
      let ny = (yd - yu) * scale;
      const len = Math.sqrt(nx * nx + ny * ny + 1);
      nx /= len; ny /= len;

      data[i]     = Math.max(0, Math.min(255, (nx * 0.5 + 0.5) * 255));
      data[i + 1] = Math.max(0, Math.min(255, (ny * 0.5 + 0.5) * 255));
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Procedural stone color texture
export function createStoneColorTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Gray base
  ctx.fillStyle = '#666';
  ctx.fillRect(0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  const brickW = 64;
  const brickH = 32;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      const row = Math.floor(y / brickH);
      const cellX = Math.floor((x + (row % 2 === 0 ? 0 : brickW / 2)) / brickW);
      const cellY = row;

      // Per-block color variation
      const seed = Math.sin(cellX * 127.1 + cellY * 311.7) * 43758.5453;
      const blockVar = ((seed - Math.floor(seed)) - 0.5) * 30;

      // Subtle moss tint on some blocks
      const mossSeed = Math.sin(cellX * 269.3 + cellY * 183.1) * 43758.5453;
      const hasMoss = (mossSeed - Math.floor(mossSeed)) > 0.7;

      // Per-pixel noise
      const pixelNoise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1 - 0.5) * 15;

      data[i] = Math.max(0, Math.min(255, data[i] + blockVar + pixelNoise + (hasMoss ? -8 : 0)));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + blockVar + pixelNoise + (hasMoss ? 5 : 0)));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + blockVar + pixelNoise + (hasMoss ? -5 : 0)));

      // Mortar lines (darker)
      const bx = (x + (row % 2 === 0 ? 0 : brickW / 2)) % brickW;
      const by = y % brickH;
      if (bx < 2 || bx > brickW - 2 || by < 2 || by > brickH - 2) {
        data[i] *= 0.5;
        data[i + 1] *= 0.5;
        data[i + 2] *= 0.5;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
