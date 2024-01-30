import { Vector3 } from "three";
import { GridCube } from "./GridCube";

class GrassCube extends GridCube {

  constructor(length: number, width: number, coordinates: Vector3, id: number) {
    super(length, width, coordinates, {color: 0x2fcc00});
    this.name = `GrassCube at [${coordinates.x}, ${coordinates.y}, ${coordinates.z}]`;
    this.setId(id);
  }

}

export { GrassCube };