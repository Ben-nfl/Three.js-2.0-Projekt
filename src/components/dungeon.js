import * as THREE from 'three';

const ROOM_SIZE = 12;
const WALL_HEIGHT = 6;

export function createDungeon(scene, materials) {
  const group = new THREE.Group();

  // Floor (PlaneGeometry #1) - with height map displacement
  const floorGeo = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE, 128, 128);
  const floor = new THREE.Mesh(floorGeo, materials.stoneFloor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // 4 Walls (PlaneGeometry #2)
  const wallGeo = new THREE.PlaneGeometry(ROOM_SIZE, WALL_HEIGHT, 64, 64);

  // Back wall
  const backWall = new THREE.Mesh(wallGeo, materials.stone);
  backWall.position.set(0, WALL_HEIGHT / 2, -ROOM_SIZE / 2);
  backWall.receiveShadow = true;
  group.add(backWall);

  // Front wall
  const frontWall = new THREE.Mesh(wallGeo, materials.stone);
  frontWall.position.set(0, WALL_HEIGHT / 2, ROOM_SIZE / 2);
  frontWall.rotation.y = Math.PI;
  frontWall.receiveShadow = true;
  group.add(frontWall);

  // Left wall
  const leftWallGeo = new THREE.PlaneGeometry(ROOM_SIZE, WALL_HEIGHT, 64, 64);
  const leftWall = new THREE.Mesh(leftWallGeo, materials.stone);
  leftWall.position.set(-ROOM_SIZE / 2, WALL_HEIGHT / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // Right wall
  const rightWall = new THREE.Mesh(leftWallGeo, materials.stone);
  rightWall.position.set(ROOM_SIZE / 2, WALL_HEIGHT / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // Ceiling (eigenes dunkles Material, mehr Segments)
  const ceilingGeo = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE, 32, 32);
  const ceilingMat = materials.ceiling || materials.stone;
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.position.y = WALL_HEIGHT;
  ceiling.rotation.x = Math.PI / 2;
  ceiling.receiveShadow = true;
  group.add(ceiling);

  scene.add(group);
  return group;
}

export { ROOM_SIZE, WALL_HEIGHT };
