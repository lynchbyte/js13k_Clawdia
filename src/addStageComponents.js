import * as THREE from "three"

import { stage, } from './script.js';
import { gradientMateriail } from "./addHelpers.js";


export function addSkySphere() {

  const geometry = new THREE.SphereGeometry(stage.world.width / 2, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);

  const skyMat = gradientMateriail(stage.colObj.c5, stage.colObj.c9,);//bottom, top
  skyMat.side = THREE.BackSide

  const mesh = new THREE.Mesh(geometry, skyMat);

  mesh.position.set(0, stage.world.moveDown, 0);

  stage.worldGroup.add(mesh);


}

export function addWorldFloor() {

  const geo = new THREE.CircleGeometry(stage.world.width / 2, 32);

  const make = (col, layer) => {
    const mat = new THREE.MeshBasicMaterial({ color: col });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = stage.world.moveDown;
    mesh.layers.set(layer);
    return mesh;
  };

  stage.worldGroup.add(

    make(stage.colObj.c3, 0), //for scene

    make(stage.colObj.c10, 3) //for huds display

  );

}

export function addMaze() {

  const hudMazeMaterial = new THREE.MeshStandardMaterial({

    color: stage.colObj.c11,
    flatShading: true,
    side: THREE.DoubleSide

  });

  const sceneMazeMaterial = new THREE.MeshStandardMaterial({

    color: stage.colObj.c4,
    flatShading: true,
    side: THREE.DoubleSide,

  });


  const wallHeight = 5,
    pointsWall = [],//for lathe geometry
    pointsFloor = [],//for lathe geometry
    colliders = [],
    allWalls = [];

  const extrudeSettings = {
    steps: 1,
    depth: wallHeight,
    bevelEnabled: false,
  };

  //Wall 1
  const wall1 = {
    radius: 45,
    walkwayAng: 18 * Math.PI / 180,
    panelsToMakeOneSegment: 4,
    numOfSegments: 4,
    jumpInStartAngle: 360 / 4 * Math.PI / 180, // 90 degrees  //360 divide by numOfSements
    offsetFromCentreline: 45 * Math.PI / 180 / 2,  //-22.5

    Floor_Inner: 36,
    Floor_Outer: 52
  }

  const wall2 = {
    radius: 80,
    walkwayAng: 10 * Math.PI / 180,
    panelsToMakeOneSegment: 6,
    numOfSegments: 5,
    jumpInStartAngle: 360 / 5 * Math.PI / 180, // 72 degrees
    offsetFromCentreline: 45 * Math.PI / 180 / 2, //22.5
    Floor_Inner: 72,
    Floor_Outer: 87
  }

  const wall3 = {
    radius: 115,
    walkwayAng: 10 * Math.PI / 180,
    panelsToMakeOneSegment: 6,
    numOfSegments: 5,
    jumpInStartAngle: 360 / 5 * Math.PI / 180, // 
    offsetFromCentreline: 10 * Math.PI / 180 / 2,

    Floor_Inner: 106,
    Floor_Outer: 123
  }

  const wall4 = {

    Floor_Inner: 140,
    Floor_Outer: 155

  }

  allWalls.push(wall1, wall2, wall3)

  allWalls.forEach((ob) => {

    //walls for aabb boxes calcs
    const pointA = new THREE.Vector2(ob.radius, stage.world.moveDown);
    const pointB = new THREE.Vector2(ob.radius, wallHeight);

    pointsWall.push(pointA, pointB);

    const geometryWall = new THREE.LatheGeometry(pointsWall, 1, 0, ob.walkwayAng);

    const wall = new THREE.Mesh(geometryWall, hudMazeMaterial);
    wall.visible = false;
    pointsWall.length = 0;

    //floor for hus display
    const pointC = new THREE.Vector2(ob.Floor_Inner, stage.world.moveDown + 0.01);
    const pointD = new THREE.Vector2(ob.Floor_Outer, stage.world.moveDown + 0.01);

    pointsFloor.push(pointC, pointD);

    const geometryFloor = new THREE.LatheGeometry(pointsFloor, 1, 0, ob.walkwayAng);

    const floor = new THREE.Mesh(geometryFloor, hudMazeMaterial);
    floor.position.set(0, wallHeight + 0.1, 0);
    floor.layers.set(3);

    pointsFloor.length = 0;

    for (let j = 0; j < ob.numOfSegments; j++) {

      const startAngle = j * ob.jumpInStartAngle + ob.offsetFromCentreline;

      for (let i = 0; i < ob.panelsToMakeOneSegment; i++) {

        const angle = i * ob.walkwayAng + startAngle;


        const panelMesh = wall.clone();
        const panelFloorMesh = floor.clone();

        panelMesh.rotateY(angle);
        panelFloorMesh.rotateY(angle);

        stage.worldGroup.add(panelMesh, panelFloorMesh);

        const box = new THREE.Box3().setFromObject(panelMesh);
        colliders.push(box);

        // let boxHelper = new THREE.Box3Helper(box, new THREE.Color(0xff0000));
        // stage.scene.add(boxHelper);

      }

    }


  });

  //Wall 4
  const ringGeo = new THREE.RingGeometry(wall4.Floor_Inner, wall4.Floor_Outer, 360 / 18)
  const ringMesh = new THREE.Mesh(ringGeo, hudMazeMaterial);
  ringMesh.rotateX(90 * Math.PI / 180)
  ringMesh.position.set(0, stage.world.moveDown + 0.1, 0);
  ringMesh.layers.set(3);
  stage.worldGroup.add(ringMesh);

  //walls for scene
  allWalls.forEach((ob) => {

    const wallShape = new THREE.Shape();

    const arcForSegment = ob.walkwayAng * ob.panelsToMakeOneSegment;

    wallShape.moveTo(ob.Floor_Inner, 0); // Start at inner radius on the X-axis
    wallShape.absarc(0, 0, ob.Floor_Inner, 0, arcForSegment, false); // Inner arc
    wallShape.lineTo(ob.Floor_Outer * Math.cos(arcForSegment), ob.Floor_Outer * Math.sin(arcForSegment)); // Line to outer arc
    wallShape.absarc(0, 0, ob.Floor_Outer, arcForSegment, 0, true); // Outer arc (drawn backwards)

    const wallGeometry = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);

    wallGeometry.rotateX(-Math.PI / 2);

    wallGeometry.translate(0, stage.world.moveDown + 0.01, 0);

    const wallShowpo = new THREE.Mesh(wallGeometry, sceneMazeMaterial);

    for (let j = 0; j < ob.numOfSegments; j++) {

      const startAngle = j * ob.jumpInStartAngle + ob.offsetFromCentreline;

      const panelWallMesh = wallShowpo.clone();
      panelWallMesh.rotateY(startAngle - 90 * Math.PI / 180); //-90 to line up with floor segments

      stage.worldGroup.add(panelWallMesh);

    }

  });


  return colliders;

}


export function addClaw() {

  const claw = new THREE.Group();

  const extrudeSettingsPink = { depth: 2.5 };
  const pinkMat = new THREE.MeshBasicMaterial({ color: 'pink' });
  const talonGeo = new THREE.ConeGeometry(1, 3, 4);
  const talonMat = new THREE.MeshBasicMaterial({ color: 'DarkKhaki' });

  const handPoints = [[3, 0], [3, 3], [8, 13], [8, 15], [7, 17], [5, 18], [5, 19], [4, 20], [3, 21], [1, 21], [-1, 19], [-2, 20], [-4, 20], [-5, 18], [-8, 16], [-8, 13], [-6, 10], [-3, 4], [-3, 0], [3, 0]];
  const pinkPadPoints = [
    [[-7, 14], [-6, 13], [-5, 13], [-4, 14], [-4, 15], [-5, 16], [-6, 16], [-7, 15], [-7, 14]],
    [[-4, 17], [-3, 15], [-2, 15], [-1, 16], [-1, 18], [-2, 19], [-3, 19], [-4, 18], [-4, 17]],
    [[1, 17], [2, 15], [3, 15], [4, 18], [4, 19], [3, 20], [2, 20], [1, 19], [1, 17]],
    [[4, 14], [5, 13], [6, 13], [7, 14], [7, 15], [6, 16], [5, 16], [4, 15], [4, 14]],
    [[-3, 9], [-3, 10], [-2, 11], [-2, 12], [-1, 13], [2, 13], [3, 12], [3, 11], [4, 10], [4, 9], [2, 7], [-2, 7]]
  ];
  const talonPositions = [[-7, 18, 1], [-3, 21, 1], [2, 22, 1], [6, 19, 1]];

  const handShape = new THREE.Shape(handPoints.map(p => new THREE.Vector2(...p)));
  claw.add(new THREE.Mesh(new THREE.ExtrudeGeometry(handShape, { depth: 2, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }), new THREE.MeshBasicMaterial({ color: 'black' })));

  pinkPadPoints.forEach(points => {

    const shape = new THREE.Shape();
    shape.moveTo(...points[0]);
    points.slice(1).forEach(p => shape.lineTo(...p));
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, extrudeSettingsPink), pinkMat);
    claw.add(mesh.translateZ(0.5));

  });

  talonPositions.forEach(pos => {

    const mesh = new THREE.Mesh(talonGeo, talonMat);
    mesh.position.set(...pos);
    claw.add(mesh);

  });

  claw.rotateX(THREE.MathUtils.degToRad(-85));
  claw.scale.set(0.015, 0.015, 0.015);

  return claw;

}


export function addPillow() {
  const grp = new THREE.Group(),
    r = 4, //cone radius
    h = 0.5, //cone height
    segR = 8, //cone segments radius
    tR = 0.2, //tube radius
    tS = 50; //tube segments
  const cone = new THREE.ConeGeometry(r, h, segR, 1, true),//pillow base
    torus = new THREE.TorusGeometry(r, tR, tS, segR),//fillet in corners
    cyl = new THREE.CylinderGeometry(r + tR, r + tR, h, segR, 1, true),//side
    circ = new THREE.CircleGeometry(r * 0.05, 64);//button

  const mat = new THREE.MeshStandardMaterial({ color: stage.colObj.c7, flatShading: true, side: THREE.DoubleSide }),
    matBtn = new THREE.MeshStandardMaterial({ color: stage.colObj.c8, flatShading: true, side: THREE.DoubleSide, roughness: .5 });

  const top = new THREE.Mesh(cone, mat),
    corner = new THREE.Mesh(torus, mat),
    side = new THREE.Mesh(cyl, mat),
    btn = new THREE.Mesh(circ, matBtn);

  corner.rotation.set(Math.PI / 2, 0, (2 * Math.PI / segR));
  corner.translateZ(tR);
  btn.rotation.x = Math.PI / 2; btn.position.y = .2;

  grp.add(top, corner, side, btn);
  grp.rotation.x = Math.PI; grp.position.y = stage.world.moveDown + .5;
  stage.scene.add(grp);
}
