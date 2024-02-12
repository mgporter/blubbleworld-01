import { Color } from "three";
import { InstancedGridCube } from "./InstancedGridCube";

class InstancedFoundationCube extends InstancedGridCube {

  constructor(count: number, length?: number, width?: number, depth?: number, ) {

    const options = {
      color: new Color(0xab7300),
      selectable: false,
    }

    super(length || 1, width || 1, depth || 1, count, options, false);

    this.name = "InstancedFoundationCube";
    this.displayName = "foundation";
  }

}

export { InstancedFoundationCube } ;