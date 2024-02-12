import { Color } from "three";
import { InstancedGridCube } from "./InstancedGridCube";

class InstancedPondCube extends InstancedGridCube {

  constructor(count: number, length?: number, width?: number, depth?: number) {

    const options = {
      color: new Color(0x00d3ff),
      selectedColor: new Color(0x00d3ff).multiplyScalar(0.2),
      hoverColor: new Color(0x00d3ff).multiplyScalar(0.5),
      rejectedColor: new Color(0xcc6a00),
      transparency: 0.8,
      selectable: false,
    }

    super(length || 1, width || 1, depth || 0.8, count, options);

    this.name = "InstancedPondCube";
    this.displayName = "Water";
  }

}

export { InstancedPondCube } ;