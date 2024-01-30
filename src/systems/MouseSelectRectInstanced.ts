import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";
import { Selector } from "../types";
import { MouseEvents } from "./MouseEvents";
import { Camera, Color, Raycaster } from "three";



class MouseSelectRectInstanced extends MouseEvents implements Selector {

  #currentTarget: {mesh: SelectableInstancedMesh, index: number} | null = null;
  #originOfSelection: {mesh: SelectableInstancedMesh, index: number} | null = null;
  #inSelectionMode = false;
  #callback;

  #_onClick;
  #_onMouseenter;
  #_onMouseout;
  #_onMousedown;
  #_onMouseup;
  #_onMousemove;

  constructor(
    camera: Camera, 
    canvas: HTMLElement, 
    raycaster: Raycaster, 
    objects: SelectableInstancedMesh[],
    callback: (selection: SelectableInstancedMesh[]) => void) {
    super(camera, canvas, raycaster, objects);

    this.#callback = callback;

    this.#_onClick = this.#onClick.bind(this);
    this.#_onMouseenter = this.#onMouseenter.bind(this);
    this.#_onMouseout = this.#onMouseout.bind(this);
    this.#_onMousedown = this.#onMousedown.bind(this);
    this.#_onMouseup = this.#onMouseup.bind(this);
    this.#_onMousemove = this.#onMousemove.bind(this);
  }

  enable() {
    this.getCanvas().addEventListener("click", this.#_onClick);
    this.getCanvas().addEventListener("mousemove", this.#_onMousemove);
    this.getCanvas().addEventListener("mouseout", this.#_onMouseout);
  }

  dispose() {
    this.getCanvas().removeEventListener("click", this.#_onClick);
    this.getCanvas().removeEventListener("mousemove", this.#_onMousemove);
    this.getCanvas().removeEventListener("mouseout", this.#_onMouseout);
  }

  #returnSelection() {
    const selected = this.getObjects().filter(x => x.isSelected());
    this.#callback(selected);
  }

  #onClick(e: MouseEvent) {

    if (this.#currentTarget) {

      if (this.#inSelectionMode) {
        this.#returnSelection();
        this.#clearSelection();
      } else {
        this.#originOfSelection = this.#currentTarget;
        this.#inSelectionMode = true;
        this.#currentTarget = null;
      }

    } else {

      if (this.#inSelectionMode) {
        this.#clearSelection();
      }

    }
  }

  #clearSelection() {
    this.#originOfSelection = null;
    this.#currentTarget = null;
    this.#inSelectionMode = false;
    this.#unselectAll();
  }

  #unselectAll() {
    (this.getObjects() as SelectableInstancedMesh[])
      .forEach((selectableInstanceMesh) => {
        selectableInstanceMesh.getSelectionObjects()
          .forEach((_obj, i) => selectableInstanceMesh.unselect(i));
      })
  }

  #onMousedown(e: MouseEvent) {}

  #onMouseup(e: MouseEvent) {}

  #updateRectangleSelection(origin: SelectableInstancedMesh, target: SelectableInstancedMesh) {

    const originX = origin.getCoordinates().x, originZ = origin.getCoordinates().z;
    const targetX = target.getCoordinates().x, targetZ = target.getCoordinates().z;

    let minX: number, maxX: number, minZ: number, maxZ: number;

    if (originX < targetX) {
      minX = originX; maxX = targetX;
    } else {
      minX = targetX; maxX = originX;
    }

    if (originZ < targetZ) {
      minZ = originZ; maxZ = targetZ;
    } else {
      minZ = targetZ; maxZ = originZ;
    }

    this.getObjects().forEach(x => {
      if (this.#inBounds(x, minX, maxX, minZ, maxZ)) {
        x.select();
      } else {
        x.unselect();
      }
    });

  }

  #inBounds(obj: SelectableInstancedMesh, minX: number, maxX: number, minZ: number, maxZ: number) {
    const coord = obj.getCoordinates();
    return coord.x >= minX && coord.x <= maxX && coord.z >= minZ && coord.z <= maxZ;
  }

  #onMousemove(e: MouseEvent) {

    const intersections = 
      this.getIntersectedObject(e) as {object: SelectableInstancedMesh, instanceId: number}[];

    if (this.#originOfSelection) {  // If in selection mode

      if (intersections.length > 0) {

        this.#currentTarget = {mesh: intersections[0].object, index: intersections[0].instanceId}
        // this.#updateRectangleSelection(this.#originOfSelection, this.#currentTarget);     

      } else {
        this.#currentTarget = null;
      }


    } else {

      if (intersections.length > 0 && intersections[0].object.isSelectable(intersections[0].instanceId)) {
        
        if (this.#currentTarget) {
          if (intersections[0].instanceId === this.#currentTarget.index) return;
          this.#currentTarget.mesh.unselect(this.#currentTarget.index);
        }

        this.#currentTarget = {mesh: intersections[0].object, index: intersections[0].instanceId};
        this.#currentTarget.mesh.select(intersections[0].instanceId);

      } else {
        if (this.#currentTarget) this.#currentTarget.mesh.unselect(this.#currentTarget.index);
        this.#currentTarget = null;
      }

    }

  }

  #onMouseenter(e: MouseEvent) {
    
  }

  #onMouseout(e: MouseEvent) {
    this.#clearSelection();
  }



}

export { MouseSelectRectInstanced };