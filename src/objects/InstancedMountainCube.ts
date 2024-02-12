import { Color } from "three";
import { InstancedGridCube } from "./InstancedGridCube";

class InstancedMountainCube extends InstancedGridCube {

  constructor(count: number, length?: number, width?: number, depth?: number, ) {

    const options = {
      color: new Color(0x758e99),
      selectedColor: new Color(0x8f8f8f).multiplyScalar(0.2),
      hoverColor: new Color(0x8f8f8f).multiplyScalar(0.5),
      rejectedColor: new Color(0xcc6a00),
      transparency: 1,
      selectable: false,
    }

    super(length || 1, width || 1, depth || 1, count, options);

    this.name = "InstancedMountainCube";
    this.displayName = "mountains";
  }

}

export { InstancedMountainCube } ;