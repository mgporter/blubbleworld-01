import { BufferGeometry, Material, Mesh, Vector3 } from "three";

class SelectableMesh extends Mesh {

  #isSelectable = true;
  #isSelected = false;
  #coordinates;

  constructor(geometry: BufferGeometry, material: Material, coordinates?: Vector3, selectable?: boolean) {
    super(geometry, material);
    this.#isSelectable = selectable == null ? true : selectable;
    this.#coordinates = coordinates ? coordinates : new Vector3();
  }

  getCoordinates() {
    return this.#coordinates;
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
    this.changeToSelectedAppearance();
  }

  unselect() {
    this.#isSelected = false;
    this.changeToUnselectedAppearance();
  }

  toggleSelect() {
    if (!this.#isSelectable) return;
    if (this.#isSelected) this.changeToUnselectedAppearance();
    else this.changeToSelectedAppearance();
    this.#isSelected = !this.#isSelected;
  }

  // Hooks to implement later
  changeToSelectedAppearance() {}

  changeToUnselectedAppearance() {}

  changeToHoverAppearance() {}

}

export { SelectableMesh };