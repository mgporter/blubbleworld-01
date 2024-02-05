import { SelectableMesh } from "../objects/SelectableMesh";
import { FinishSelectionObject, SinglePhaseSelector, TwoPhaseSelector } from "../types";

import { Selectable } from "../types";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";
import { MouseEventEmitter } from "./EventEmitter";
import { Globals } from "../Constants";
import { Camera, Raycaster, Vector2, WebGLRenderer } from "three";

export type Intersection = {object: Selectable};


let inSelectionMode = false;
let objects: (SelectableMesh | SelectableInstancedMesh)[] = [];


export class MouseEventHandler {

  _currentTarget: Selectable | null = null;
  _originOfSelection: Selectable | null = null;

  #mouseoverTarget: Selectable | null = null;
  #selector: SinglePhaseSelector | TwoPhaseSelector;

  #camera;
  #raycaster;
  #canvas;
  #mouse;

  #_onClick;
  #_onMouseout;
  #_onMousemove;

  constructor(
    selectableObjects: (SelectableMesh | SelectableInstancedMesh)[],
    selector?: SinglePhaseSelector | TwoPhaseSelector,
  ) {

    objects = selectableObjects;
    this.#selector = selector || new RectangleSelector(true);

    this.#camera = Globals.camera || new Camera();
    this.#raycaster = Globals.raycaster || new Raycaster();
    this.#canvas = Globals.domCanvas || new WebGLRenderer().domElement;
    this.#mouse = new Vector2();

    this.#_onClick = this.#onClick.bind(this);
    this.#_onMouseout = this.#onMouseout.bind(this);
    this.#_onMousemove = this.#onMousemove.bind(this);

    this.enable();
  }

  static isInstancedMesh(mesh: SelectableMesh | SelectableInstancedMesh): mesh is SelectableInstancedMesh {
    return (mesh as SelectableInstancedMesh).isInstancedMesh !== undefined;
  }

  static isTwoPhaseSelector(selector: SinglePhaseSelector | TwoPhaseSelector): selector is TwoPhaseSelector {
    return (selector as TwoPhaseSelector).handleSelectionMode != undefined;
  }

  enable() {
    this.#canvas.addEventListener("click", this.#_onClick);
    this.#canvas.addEventListener("mousemove", this.#_onMousemove);
    this.#canvas.addEventListener("mouseout", this.#_onMouseout);
  }

  dispose() {
    this.#canvas.removeEventListener("click", this.#_onClick);
    this.#canvas.removeEventListener("mousemove", this.#_onMousemove);
    this.#canvas.removeEventListener("mouseout", this.#_onMouseout);
  }

  setSelector(selector: SinglePhaseSelector | TwoPhaseSelector) {
    this.#selector = selector;
  }

  getSelector() {
    return this.#selector;       
  }

  setObjects(newObjects: (SelectableMesh | SelectableInstancedMesh)[]) {
    objects = newObjects;
  }

  getObjects() {
    return objects;
  }

  #onClick() {

    if (this._currentTarget) {   // If the mouse is over a clickable target

      if (inSelectionMode) {

        if (this.#selector.isSelectionValid) {
          MouseEventEmitter.dispatch("selectionFinished", this.#selector.handleSelectionFinished(this._currentTarget));
          this.#clearSelection();
        }

      } else {

        if (MouseEventHandler.isTwoPhaseSelector(this.#selector)) {
          this.#selector.handleFirstClick(this._currentTarget);
          inSelectionMode = true;
          this._originOfSelection = this._currentTarget;
        } else {

          // We will always end up here for Single Phase Selectors
          if (this.#selector.isSelectionValid)
            MouseEventEmitter.dispatch("selectionFinished", this.#selector.handleSelectionFinished(this._currentTarget));
            this.#clearSelection();
        }

        this._currentTarget = null;
      }

    } else {

      if (inSelectionMode) {
        this.#clearSelection();
      }

    }
  }

  #clearSelection() {

    objects.forEach(meshObj => {
      if (MouseEventHandler.isInstancedMesh(meshObj)) meshObj.unselectAndUnhoverAll();
      else meshObj.unselectAndUnhover();
    });

    this._originOfSelection = null;
    this._currentTarget = null;
    this.#mouseoverTarget = null;
    inSelectionMode = false;

  }


  /** Checks whether the mouse is hovering over a mesh, and filters out
   * repeated mouseover events on the same mesh. Also calls
   * #callbackOnHover. Does NOT check if the mesh is currently selectable.
  */
  #getValidTarget(intersections: Intersection[]): Selectable | null {
    if (intersections.length === 0) {
      if (this._currentTarget && !inSelectionMode) 
        this._currentTarget.unselectAndUnhover();
      this._currentTarget = null;
      this.#mouseoverTarget = null;
      MouseEventEmitter.dispatch("hover", {target: null, objects: null});
      return null;
    }

    if (intersections[0].object === this.#mouseoverTarget) return null;

    this.#mouseoverTarget = intersections[0].object;

    MouseEventEmitter.dispatch("hover", {target: this.#mouseoverTarget, objects: null});

    return this.#mouseoverTarget;

  }

  #getIntersectedObject(e: MouseEvent) {
    this.#raycaster.setFromCamera(this.#getPointerCoordinates(e), this.#camera);
    return (this.#raycaster.intersectObjects(objects, false) as unknown) as Intersection[];
  }

  #getPointerCoordinates(e: MouseEvent) {
    /* Use the commented-out code if we are going to
    change the size of the canvas so that it is not full-screen */
    // const rect = this.#canvas.getBoundingClientRect();
    // this.#mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    // this.#mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.#mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.#mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    return this.#mouse;
  }


  #onMousemove(e: MouseEvent) {
    
    const mouseoverTarget = this.#getValidTarget(this.#getIntersectedObject(e));
    if (mouseoverTarget === null) return;

    if (inSelectionMode) {

      this._currentTarget = mouseoverTarget;
      
      if (MouseEventHandler.isTwoPhaseSelector(this.#selector))
        // In selection mode, _originOfSelection will not be null
        this.#selector.handleSelectionMode(this._originOfSelection!, this._currentTarget);

    } else {

      if (mouseoverTarget.isSelectable()) {

        if (this._currentTarget) this._currentTarget.unhover();
        this._currentTarget = mouseoverTarget;
        this.#selector.handleMouseOverTarget(mouseoverTarget);

      } else {
        if (this._currentTarget != null) {
          this.#selector.handleMouseLeaveTarget(this._currentTarget);
          this._currentTarget = null;
        }

      }
        
    }

  }

  #onMouseout() {
    this.#clearSelection();
  }

}


/** ExactRectangleSelector allows the user to select multiple
 * elements in a rectangle, but unselectable objects within the
 * rectangle will void the selection.
  */
export class RectangleSelector implements TwoPhaseSelector {
  
  isSelectionValid = true;

  #minX = Number.MAX_SAFE_INTEGER; 
  #maxX = Number.MIN_SAFE_INTEGER; 
  #minY = Number.MAX_SAFE_INTEGER;
  #maxY = Number.MIN_SAFE_INTEGER;
  #lengthX = 0;
  #lengthY = 0;
  #totalCount = 0;
  #validCount = 0;

  #insideRect: Selectable[] = [];
  #outsideRect: Selectable[] = [];
  #maxLength;
  #maxWidth;
  #allowIncompleteRectangles;
  
  constructor(allowIncompleteRectangles: boolean, maxLength?: number, maxWidth?: number) {
    this.#maxLength = maxLength || -1;
    this.#maxWidth = maxWidth || -1;
    this.#allowIncompleteRectangles = allowIncompleteRectangles;
  }

  handleMouseOverTarget(target: Selectable) {
    target.hover();
  }

  handleMouseLeaveTarget(target: Selectable) {
    target.unhover();
  }

  handleFirstClick(target: Selectable) {
    target.select()
  }

  handleSelectionFinished(target: Selectable): FinishSelectionObject {
    const selection: Selectable[] = [];
    objects.forEach(mesh => {
      if (MouseEventHandler.isInstancedMesh(mesh)) {
        mesh.getSelectionObjects()
          .filter(obj => obj.isSelectedOrHovered())
          .forEach(obj => selection.push(obj));
      } 
      else {
        if (mesh.isSelectedOrHovered()) 
          selection.push(mesh);
      }
    })

    return {
      objects: selection,
      target: target,
      data: {
        minX: this.#minX,
        maxX: this.#maxX,
        minY: this.#minY,
        maxY: this.#maxY,
        lengthX: this.#lengthX,
        lengthY: this.#lengthY,
        totalArea: this.#totalCount,
        validCount: this.#validCount,
      }
    };
  }


  handleSelectionMode(origin: Selectable, target: Selectable) {

    this.#setMinMaxCoordinates(origin, target);
    this.#findObjectsThatAreInsideAndOutsideRect();

    this.#lengthX = Math.abs((this.#maxX - this.#minX)) + 1;
    this.#lengthY = Math.abs((this.#maxY - this.#minY)) + 1;
    this.#totalCount = this.#lengthX * this.#lengthY;

    const selectionTooBig = 
      (this.#maxLength != -1 ? this.#lengthX > this.#maxLength : false) ||
      (this.#maxWidth != -1 ? this.#lengthY > this.#maxWidth : false)

    const selectionContainsUnselectables = 
      this.#allowIncompleteRectangles ? false :
      this.#insideRect.length < this.#totalCount;

    if (selectionContainsUnselectables || selectionTooBig) {
      this.#addRectSelectionEffect(false);
    } else {
      this.#addRectSelectionEffect(true);
    }

  }

  #setMinMaxCoordinates(origin: Selectable, target: Selectable) {

    /* If we use different cubes, we may have to update the coordinates */
    const originX = origin.getCoordinates().x, originY = origin.getCoordinates().y;
    const targetX = target.getCoordinates().x, targetY = target.getCoordinates().y;

    if (originX < targetX) {
      this.#minX = originX; this.#maxX = targetX;
    } else {
      this.#minX = targetX; this.#maxX = originX;
    }

    if (originY < targetY) {
      this.#minY = originY; this.#maxY = targetY;
    } else {
      this.#minY = targetY; this.#maxY = originY;
    }
  }

  #findObjectsThatAreInsideAndOutsideRect() {
    const insideRect: Selectable[] = [];
    const outsideRect: Selectable[] = [];

    objects.forEach(x => {
      
      if (MouseEventHandler.isInstancedMesh(x)) {
        x.getSelectionObjects().forEach(obj => {
          if (!obj.isSelectable()) return;
          if (this.#inBounds(obj)) insideRect.push(obj);
          else outsideRect.push(obj);
        });
      } else {
        if (!x.isSelectable()) return;
        if (this.#inBounds(x)) insideRect.push(x);
        else outsideRect.push(x);
      }
    })

    this.#insideRect = insideRect;
    this.#outsideRect = outsideRect;
    this.#validCount = insideRect.length;
  }

  #addRectSelectionEffect(isValid: boolean) {
    // Reset the colors of everything if there is a change in validity
    if (isValid != this.isSelectionValid) this.#insideRect.forEach(x => x.unhover());
    this.isSelectionValid = isValid;
    
    this.#insideRect.forEach(x => x.hover(!isValid));
    this.#outsideRect.forEach(x => x.unhover());
  }

  #inBounds(obj: Selectable) {
    const coord = obj.getCoordinates();
    return coord.x >= this.#minX && coord.x <= this.#maxX && coord.y >= this.#minY && coord.y <= this.#maxY;
  }

}


/* #updateRectangleSelection(origin: Selectable, target: Selectable) {

  Old code
  objects.forEach(x => {
    if (this.#isInstancedMesh(x)) {
      x.getSelectionObjects().forEach(obj => this.#addSelectionRectangle(obj, minX, maxX, minZ, maxZ));
    } else {
      this.#addSelectionRectangle(x, minX, maxX, minZ, maxZ);
    }
  });

} */