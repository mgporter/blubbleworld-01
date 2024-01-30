import { 
  BufferGeometry,
  InstancedMesh, 
  Material, 
  Vector3} from "three";
  
import { InstancedMeshSelectionObject } from "./InstancedMeshSelectionObject";

class SelectableInstancedMesh extends InstancedMesh {

  #SelectionObjects: InstancedMeshSelectionObject[];

  constructor(
    geometry: BufferGeometry,
    material: Material,
    count: number,
    selectable?: boolean,
    ) {

    super(geometry, material, count);

    this.#SelectionObjects = Array(count).fill(new InstancedMeshSelectionObject(
        selectable == undefined ? true : selectable,
      ));

  }

  getSelectionObjects() {
    return this.#SelectionObjects;
  }

  getCoordinates(index: number) {
    return this.#SelectionObjects[index].getCoordinates();
  }

  setCoordinates(index: number, coordinates: Vector3) {
    return this.#SelectionObjects[index].setCoordinates(coordinates);
  }

  isSelectable(index: number) {
    return this.#SelectionObjects[index].isSelectable;
  }

  setSelectable(index: number, val: boolean) {
    this.#SelectionObjects[index].isSelectable = val;
    if (!val) this.#SelectionObjects[index].isSelected = false;
  }

  isSelected(index: number) {
    return this.#SelectionObjects[index].isSelected;
  }

  select(index: number) {
    if (!this.#SelectionObjects[index].isSelectable) return;
    this.#SelectionObjects[index].isSelected = true;
    this.changeToSelectedAppearance(index);
  }

  unselect(index: number) {
    this.#SelectionObjects[index].isSelected = false;
    this.changeToUnselectedAppearance(index);
  }

  toggleSelect(index: number) {
    if (!this.#SelectionObjects[index].isSelectable) return;
    if (this.#SelectionObjects[index].isSelected) this.unselect(index);
    else this.select(index)
  }

  // Hooks to implement later
  changeToSelectedAppearance(index: number) {}

  changeToUnselectedAppearance(index: number) {}

  changeToHoverAppearance(index: number) {}

}

export { SelectableInstancedMesh };