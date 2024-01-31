import { SelectableMesh } from "../objects/SelectableMesh";
import { Selector } from "../types";
import { MouseEvents } from "./MouseEvents";
import { Camera, Raycaster, Vector2 } from "three";

import { Selectable } from "../types";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";

class MouseSelectRect extends MouseEvents implements Selector {

  #currentTarget: Selectable | null = null;
  #originOfSelection: Selectable | null = null;
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
    objects: SelectableMesh[] | SelectableInstancedMesh[],
    callback: (selection: Vector2[]) => void) {
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
    const selection: Vector2[] = [];
    
    this.getObjects().forEach(mesh => {
      if (this.#isInstancedMesh(mesh)) {
        mesh.getSelectionObjects()
          .filter(obj => obj.isSelectedOrHovered())
          .forEach(obj => selection.push(new Vector2(obj.getCoordinates().x, obj.getCoordinates().y)));
      } 
      else {
        if (mesh.isSelectedOrHovered()) 
          selection.push(new Vector2(mesh.getCoordinates().x, mesh.getCoordinates().y));
      }
    })

    this.#callback(selection);
  }

  #onClick() {

    if (this.#currentTarget) {   // If the mouse is over a clickable target

      if (this.#inSelectionMode) {
        this.#returnSelection();
        this.#clearSelection();
      } else {
        this.#currentTarget.select();
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

    this.getObjects().forEach(meshObj => {
      if (this.#isInstancedMesh(meshObj)) meshObj.unselectAndUnhoverAll();
      else meshObj.unselectAndUnhover();
    });

    if (this.#currentTarget) this.#currentTarget.hover();

    this.#originOfSelection = null;
    this.#currentTarget = null;
    this.#inSelectionMode = false;

  }

  #isInstancedMesh(mesh: SelectableMesh | SelectableInstancedMesh): mesh is SelectableInstancedMesh {
    return (mesh as SelectableInstancedMesh).isInstancedMesh !== undefined;
  }

  #onMousedown() {}

  #onMouseup() {}

  #updateRectangleSelection(origin: Selectable, target: Selectable) {

    /* If we use different cubes, we may have to update the coordinates */

    const originX = origin.getCoordinates().x, originZ = origin.getCoordinates().y;
    const targetX = target.getCoordinates().x, targetZ = target.getCoordinates().y;

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
      if (this.#isInstancedMesh(x)) {
        x.getSelectionObjects().forEach(obj => this.#addSelectionRectangle(obj, minX, maxX, minZ, maxZ));
      } else {
        this.#addSelectionRectangle(x, minX, maxX, minZ, maxZ);
      }
    });

  }

  #inBounds(obj: Selectable, minX: number, maxX: number, minZ: number, maxZ: number) {
    const coord = obj.getCoordinates();
    return coord.x >= minX && coord.x <= maxX && coord.y >= minZ && coord.y <= maxZ;
  }

  #addSelectionRectangle(obj: Selectable, minX: number, maxX: number, minZ: number, maxZ: number) {
    if (this.#inBounds(obj, minX, maxX, minZ, maxZ)) {
      obj.hover();
    } else {
      obj.unhover();
    }
  }

  #onMousemove(e: MouseEvent) {

    const intersections = this.getIntersectedObject(e);

    if (this.#originOfSelection) {  // If in selection mode

      if (intersections.length > 0) {

        this.#currentTarget = intersections[0].object;
        this.#updateRectangleSelection(this.#originOfSelection, this.#currentTarget);     

      } else {
        this.#currentTarget = null;
      }


    } else {

      if (intersections.length > 0 && intersections[0].object.isSelectable()) {
        
        if (intersections[0].object === this.#currentTarget) return;

        if (this.#currentTarget) this.#currentTarget.unhover();
        this.#currentTarget = intersections[0].object;
        this.#currentTarget.hover();

      } else {
        if (this.#currentTarget) this.#currentTarget.unhover();
        this.#currentTarget = null;
      }

    }

  }

  #onMouseenter() {
    
  }

  #onMouseout() {
    this.#clearSelection();
  }



}

export { MouseSelectRect };