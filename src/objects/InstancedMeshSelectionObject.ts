import { Vector3 } from "three";

class InstancedMeshSelectionObject {

  isSelectable = true;
  isSelected = false;
  #coordinates = new Vector3();

  constructor(isSelectable: boolean) {
    this.isSelectable = isSelectable;
  }

  getCoordinates() {
    return this.#coordinates;
  }

  setCoordinates(coordinates: Vector3) {
    this.#coordinates = coordinates;
  }

}

export { InstancedMeshSelectionObject };