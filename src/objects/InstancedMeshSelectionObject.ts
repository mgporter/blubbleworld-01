import { Matrix4, Object3D, Vector3 } from "three";
import { SelectableInstancedMesh } from "./SelectableInstancedMesh";
import { Buildable } from "../Buildables";

class InstancedMeshSelectionObject {

  #isSelectable = true;
  #isHoverable = true;

  #isSelected = false;
  #isHovered = false;
  #index;
  #coordinates = new Vector3();
  #instancedMeshRef: SelectableInstancedMesh;
  #buildables: Object3D[] = [];
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

  hover(rejected?: boolean) {
    if (!this.#isHoverable || this.#isHovered) return;
    this.#isHovered = true;
    if (rejected) this.changeToRejectedAppearance(this.#index);
    else this.changeToHoverAppearance(this.#index);
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

  // addBuildable(buildable: Buildable, id: number) {
  //   this.#buildables.push({id: id, buildable: buildable});
  // }

  addBuildable(mesh: Object3D, building: Buildable, addToObject = true) {
    if (addToObject) {
      mesh.position.x += this.getCoordinates().x;
      mesh.position.y += this.getCoordinates().y;
      mesh.position.z += this.getCoordinates().z;
      this.#instancedMeshRef.add(mesh);
    }
    this.#buildables.push(mesh);
  }

  getBuildables() {
    return this.#buildables;
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