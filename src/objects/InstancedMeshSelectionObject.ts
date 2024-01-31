import { Vector3 } from "three";

class InstancedMeshSelectionObject {

  #isSelectable = true;
  #isSelected = false;
  #isHovered = false;
  #index;
  #coordinates = new Vector3();
  #instancedMeshRef;

  constructor(
    isSelectable: boolean, 
    index: number,
    instancedMeshRef: object,
    changeToSelectedAppearance: (idx: number) => void,
    changeToDefaultAppearance: (idx: number) => void,
    changeToHoverAppearance: (idx: number) => void) {

    this.#isSelectable = isSelectable;
    this.#index = index;
    this.#instancedMeshRef = instancedMeshRef;
    this.changeToSelectedAppearance = changeToSelectedAppearance;
    this.changeToDefaultAppearance = changeToDefaultAppearance;
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
    this.changeToSelectedAppearance(this.#index);
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
      this.changeToDefaultAppearance(this.#index);
    } else {
      this.changeToHoverAppearance(this.#index);
    }
  }

  hover() {
    if (!this.#isSelectable || this.#isHovered) return;
    this.#isHovered = true;
    this.changeToHoverAppearance(this.#index);
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
      this.changeToDefaultAppearance(this.#index);
    }
  }

  unselectAndUnhover() {
    this.#isSelected = false;
    this.#isHovered = false;
    this.changeToDefaultAppearance(this.#index);
  }




  // Hooks to implement later
  changeToDefaultAppearance(index: number) {}
  changeToHoverAppearance(index: number) {}
  changeToSelectedAppearance(index: number) {}

}

export { InstancedMeshSelectionObject };