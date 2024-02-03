import { BufferGeometry, Material, Mesh, Vector3 } from "three";

class SelectableMesh extends Mesh {

  #isSelectable = true;
  #isSelected = false;
  #isHovered = false;
  #coordinates;
  displayName = "SelectableMesh";

  constructor(geometry: BufferGeometry, material: Material, coordinates?: Vector3, selectable?: boolean) {
    super(geometry, material);
    this.#isSelectable = selectable == null ? true : selectable;
    this.#coordinates = coordinates ? coordinates : new Vector3();
  }

  getMesh() {
    return this;
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

  isHovered() {
    return this.#isHovered;
  }

  isSelectedOrHovered() {
    return this.#isSelected || this.#isHovered;
  }

  /* States are (from least to greatest weight):
    1. Default
    2. Hovered
    3. Selected   
  */

  select() {
    if (!this.#isSelectable || this.#isSelected) return;
    this.#isSelected = true;
    this.changeToSelectedAppearance();
  }

  /** 
   * For unselect:
      hovered but not selected -> do nothing
      hovered and selected -> hover
      not hovered but selected -> default 
    */
  unselect() {
    if (!this.#isSelected) return;
    this.#isSelected = false;
    if (!this.#isHovered) {
      this.changeToDefaultAppearance();
    } else {
      this.changeToHoverAppearance();
    }
  }

  hover() {
    if (!this.#isSelectable || this.#isHovered) return;
    this.#isHovered = true;
    this.changeToHoverAppearance();
  }

  /** 
   * For unhover:
      hovered but not selected -> default
      hovered and selected -> do nothing
      not hovered but selected -> do nothing
  */
  unhover() {
    if (!this.#isHovered) return;
    this.#isHovered = false;
    if (!this.#isSelected) {
      this.changeToDefaultAppearance();
    }
  }

  unselectAndUnhover() {
    this.#isSelected = false;
    this.#isHovered = false;
    this.changeToDefaultAppearance();
  }

  // Hooks to implement later
  changeToDefaultAppearance() {}
  changeToHoverAppearance() {}
  changeToSelectedAppearance() {}

}

export { SelectableMesh };