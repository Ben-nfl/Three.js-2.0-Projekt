import * as THREE from 'three';
import {
  createHeightMap,
  createNormalMap,
  createWoodTexture,
  createStoneColorTexture,
} from './textures.js';

export function createMaterials() {
  const heightMap = createHeightMap();
  const normalMap = createNormalMap();
  const woodTexture = createWoodTexture();
  const stoneColorTexture = createStoneColorTexture();

  // UV-Repeat Anpassungen für Wände
  stoneColorTexture.repeat.set(2, 2);
  normalMap.repeat.set(2, 2);

  // 1. Stone wall/pillar material
  const stone = new THREE.MeshStandardMaterial({
    map: stoneColorTexture,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(1.0, 1.0),
    roughness: 0.9,
    metalness: 0.05,
  });

  // 2. Stone floor material (with displacement + feinere UV-Repeats)
  const floorColorTex = stoneColorTexture.clone();
  floorColorTex.repeat.set(3, 3);
  const floorNormalTex = normalMap.clone();
  floorNormalTex.repeat.set(3, 3);
  heightMap.repeat.set(3, 3);

  const stoneFloor = new THREE.MeshStandardMaterial({
    map: floorColorTex,
    normalMap: floorNormalTex,
    normalScale: new THREE.Vector2(0.8, 0.8),
    displacementMap: heightMap,
    displacementScale: 0.3,
    roughness: 0.95,
    metalness: 0.02,
    color: new THREE.Color(0x555555),
  });

  // 3. Wood material
  const wood = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.75,
    metalness: 0.0,
    color: new THREE.Color(0xA0704A),
  });

  // 4. Metal material
  const metal = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x888899),
    roughness: 0.3,
    metalness: 0.9,
  });

  // 5. Gold material
  const gold = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xFFD700),
    roughness: 0.2,
    metalness: 1.0,
  });

  // 6. Crystal material (physical for translucency)
  const crystal = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x00FFCC),
    emissive: new THREE.Color(0x00FFAA),
    emissiveIntensity: 0.5,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.6,
    thickness: 1.0,
    transparent: true,
    opacity: 0.85,
  });

  // 7. Torch fire material
  const torchFire = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xFF6600),
    emissive: new THREE.Color(0xFF4400),
    emissiveIntensity: 2.0,
    roughness: 0.8,
    metalness: 0.0,
    transparent: true,
    opacity: 0.9,
  });

  // 8. Barrel wood (darker)
  const barrelWood = new THREE.MeshStandardMaterial({
    map: woodTexture.clone(),
    roughness: 0.85,
    metalness: 0.0,
    color: new THREE.Color(0x6B3A20),
  });

  // 9. Ceiling material (dunkler, mit Normal Map für Risse)
  const ceilingColorTex = stoneColorTexture.clone();
  ceilingColorTex.repeat.set(2, 2);
  const ceilingNormalTex = normalMap.clone();
  ceilingNormalTex.repeat.set(2, 2);

  const ceiling = new THREE.MeshStandardMaterial({
    map: ceilingColorTex,
    normalMap: ceilingNormalTex,
    normalScale: new THREE.Vector2(1.2, 1.2),
    roughness: 0.95,
    metalness: 0.02,
    color: new THREE.Color(0x333333),
  });

  return {
    stone,
    stoneFloor,
    wood,
    metal,
    gold,
    crystal,
    torchFire,
    barrelWood,
    ceiling,
    _textures: { heightMap, normalMap, woodTexture, stoneColorTexture },
  };
}
