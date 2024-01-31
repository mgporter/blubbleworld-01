import { Vector3 } from "three";

class InstancedMeshSelectionObject {

  #isSelectable = true;
  #isSelected = false;
  #index;
  #coordinates = new Vector3();
  #instancedMeshRef;

  constructor(
    isSelectable: boolean, 
    index: number,
    instancedMeshRef: object,
    changeToSelectedAppearance: (idx: number) => void,
    changeToUnselectedAppearance: (idx: number) => void,
    changeToHoverAppearance: (idx: number) => void) {

    this.#isSelectable = isSelectable;
    this.#index = index;
    this.#instancedMeshRef = instancedMeshRef;
    this.changeToSelectedAppearance = changeToSelectedAppearance;
    this.changeToUnselectedAppearance = changeToUnselectedAppearance;
    this.changeToHoverAppearance = changeToHoverAppearance;

  }

  getInstancedMesh() {
    return this.#instancedMeshRef;
  }

  getCoordinates() {
    return this.#coordinates;
  }

  setCoordinates(coordinates: Vector3) {
    this.#coordinates = coordinates;
  }

  isSelectable() {
    return this.#isSelectable;
  }

  setSelectable(val: boolean) {
    if (!this.#isSelectable) return;
    this.#isSelectable = val;
    if (!val) this.#isSelected = false;
  }

  isSelected() {
    return this.#isSelected;
  }

  select() {
    if (!this.#isSelectable) return;
    this.#isSelected = true;
    this.changeToSelectedAppearance(this.#index);
  }

  unselect() {
    this.#isSelected = false;
    this.changeToUnselectedAppearance(this.#index);
  }

  toggleSelect() {
    if (!this.#isSelectable) return;
    if (this.#isSelected) this.changeToUnselectedAppearance(this.#index);
    else this.changeToSelectedAppearance(this.#index);
    this.#isSelected = !this.#isSelected;
  }

  // Hooks to implement later
  changeToSelectedAppearance(index: number) {}

  changeToUnselectedAppearance(index: number) {}

  changeToHoverAppearance(index: number) {}

}

export { InstancedMeshSelectionObject };