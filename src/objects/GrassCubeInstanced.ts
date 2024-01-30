import { InstancedGridCube } from "./InstancedGridCube";

class GrassCubeInstanced extends InstancedGridCube {

  constructor(length: number, width: number, count: number) {

    const properties = {
      color: 0x2fcc00,
      selectedColor: 0x0000ff,
    }

    super(length, width, count, properties);
  }

}