import { Vector3 } from "three";
import { GridCube } from "./GridCube";

class PondCube extends GridCube {
  
  constructor(length: number, width: number, coordinates: Vector3, id: number) {
    super(length, width, coordinates, {
      color: 0x00d3ff,
      transparency: 0.8,
      selectable: false,
    });
    this.name = `PondCube at [${coordinates.x}, ${coordinates.y}, ${coordinates.z}]`;
    this.setId(id);
  }

}

export { PondCube };