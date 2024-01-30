import { BoxGeometry, Color, IcosahedronGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Object3D, Scene, Vector3 } from "three";
import { GrassCube } from "../objects/GrassCube";
import { PondCube } from "../objects/PondCube";
import { FoundationCube } from "../objects/FoundationCube";
import { SelectableMesh } from "../objects/SelectableMesh";


import { NoiseMaker } from "./NoiseMaker";
import { GridCube } from "../objects/GridCube";
import { InstancedGridCube } from "../objects/InstancedGridCube";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";


class Board {

  #noiseMaker;
  #perlinGrid;
  #pondThreshold;
  #selectables: SelectableMesh[];
  #instancedSelectables: SelectableInstancedMesh[];

  constructor(zSize: number, xSize: number, pondPercent: number) {

    this.#noiseMaker = new NoiseMaker(zSize, xSize);
    this.#perlinGrid = this.#noiseMaker.generatePerlinGrid();
    this.#pondThreshold = this.#noiseMaker.getNumberAtPercentile(pondPercent);
    this.#selectables = [];
    this.#instancedSelectables = [];

  }

  addBoardToScene(scene: Scene) {

    const maxCount = this.#perlinGrid.length * this.#perlinGrid[0].length;
    const numberOfPondCubes = this.#perlinGrid
      .map(x => x.filter(y => y <= this.#pondThreshold).length)
      .reduce((acc, cur) => acc + cur, 0);
    
    const instancedMesh = new InstancedGridCube(1, 1, maxCount, {});

    const matrix = new Matrix4();
    
    let count = 0;
    for (let i = 0; i < this.#perlinGrid.length; i++) {
      for (let j = 0; j < this.#perlinGrid[0].length; j++) {

        matrix.setPosition(-i, -j, 0);
        instancedMesh.setMatrixAt(count, matrix);
        instancedMesh.setCoordinates(count, new Vector3(-i, -j, 0));

        if (this.#perlinGrid[i][j] <= this.#pondThreshold) {
          instancedMesh.setColorAt(count, new Color(0x00d3ff));
        } else {
          instancedMesh.setColorAt(count, new Color(0x2fcc00));
        }

        count++;
      }
    }
    instancedMesh.instanceColor.needsUpdate = true;

    scene.add(instancedMesh);
    this.#instancedSelectables.push(instancedMesh);

    // const newMatrix = new Matrix4();
    // instancedMesh.getMatrixAt(208, newMatrix);
    // const vector = new Vector3().setFromMatrixPosition(newMatrix);
    // console.log(vector);
    // // instancedMesh.setMatrixAt(208, new Matrix4().setPosition(9.6, 0, 24));
    // instancedMesh.setMatrixAt(208, newMatrix.setPosition(9.6,0,24));
    // // newMatrix.makeTranslation(new Vector3(0, -2, 0));
    // // instancedMesh.setMatrixAt(208, newMatrix);
    // instancedMesh.instanceMatrix.needsUpdate = true;
    

    // for (let i = 0; i < this.#perlinGrid.length; i++) {
    //   for (let j = 0; j < this.#perlinGrid[0].length; j++) {
    //     const value = this.#perlinGrid[i][j];

    //     const cube = (value <= this.#pondThreshold) ?
    //       new PondCube(1, 1, new Vector3(j, 0, i), count++) : 
    //       new GrassCube(1, 1, new Vector3(j, 0, i), count++);

    //     cube.position.x = j;
    //     cube.position.z = i;
    //     scene.add(cube);
    //     this.#selectables.push(cube);

    //     if (i === 0 || 
    //       i === this.#perlinGrid.length - 1 ||
    //       j === 0 ||
    //       j === this.#perlinGrid[0].length - 1) {
    //         const foundation = new FoundationCube(1, 1, new Vector3(j, -1, i));
    //         foundation.position.set(j, -1.5, i);
    //         scene.add(foundation);
    //       }
          
    //   }
    // }
  }

  getSelectables() {
    return this.#selectables;
  }

  getInstancedSelectables() {
    return this.#instancedSelectables;
  }

}

export { Board };