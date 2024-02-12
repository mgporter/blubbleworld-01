import { Matrix4, Scene, Vector3 } from "three";
import { NoiseMaker } from "./NoiseMaker";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";
import { InstancedGrassCube } from "../objects/InstancedGrassCube";
import { InstancedPondCube } from "../objects/InstancedPondCube";
import { InstancedFoundationCube } from "../objects/InstancedFoundationCube";
import { InstancedMountainCube } from "../objects/InstancedMountainCube";

import { C } from "../Constants";

type TerrainCounts = {
  TOTAL: number,
  POND: number,
  GRASS: number,
  MOUNTAIN: number,
}

class Board {

  #noiseMaker;
  #perlinGrid;
  #selectables: SelectableInstancedMesh[];
  #cubeCounts: TerrainCounts;

  constructor(worldsizeX: number, worldsizeY: number, pondPercent: number, mountainPercent: number, seed: number | null) {

    this.#noiseMaker = new NoiseMaker(worldsizeX, worldsizeY);
    if (seed) this.#noiseMaker.setSeed(seed);
    this.#perlinGrid = this.#noiseMaker.generatePerlinGrid();
    this.#selectables = [];

    // Create cube counts
    if ((pondPercent + mountainPercent) > 100) 
      throw new Error("Pond and mountain values cannot exceed 100%");

    const totalCubes = worldsizeX * worldsizeY;
    const pondCubes = Math.round(totalCubes * (pondPercent / 100));
    const mountainCubes = Math.round(totalCubes * (mountainPercent / 100));
    const grassCubes = totalCubes - (pondCubes + mountainCubes);

    this.#cubeCounts = {
      TOTAL: totalCubes,
      POND: pondCubes,
      GRASS: grassCubes,
      MOUNTAIN: mountainCubes,
    }

  }

  addBoardToScene(scene: Scene) {

    const length = this.#perlinGrid.length;
    const width = this.#perlinGrid[0].length;

    const [pondBreakpoint, grassBreakpoint] = 
      this.#noiseMaker.getBreakPoints(this.#cubeCounts.POND, this.#cubeCounts.GRASS);
    
    const instancedGrassCube = new InstancedGrassCube(this.#cubeCounts.GRASS);
    const instancedPondCube = new InstancedPondCube(this.#cubeCounts.POND);
    const instancedMountainCube = new InstancedMountainCube(this.#cubeCounts.MOUNTAIN);
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

        if (perlinValue < pondBreakpoint && pondCubeCount < this.#cubeCounts.POND) {
          // Create pond instance
          instancedPondCube.setMatrixAt(pondCubeCount, matrix);
          instancedPondCube.setCoordinates(pondCubeCount, new Vector3(-i, -j, 0));
          pondCubeCount++;
        } 
        else if (perlinValue < grassBreakpoint && grassCubeCount < this.#cubeCounts.GRASS) {
          // Create Grass instance
          instancedGrassCube.setMatrixAt(grassCubeCount, matrix);
          instancedGrassCube.setCoordinates(grassCubeCount, new Vector3(-i, -j, 0));
          grassCubeCount++;
        } 
        else if (mountainCubeCount < this.#cubeCounts.MOUNTAIN) {
          // Create Mountain instance
          const matrixCopy = matrix.clone();
          
          const ratio = (perlinValue - grassBreakpoint) / (this.#noiseMaker.getMax() - grassBreakpoint);
          const scaleFactor = Math.max((ratio * C.mountainHeightMultiplier) + 1.1, 1.2);

          matrixCopy.scale(new Vector3(1, 1, scaleFactor));
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

  getSelectables() {
    return this.#selectables;
  }

}

export { Board };