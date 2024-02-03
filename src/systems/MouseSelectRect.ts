import { SelectableMesh } from "../objects/SelectableMesh";
import { Selector } from "../types";
import { Intersection, MouseEvents } from "./MouseEvents";
import { Camera, Color, Mesh, Raycaster, Vector2, Vector3 } from "three";

import { Selectable } from "../types";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";
import { MouseEventEmitter } from "./EventEmitter";

class MouseSelectRect extends MouseEvents implements Selector {

  #currentTarget: Selectable | null = null;
  #mouseoverTarget: Selectable | null = null;
  #originOfSelection: Selectable | null = null;
  #inSelectionMode = false;
  #selectionIsValid = true;

  #_onClick;
  #_onMouseout;
  #_onMousemove;

  constructor(
    camera: Camera, 
    canvas: HTMLElement, 
    raycaster: Raycaster, 
    objects: SelectableMesh[] | SelectableInstancedMesh[],
  ) {
    super(camera, canvas, raycaster, objects);

    this.#_onClick = this.#onClick.bind(this);
    this.#_onMouseout = this.#onMouseout.bind(this);
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
    const selection: Selectable[] = [];
    
    this.getObjects().forEach(mesh => {
      if (this.#isInstancedMesh(mesh)) {
        mesh.getSelectionObjects()
          .filter(obj => obj.isSelectedOrHovered())
          .forEach(obj => selection.push(obj));
      } 
      else {
        if (mesh.isSelectedOrHovered()) 
          selection.push(mesh);
      }
    })

    MouseEventEmitter.dispatch("selectionFinished", selection)
    // this.#callbackOnSelectionFinish(selection);
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

    // if (this.#currentTarget) this.#currentTarget.hover();

    this.#originOfSelection = null;
    this.#currentTarget = null;
    this.#mouseoverTarget = null;
    this.#inSelectionMode = false;

  }

  #isInstancedMesh(mesh: SelectableMesh | SelectableInstancedMesh): mesh is SelectableInstancedMesh {
    return (mesh as SelectableInstancedMesh).isInstancedMesh !== undefined;
  }

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

    // Divide selectables into those inside the rectangle, and those outside.
    const insideRect: Selectable[] = [];
    const outsideRect: Selectable[] = [];

    this.getObjects().forEach(x => {
      
      if (this.#isInstancedMesh(x)) {
        x.getSelectionObjects().forEach(obj => {
          if (!obj.isSelectable()) return;
          if (this.#inBounds(obj, minX, maxX, minZ, maxZ)) insideRect.push(obj);
          else outsideRect.push(obj);
        });
      } else {
        this.#addSelectionRectangle(x, minX, maxX, minZ, maxZ);
      }
    })

    const itemsInLargestRectangle = 
      (Math.abs((maxX - minX)) + 1) * (Math.abs((maxZ - minZ)) + 1);

    //If a perfect rectangle is not selected
    if (insideRect.length < itemsInLargestRectangle && insideRect.length > 0) {
      this.#addRectSelectionEffect(false, insideRect, outsideRect);
    } else {
      this.#addRectSelectionEffect(true, insideRect, outsideRect);
    }



    // Old code
    // this.getObjects().forEach(x => {
    //   if (this.#isInstancedMesh(x)) {
    //     x.getSelectionObjects().forEach(obj => this.#addSelectionRectangle(obj, minX, maxX, minZ, maxZ));
    //   } else {
    //     this.#addSelectionRectangle(x, minX, maxX, minZ, maxZ);
    //   }
    // });

  }

  #addRectSelectionEffect(isValid: boolean, inside: Selectable[], outside: Selectable[]) {
    // Return early if there is no change in validity
    if (isValid != this.#selectionIsValid) inside.forEach(x => x.unhover());
    this.#selectionIsValid = isValid;
    
    inside.forEach(x => x.hover(!isValid));
    outside.forEach(x => x.unhover());
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

  /** Checks whether the mouse is hovering over a mesh, and filters out
   * repeated mouseover events on the same mesh. Also calls
   * #callbackOnHover. Does NOT check if the mesh is currently selectable.
  */
  #getValidTarget(intersections: Intersection[]): Selectable | null {
    if (intersections.length === 0) {
      if (this.#currentTarget && !this.#inSelectionMode) 
        this.#currentTarget.unselectAndUnhover();
      this.#currentTarget = null;
      this.#mouseoverTarget = null;
      MouseEventEmitter.dispatch("hover", null);
      return null;
    }

    if (intersections[0].object === this.#mouseoverTarget) return null;

    this.#mouseoverTarget = intersections[0].object;

    MouseEventEmitter.dispatch("hover", this.#mouseoverTarget);

    return this.#mouseoverTarget;

  }

  /** Handles the cases where the selection has started and not
   * started, respectively.
  */
  #onMousemove(e: MouseEvent) {

    const mouseoverTarget = this.#getValidTarget(this.getIntersectedObject(e));
    if (mouseoverTarget === null) return;

    if (this.#originOfSelection) {  // If in selection mode

      this.#currentTarget = mouseoverTarget;
      this.#updateRectangleSelection(this.#originOfSelection, this.#currentTarget);     

    } else {

      if (mouseoverTarget.isSelectable()) {

        if (this.#currentTarget) this.#currentTarget.unhover();
        this.#currentTarget = mouseoverTarget;
        this.#currentTarget.hover();

      } else {
        this.#currentTarget?.unhover();
        this.#currentTarget = null;
      }
        
    }

  }

  #onMouseout() {
    this.#clearSelection();
  }



}

export { MouseSelectRect };