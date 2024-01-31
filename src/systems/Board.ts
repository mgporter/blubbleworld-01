import { Matrix4, Scene, Vector3 } from "three";
import { NoiseMaker } from "./NoiseMaker";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";
import { InstancedGrassCube } from "../objects/InstancedGrassCube";
import { InstancedPondCube } from "../objects/InstancedPondCube";
import { InstancedFoundationCube } from "../objects/InstancedFoundationCube";
import { InstancedMountainCube } from "../objects/InstancedMountainCube";


type TerrainCounts = {
  POND: number,
  GRASS: number,
  MOUNTAIN: number,
}

class Board {

  #noiseMaker;
  #perlinGrid;
  #pondThreshold;
  #mountainThreshold;
  #selectables: SelectableInstancedMesh[];

  constructor(zSize: number, xSize: number, pondPercent: number, mountainPercent: number) {

    this.#noiseMaker = new NoiseMaker(zSize, xSize);
    this.#perlinGrid = this.#noiseMaker.generatePerlinGrid();
    this.#selectables = [];
    this.#pondThreshold = this.#noiseMaker.getNumberAtPercentile(pondPercent);
    this.#mountainThreshold = this.#noiseMaker.getNumberAtPercentile(mountainPercent);

  }

  addBoardToScene(scene: Scene) {

    const length = this.#perlinGrid.length;
    const width = this.#perlinGrid[0].length;

    const cubeCounts = this.makeCubeCount();
    
    const instancedGrassCube = new InstancedGrassCube(cubeCounts.GRASS);
    const instancedPondCube = new InstancedPondCube(cubeCounts.POND);
    const instancedMountainCube = new InstancedMountainCube(cubeCounts.MOUNTAIN);
    const instancedFoundationCube = new InstancedFoundationCube((length * 2) + ((width - 2) * 2));

    const matrix = new Matrix4();
    
    let grassCubeCount = 0;
    let pondCubeCount = 0;
    let mountainCubeCount = 0;
    let foundationCubeCount = 0;

    for (let i = 0; i < length; i++) {
      for (let j = 0; j < width; j++) {

        matrix.setPosition(-i, -j, 0);
        const perlinValue = this.#perlinGrid[i][j];

        if (perlinValue <= this.#pondThreshold) {
          // Create pond instance
          instancedPondCube.setMatrixAt(pondCubeCount, matrix);
          instancedPondCube.setCoordinates(pondCubeCount, new Vector3(-i, -j, 0));
          pondCubeCount++;
        } 
        else if (perlinValue <= this.#mountainThreshold) {
          // Create Grass instance
          instancedGrassCube.setMatrixAt(grassCubeCount, matrix);
          instancedGrassCube.setCoordinates(grassCubeCount, new Vector3(-i, -j, 0));
          grassCubeCount++;
        } 
        else {
          // Create Mountain instance
          const matrixCopy = matrix.clone();
          
          const ratio = (perlinValue - this.#mountainThreshold) / (this.#noiseMaker.getMax() - this.#mountainThreshold);
          matrixCopy.scale(new Vector3(1, 1, (ratio * 0.3) + 1));
          instancedMountainCube.setMatrixAt(mountainCubeCount, matrixCopy);
          instancedMountainCube.setCoordinates(mountainCubeCount, new Vector3(-i, -j, 0));
          
          mountainCubeCount++;
        }

        if (i === 0 || 
          i === length - 1 ||
          j === 0 ||
          j === width - 1) {
            matrix.setPosition(-i, -j, -1);
            instancedFoundationCube.setMatrixAt(foundationCubeCount++, matrix);
        }

      }
    }

    scene.add(instancedGrassCube, instancedPondCube, instancedFoundationCube, instancedMountainCube);
    this.#selectables.push(instancedGrassCube);
    this.#selectables.push(instancedPondCube);
    this.#selectables.push(instancedMountainCube);
    
  }

  makeCubeCount(): TerrainCounts {
    const counts = {
      POND: 0,
      GRASS: 0,
      MOUNTAIN: 0,
    }

    this.#perlinGrid.forEach(row => {
      row.reduce((acc, cur) => {
        if (cur <= this.#pondThreshold) acc.POND++;
        else if (cur <= this.#mountainThreshold) acc.GRASS++;
        else acc.MOUNTAIN++;
        return acc;
      }, counts)
    });

    return counts;
  }

  getSelectables() {
    return this.#selectables;
  }

}

export { Board };