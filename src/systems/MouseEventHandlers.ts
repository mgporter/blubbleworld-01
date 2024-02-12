import { SelectableMesh } from "../objects/SelectableMesh";
import { FinishSelectionObject, MeshName, Selector, SinglePhaseSelector, TwoPhaseSelector } from "../types";

import { Selectable } from "../types";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";
import { MouseEventEmitter } from "./EventEmitter";
import { Camera, Raycaster, Vector2, WebGLRenderer } from "three";
import { BuildableType } from "../Buildables";
import { forEachFilter } from "../Utils";

export type Intersection = {object: Selectable};
export interface SelectableProperties {
  name?: MeshName | MeshName[],
  canPlaceBuildable?: boolean,
  isOccupied?: boolean,
}


let inSelectionMode = false;
let objects: (SelectableMesh | SelectableInstancedMesh)[] = [];
let selectables: Selectable[];


export class MouseEventHandler {

  _currentTarget: Selectable | null = null;
  _originOfSelection: Selectable | null = null;

  #mouseoverTarget: Selectable | null = null;
  #selector: SinglePhaseSelector | TwoPhaseSelector;

  #camera;
  #raycaster;
  #renderer;
  #mouse;

  #_onClick;
  #_onMouseout;
  #_onMousemove;

  constructor(
    camera: Camera,
    raycaster: Raycaster,
    renderer: WebGLRenderer,
    selectableObjects?: (SelectableMesh | SelectableInstancedMesh)[],
    selector?: SinglePhaseSelector | TwoPhaseSelector,
  ) {

    objects = selectableObjects || [];
    selectables = selectableObjects ? MouseEventHandler.selectablesFlatMap(selectableObjects) : [];

    this.#selector = selector || new EmptySelector();

    this.#camera = camera;
    this.#raycaster = raycaster;
    this.#renderer = renderer;
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

  static isConnectingSelector(selector: Selector): selector is ConnectingSelector {
    return (selector as ConnectingSelector).isConnectingSelector === true;
  }

  /* Calls the callback function on each items in the array. If an instancedMesh is present, than
  each of that mesh's SelectionObjects will have the function called on them too. This function is
  specifically for calling on the "objects" array. */
  static selectablesForEach(array: (SelectableMesh | SelectableInstancedMesh)[], cb: (item: Selectable) => void) {
    array.forEach(x => {
      if (MouseEventHandler.isInstancedMesh(x)) {
        x.getSelectionObjects().forEach(obj => cb(obj));
      } else {
        cb(x);
      }
    })
  }

  /* Maps all objects to a single flattened array, regardless of whether it is
  an instancedMesh or a regular mesh. */
  static selectablesFlatMap(array: (SelectableMesh | SelectableInstancedMesh)[]): Selectable[] {
    return array.map(x => MouseEventHandler.isInstancedMesh(x) ? x.getSelectionObjects() : x).flat();
  }

  enable() {
    this.#renderer.domElement.addEventListener("click", this.#_onClick);
    this.#renderer.domElement.addEventListener("mousemove", this.#_onMousemove);
    this.#renderer.domElement.addEventListener("mouseout", this.#_onMouseout);
  }

  dispose() {
    this.#renderer.domElement.removeEventListener("click", this.#_onClick);
    this.#renderer.domElement.removeEventListener("mousemove", this.#_onMousemove);
    this.#renderer.domElement.removeEventListener("mouseout", this.#_onMouseout);
  }

  setSelector(selector: SinglePhaseSelector | TwoPhaseSelector) {
    this.#selector = selector;
    if (!MouseEventHandler.isTwoPhaseSelector(selector)) {
      inSelectionMode = false;
    }
    this.#selector.init();
  }

  getSelector() {
    return this.#selector;       
  }

  setObjects(newObjects: (SelectableMesh | SelectableInstancedMesh)[]) {
    objects = newObjects;
    selectables = MouseEventHandler.selectablesFlatMap(newObjects);
  }

  getObjects() {
    return objects;
  }

  updateObjects(selectablesToUpdate: Selectable[]) {
    this.#selector.updateObjects(selectablesToUpdate);
  }

  #onClick() {

    if (this._currentTarget) {   // If the mouse is over a clickable target

      if (!this.#selector.isSelectionValid) return; 

      if (inSelectionMode) {

        MouseEventEmitter.dispatch("selectionFinished", this.#selector.handleSelectionFinished(this._currentTarget));
        this.#clearSelection();

      } else {

        if (MouseEventHandler.isTwoPhaseSelector(this.#selector)) {
          this.#selector.handleFirstClick(this._currentTarget);
          inSelectionMode = true;
          this._originOfSelection = this._currentTarget;
        } else {

          // We will always end up here for Single Phase Selectors
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

    objects.forEach(meshObj => meshObj.unselectAndUnhover());

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
        this.#selector.handleMouseLeaveBoard(this._currentTarget);
      this._currentTarget = null;
      this.#mouseoverTarget = null;
      MouseEventEmitter.dispatch("hover", {target: null, objects: null});
      return null;
    }

    if (intersections[0].object === this.#mouseoverTarget) return null;

    this.#mouseoverTarget = intersections[0].object;

    MouseEventEmitter.dispatch("hover", {target: this.#mouseoverTarget, objects: null});
    this.#selector.handleMouseOverAnyTarget(this.#mouseoverTarget);

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

      if (mouseoverTarget.isHoverable()) {

        if (this._currentTarget) this.#selector.handleMouseLeaveTarget(this._currentTarget);
        this._currentTarget = mouseoverTarget;
        this.#selector.handleMouseOverSelectableTarget(mouseoverTarget);

      } else this.#mouseLeftSelectableTarget();
        
    }

  }

  #mouseLeftSelectableTarget() {
    if (this._currentTarget != null) {
      this.#selector.handleMouseLeaveTarget(this._currentTarget);
      this._currentTarget = null;
    }
  }

  #onMouseout() {
    this.#clearSelection();
    MouseEventEmitter.dispatch("hover", {target: null, objects: null});
  }

}








export class BaseSelector {

  protected meshesToSelect;
  protected meshesToHover;
  isSelectionValid = true;

  constructor(meshesToSelect?: SelectableProperties, meshesToHover?: SelectableProperties) {
    this.meshesToSelect = meshesToSelect == undefined ? {canPlaceBuildable: true} : meshesToSelect;
    this.meshesToHover = meshesToHover == undefined ? this.meshesToSelect : meshesToHover;
  }


  init(selectablesToUpdate?: Selectable[]) {

    const array = selectablesToUpdate ? selectablesToUpdate : selectables;

    forEachFilter<Selectable>(
      array, 
      this.#filterSelectables(this.meshesToSelect), 
      x => {x.setSelectable(true); x.setHoverable(true)},
      x => {x.setSelectable(false); x.setHoverable(false)});

    // If a separate "meshesToHover" object was not given, then we just stop here.
    // In this case, every object is either both selectable and hoverable, or neither.
    if (this.meshesToHover === this.meshesToSelect) return;


    // If a separate "meshesToHover" object WAS given, then we set hoverability based
    // on those properties. However, objects that are selectable are ALWAYS hoverable,
    // so those are skipped.
    const filterHoverable = (selectable: Selectable) => {
      if (selectable.isSelectable()) return true;
      return this.#filterSelectables(this.meshesToHover)(selectable);
    }

    forEachFilter<Selectable>(
      array, 
      filterHoverable, 
      x => x.setHoverable(true),
      x => x.setHoverable(false));

  }

  #filterSelectables(props: SelectableProperties) {

    return (selectable: Selectable) => {
      // Check meshes by name
      if (props.name != undefined) {

        if (typeof props.name === 'object') {
          if (!props.name.includes(selectable.getMesh().name as MeshName)) return false;
        } 
        else if (props.name != selectable.getMesh().name) return false;

      }

      // Check if this selectable has a building on it
      if (props.isOccupied != undefined) {
        if (props.isOccupied != selectable.isOccupied()) return false;
      }

      // Check if this selectable can hold a building
      if (props.canPlaceBuildable != undefined) {
        if (props.canPlaceBuildable != selectable.canPlaceBuildable) return false;
      }

      return true;
    }

  }

  updateObjects(selectablesToUpdate: Selectable[]) {
    this.init(selectablesToUpdate);
  }

}








/** The Empty Selector does nothing and returns nothing. It is
 * used to disable mouse selection. Note however, that the 
 * MouseEventHandler will still dispatch mouse events to
 * any subscriptors.
  */

export class EmptySelector extends BaseSelector implements SinglePhaseSelector {
  handleMouseOverAnyTarget(target: Selectable) {}
  handleMouseOverSelectableTarget(target: Selectable) {}
  handleMouseLeaveTarget(target: Selectable) {}
  handleMouseLeaveBoard(target: Selectable) {}
  allowStacking() {return false;}
  handleSelectionFinished(target: Selectable) {
    return {
      objects: null, 
      target: null, 
      data: {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
        lengthX: 0,
        lengthY: 0,
        totalArea: 0,
        validCount: 0,
      }}
  }
  setMaxRectangleSize(length: number, width: number) {}

  isSelectionValid = false;
}









interface FlexibleRectangleSelectorProps {
  buildableMaxHeight?: number,
  allowIncompleteRectangles?: boolean,
  length?: number, 
  width?: number,
  meshesToSelect?: SelectableProperties,
  meshesToHover?: SelectableProperties,
}

/** FlexibleRectangleSelector allows the user to select all
 * items within a flexibly-sized rectangle. A max size can be set,
 * as well as if the selection should be invalidated if unselectable
 * objects are contained within the rectangle.
  */

export class FlexibleRectangleSelector extends BaseSelector implements TwoPhaseSelector {

  #minX = Number.MAX_SAFE_INTEGER; 
  #maxX = Number.MIN_SAFE_INTEGER; 
  #minY = Number.MAX_SAFE_INTEGER;
  #maxY = Number.MIN_SAFE_INTEGER;
  #lengthX = 0;
  #lengthY = 0;
  #totalCount = 0;
  #validCount = 0;

  #insideRect: Selectable[] = [];
  #allowIncompleteRectangles;
  #maxLength;
  #maxWidth;
  #buildableMaxHeight;
  
  constructor({
    buildableMaxHeight, 
    allowIncompleteRectangles, 
    length, 
    width, 
    meshesToSelect, 
    meshesToHover
  }: FlexibleRectangleSelectorProps) {
    super(meshesToSelect, meshesToHover);
    this.#buildableMaxHeight = (buildableMaxHeight && buildableMaxHeight > 1) ? buildableMaxHeight : 1;
    this.#maxLength = (length && length > 1) ? length : -1;
    this.#maxWidth = (width && width > 1) ? width : -1;
    this.#allowIncompleteRectangles = allowIncompleteRectangles == undefined ? true : allowIncompleteRectangles;
  }

  /** Set to any number, or to -1 to turn off size restrictions */
  setMaxRectangleSize(length: number, width: number) {
    this.#maxLength = length;
    this.#maxWidth = width;
  }

  setExactRectangle(val: boolean) {
    this.#allowIncompleteRectangles = val;
  }

  allowStacking() {return this.#buildableMaxHeight > 1;}

  handleMouseOverSelectableTarget(target: Selectable) {

    if (target.isSelectable()) {
      target.hover(false);
      this.isSelectionValid = true;
    } else if (target.isHoverable()) {
      target.hover(true);
      this.isSelectionValid = false;
    }

  }

  handleMouseOverAnyTarget(target: Selectable) {

  }

  handleMouseLeaveTarget(target: Selectable) {
    target.unhover();
  }

  handleMouseLeaveBoard(target: Selectable) {
    target.unselectAndUnhover();
  }

  handleFirstClick(target: Selectable) {
    target.select();
  }

  handleSelectionFinished(target: Selectable): FinishSelectionObject {

    return {
      objects: [...this.#insideRect],
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
    this.#generateInsideRect();

    this.#lengthX = Math.abs((this.#maxX - this.#minX)) + 1;
    this.#lengthY = Math.abs((this.#maxY - this.#minY)) + 1;
    this.#totalCount = this.#lengthX * this.#lengthY;

    const selectionSizeIsValid = 
      (this.#maxLength <= -1 ? true : this.#lengthX <= this.#maxLength) &&
      (this.#maxWidth <= -1 ? true : this.#lengthY <= this.#maxWidth);
    
    const selectionIsRectangular = 
      this.#allowIncompleteRectangles ? true :
      this.#insideRect.length === this.#totalCount;


    this.isSelectionValid = 
      selectionSizeIsValid && 
      selectionIsRectangular;


    this.#addRectSelectionEffect();

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

  #generateInsideRect() {

    this.#insideRect.forEach(x => x.unhover());

    this.#insideRect = [];

    selectables
      .filter(x => this.#inBounds(x) && x.isSelectable())
      .forEach(x => this.#insideRect.push(x));

  }

  #addRectSelectionEffect() {
    this.#insideRect
      .forEach(x => x.hover(!this.isSelectionValid));
  }

  #inBounds(obj: Selectable) {
    const coord = obj.getCoordinates();
    return coord.x >= this.#minX && coord.x <= this.#maxX && coord.y >= this.#minY && coord.y <= this.#maxY;
  }

}










interface FixedRectangleSelectorProps {
  buildableMaxHeight?: number, 
  length?: number, 
  width?: number,
  meshesToSelect?: SelectableProperties,
  meshesToHover?: SelectableProperties,
}


/** FixedRectangleSelector is a basic selector that allows the
 * user to select one or more items in a rectangle of fixed size.
 * The size cannot be changed by the user. Use this if you just
 * want to select a single item.
  */

export class FixedRectangleSelector extends BaseSelector implements SinglePhaseSelector {

  #minX = Number.MAX_SAFE_INTEGER; 
  #maxX = Number.MIN_SAFE_INTEGER; 
  #minY = Number.MAX_SAFE_INTEGER;
  #maxY = Number.MIN_SAFE_INTEGER;
  protected insideRect: Selectable[] = [];

  #lengthX;
  #lengthY;
  #totalCount;
  #buildableMaxHeight;
  #currentHeight;
  
  constructor({buildableMaxHeight, length, width, meshesToSelect, meshesToHover}: FixedRectangleSelectorProps) {
    super(meshesToSelect, meshesToHover);
    this.#lengthX = (length && length > 1) ? length : 1;
    this.#lengthY = (width && width > 1) ? width : 1;
    this.#totalCount = this.#lengthX * this.#lengthY;
    this.#buildableMaxHeight = (buildableMaxHeight && buildableMaxHeight > 1) ? buildableMaxHeight : 1;
    this.#currentHeight = 0;
  }


  setMaxRectangleSize(length: number, width: number) {
    this.#lengthX = length;
    this.#lengthY = width;
    this.#totalCount = this.#lengthX * this.#lengthY;
  }

  allowStacking() {return this.#buildableMaxHeight > 1;}

  handleMouseOverSelectableTarget(target: Selectable) {}

  handleMouseOverAnyTarget(target: Selectable) {

    this.#setMinMaxCoordinates(target);
    this.#generateInsideRect();

    /* If all objs are selectable, then valid selection and add valid hover
    If all objs are hoverable but have an unselectable, then valid selection and add invalid hover
    if any objs are unhoverable, they don't get any hover changes */

    this.isSelectionValid = 
      this.insideRect.filter(x => x.isSelectable()).length === this.#totalCount;


    // If we allow occupied calls AND
    // all the cells are occupied AND
    // the building on the cells is not yet at maxHeight, then
    // we can allow a stack, but only if the cells are 
    // occupied by the same building.
    if (this.meshesToSelect.isOccupied != false) {

      const occupiedCells = this.insideRect.filter(x => x.isOccupied());

      if (occupiedCells.length > 0) {
        this.isSelectionValid = 
          occupiedCells.length === this.#totalCount &&
          occupiedCells[0].getBuildables().length < this.#buildableMaxHeight &&
          occupiedCells.filter(x => x.getBuildables()[0].id === occupiedCells[0].getBuildables()[0].id).length === this.#totalCount;
      }

    }

    this.#addRectSelectionEffect();

  }

  handleMouseLeaveBoard(target: Selectable) {

    selectables.forEach(x => x.unselectAndUnhover());

  }

  handleMouseLeaveTarget(target: Selectable) {}

  handleSelectionFinished(target: Selectable): FinishSelectionObject {

    const selection: Selectable[] = [];

    selectables
      .filter(x => x.isSelectedOrHovered())
      .forEach(x => selection.push(x));

    return {
      objects: selection,
      target: target,
      data: {
        minX: 1,
        maxX: 1,
        minY: 1,
        maxY: this.#currentHeight,
        lengthX: 1,
        lengthY: this.#currentHeight,
        totalArea: this.#totalCount,
        validCount: this.#currentHeight,
      }
    };
  }

  #setMinMaxCoordinates(target: Selectable) {

    /* If we use different cubes, we may have to update the coordinates */
    const targetX = target.getCoordinates().x, targetY = target.getCoordinates().y;

    const offsetX = Math.floor((this.#lengthX) / 2);
    const offsetY = Math.floor((this.#lengthY - 1) / 2);

    this.#minX = targetX - offsetX;
    this.#maxX = targetX + (this.#lengthX - offsetX - 1); 
    this.#minY = targetY - offsetY;
    this.#maxY = targetY + (this.#lengthY - offsetY - 1);

  }

  #generateInsideRect() {
    
    // Unhover old objects
    this.insideRect.forEach(x => x.unhover());

    // Reset the insideRect
    this.insideRect = [];

    // Push new objects into the insideRect
    selectables
      .filter(x => this.#inBounds(x) && x.isHoverable())
      .forEach(x => this.insideRect.push(x));

  }

  #addRectSelectionEffect() {
    this.insideRect.forEach(x => x.hover(!this.isSelectionValid));
  }

  #inBounds(obj: Selectable) {
    const coord = obj.getCoordinates();
    return coord.x >= this.#minX && coord.x <= this.#maxX && coord.y >= this.#minY && coord.y <= this.#maxY;
  }

}








interface ConnectingSelectorProps {
  buildableMaxHeight?: number;
  buildingType: BuildableType;
  maxDepth: number;
  meshesToSelect?: SelectableProperties,
  meshesToHover?: SelectableProperties,
}

/* Connecting selector allows a building to connect onto
existing buildings by detecting the cells around the selection */
export class ConnectingSelector extends FixedRectangleSelector {

  #buildingType;
  #maxDepth;
  #selectablesWithSameBuilding: Selectable[];
  isConnectingSelector = true;

  constructor({buildableMaxHeight, buildingType, maxDepth, meshesToSelect, meshesToHover}: ConnectingSelectorProps) {
    super({buildableMaxHeight, length: 1, width: 1, meshesToSelect, meshesToHover});
    this.#buildingType = buildingType;
    this.#selectablesWithSameBuilding = [];
    this.#maxDepth = maxDepth;
  }

  handleSelectionFinished(target: Selectable): FinishSelectionObject {

    const selection: Selectable[] = [];
    let minX: number = Number.MAX_SAFE_INTEGER, 
    maxX: number = Number.MIN_SAFE_INTEGER, 
    minY: number = Number.MAX_SAFE_INTEGER, 
    maxY: number = Number.MIN_SAFE_INTEGER;

    this.#selectablesWithSameBuilding
      .filter(x => x.isSelectedOrHovered())
      .forEach(x => {
        const coord = x.getCoordinates();
        minX = Math.min(minX, coord.x);
        maxX = Math.max(maxX, coord.x);
        minY = Math.min(minY, coord.y);
        maxY = Math.max(maxY, coord.y);
        
        selection.push(x);
      });
    
    const lengthX = (maxX - minX) + 1;
    const lengthY = (maxY - minY) + 1;
    

    return {
      objects: selection,
      target: target,
      data: {
        minX: minX,
        maxX: maxX,
        minY: minY,
        maxY: maxY,
        lengthX: lengthX,
        lengthY: lengthY,
        totalArea: lengthX * lengthY,
        validCount: selection.length,
      }
    };
  }

  init(objectsToUpdate?: Selectable[]) {
    super.init(objectsToUpdate);

    // Update the array of cells that have the same building
    this.#selectablesWithSameBuilding = 
      selectables.filter(x => x.isOccupied() && x.getBuildables()[0].name === this.#buildingType);
  }

  // Override
  handleMouseOverAnyTarget(target: Selectable) {

    // Clear hovering from previous cells
    this.#selectablesWithSameBuilding.forEach(x => x.unhover());

    super.handleMouseOverAnyTarget(target);

    if (this.isSelectionValid === false) return;

    const sameBuildingCopy = [...this.#selectablesWithSameBuilding];

    let curDepth = 0;
    const queue: Selectable[] = [target];

    while (queue.length > 0 && curDepth < this.#maxDepth) {

      let levelSize = queue.length;

      while (levelSize-- > 0) {
        const currentCell = queue.shift();
        const adjCells = sameBuildingCopy.filter(x => this.#isAdjacentTo(currentCell!, x));
  
        for (const cell of adjCells) {
          cell.hover();
          queue.push(cell);
          sameBuildingCopy.splice(sameBuildingCopy.indexOf(cell), 1);
        }

      }

      curDepth++;

    }

  }

  #isAdjacentTo(target: Selectable, cell: Selectable) {
    const testC = cell.getCoordinates();
    const targetC = target.getCoordinates();
    return (testC.y === targetC.y && testC.x <= targetC.x + 1 && testC.x >= targetC.x - 1) ||
      (testC.x === targetC.x && testC.y <= targetC.y + 1 && testC.y >= targetC.y - 1);
  }

  static getConnectingObjects(target: Selectable, objects: Selectable[]) {
    const targetC = target.getCoordinates();
    return objects.map(cell => {
      return {
        offsetX: cell.getCoordinates().x - targetC.x,
        offsetY: cell.getCoordinates().y - targetC.y,
        cell: cell,
      }
    }).filter(cellObj => (Math.abs(cellObj.offsetX) <= 1 && cellObj.offsetY === 0) ||
      (Math.abs(cellObj.offsetY) <= 1 && cellObj.offsetX === 0))
      .filter(cellObj => cellObj.cell != target);
  }


}