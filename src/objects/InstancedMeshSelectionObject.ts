import { Matrix4, Vector3 } from "three";
import { SelectableInstancedMesh } from "./SelectableInstancedMesh";
import { MyGroup } from "../systems/ModelInterface";

class InstancedMeshSelectionObject {

  #isSelectable = true;
  #isHoverable = true;

  #isSelected = false;
  #isHovered = false;
  #index;
  #coordinates = new Vector3();
  #instancedMeshRef: SelectableInstancedMesh;
  #buildables: MyGroup[] = [];
  canPlaceBuildable;


  constructor(
    isSelectable: boolean, 
    index: number,
    instancedMeshRef: SelectableInstancedMesh,
    changeToSelectedAppearance: (idx: number) => void,
    changeToDefaultAppearance: (idx: number) => void,
    changeToHoverAppearance: (idx: number) => void,
    changeToRejectedAppearance: (idx: number) => void) {

    this.canPlaceBuildable = isSelectable;
    this.#index = index;
    this.#instancedMeshRef = instancedMeshRef;
    this.changeToSelectedAppearance = changeToSelectedAppearance;
    this.changeToDefaultAppearance = changeToDefaultAppearance;
    this.changeToHoverAppearance = changeToHoverAppearance;
    this.changeToRejectedAppearance = changeToRejectedAppearance;

  }

  getMesh() {
    return this.#instancedMeshRef;
  }

  getIndex() {
    return this.#index;
  }

  getCoordinates() {
    return this.#coordinates;
  }

  setCoordinates(input: Vector3 | Matrix4) {
    if ((input as Vector3).isVector3 != undefined) {
      this.#coordinates = input as Vector3;
    } else {
      this.#coordinates = new Vector3().setFromMatrixPosition(input as Matrix4);
    }
  }

  isSelectable() {
    return this.#isSelectable;
  }

  setSelectable(val: boolean) {
    this.#isSelectable = val;
    if (!val) this.unselectAndUnhover();
  }

  isHoverable() {
    return this.#isHoverable;
  }

  // CHANGE LATER
  setHoverable(val: boolean) {
    this.#isHoverable = val;
    if (!val) this.unselectAndUnhover();
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

  hover(accepted = true) {
    if (!this.#isHoverable) return;
    this.#isHovered = true;
    if (accepted) this.changeToHoverAppearance(this.#index); 
    else this.changeToRejectedAppearance(this.#index);
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

  addBuildable(model: MyGroup, addToObject = true) {
    if (addToObject) {
      model.position.x += this.getCoordinates().x;
      model.position.y += this.getCoordinates().y;
      model.position.z += this.getCoordinates().z;
      this.#instancedMeshRef.add(model);
    }
    this.#buildables.push(model);
  }

  getBuildables() {
    return this.#buildables;
  }

  removeBuilding() {
    this.#buildables.pop();
  }

  isOccupied() {
    return this.#buildables.length > 0;
  }




  // Hooks to be overridden by the superclass
  //eslint-disable-next-line
  changeToDefaultAppearance(index: number) {}
  //eslint-disable-next-line
  changeToHoverAppearance(index: number) {}
  //eslint-disable-next-line
  changeToSelectedAppearance(index: number) {}
  //eslint-disable-next-line
  changeToRejectedAppearance(index: number) {}

}

export { InstancedMeshSelectionObject };