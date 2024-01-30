import { Vector3 } from "three";
import { GridCube } from "./GridCube";

class FoundationCube extends GridCube {
  
  constructor(length: number, width: number, coordinates: Vector3) {
    super(length, width, coordinates, {
      color: 0x9e670c,
      selectable: false,
    });
    this.name = `FoundationCube at [${coordinates.x}, ${coordinates.y}, ${coordinates.z}]`;
  }

}

export { FoundationCube };