import { Color } from "three";
import { InstancedGridCube } from "./InstancedGridCube";

class InstancedGrassCube extends InstancedGridCube {

  constructor(count: number, length?: number, width?: number, depth?: number, ) {

    const options = {
      color: new Color(0x2fcc00),
      selectedColor: new Color(0x2fcc00).multiplyScalar(0.2),
      hoverColor: new Color(0x2fcc00).multiplyScalar(0.5),
      rejectedColor: new Color(0xcc6a00),
      transparency: 1,
      selectable: true,
    }

    super(length || 1, width || 1, depth || 1, count, options);

    this.name = "InstancedGrassCube";
    this.displayName = "Grass";
  }

}

export { InstancedGrassCube } ;