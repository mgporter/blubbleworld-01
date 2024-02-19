import { SelectableMesh } from "../objects/SelectableMesh";
import { FinishSelectionObject, MeshName, Selector, SinglePhaseSelector, TwoPhaseSelector } from "../types";
import { Selectable } from "../types";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";
import { MouseEventEmitter } from "./EventEmitter";
import { Camera, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Raycaster, SphereGeometry, Vector2, Vector3, WebGLRenderer } from "three";
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

    this.#selector = selector || new BaseSelector();

    this.#camera = camera;
    this.#raycaster = raycaster;
    this.#renderer = renderer;
    this.#mouse = new Vector2();

    this.#_onClick = this.#onClick.bind(this);
    this.#_onMouseout = this.#onMouseout.bind(this);
    this.#_onMousemove = this.#onMousemove.bind(this);
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

    return this.#mouseoverTarget;

  }

  #getIntersectedObject(e: MouseEvent) {
    this.#raycaster.setFromCamera(this.#getPointerCoordinates(e), this.#camera);
    return (this.#raycaster.intersectObjects(objects, false) as unknown) as Intersection[];
  }

  #getPointerCoordinates(e: MouseEvent) {   
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
      
      this.#selector.handleMouseOverTarget(mouseoverTarget);
      
      if (mouseoverTarget.isHoverable()) {
        
        if (this._currentTarget) this.#selector.handleMouseLeaveTarget(this._currentTarget);
        this._currentTarget = mouseoverTarget;

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










/** The BaseSelector class does not provide an implementation for
 * mouse events. It mostly supplies base logic for setting which
 * meshes are selectable and/or hoverable.
 */
export class BaseSelector implements Selector {

  protected meshesToSelect;
  protected meshesToHover;
  isSelectionValid = true;
  protected selectionValidityConditions: ((target: Selectable) => boolean)[];

  protected insideRect: Selectable[];

  constructor(meshesToSelect?: SelectableProperties, meshesToHover?: SelectableProperties) {
    this.meshesToSelect = meshesToSelect == undefined ? {canPlaceBuildable: true} : meshesToSelect;
    this.meshesToHover = meshesToHover == undefined ? this.meshesToSelect : meshesToHover;

    this.insideRect = [];
    this.selectionValidityConditions = [];
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

  // Takes optional callback in order to add other conditions to the
  // selection validity.
  protected addHoverToInsideRect(target: Selectable) {

    if (this.selectionValidityConditions.some((x) => !x(target))) {
      this.isSelectionValid = false;
    } else {
      this.isSelectionValid = true;
    }

    this.insideRect.forEach(x => x.hover(this.isSelectionValid));
  }

  protected refreshInsideRect() {
    // Unhover old objects
    this.insideRect.forEach(x => x.unhover());

    // Reset the insideRect
    this.insideRect = [];

    // Push new objects into the insideRect
    selectables
      .filter(x => this.inBounds(x) && x.isHoverable())
      .forEach(x => this.insideRect.push(x));
  }

  // eslint-disable-next-line
  protected inBounds(cell: Selectable) {
    return true;
  }

  // methods to override by subclasses
  // eslint-disable-next-line
  handleMouseOverTarget(target: Selectable) {}
  // eslint-disable-next-line
  handleMouseLeaveTarget(target: Selectable) {}
  // eslint-disable-next-line
  handleMouseLeaveBoard(target: Selectable) {}  // This is fired only when NOT in selection mode
  allowStacking() {return false;}
  // eslint-disable-next-line
  handleSelectionFinished(target: Selectable): FinishSelectionObject {
    return {
      objects: null, 
      target: null, 
    }
  }
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

    // set conditions
    this.selectionValidityConditions.push(this.#selectionSizeCondition.bind(this));

    if (!this.#allowIncompleteRectangles) {
      this.selectionValidityConditions.push(this.#selectionIsExactRectangleCondition.bind(this));
    }

  }

  allowStacking() {return this.#buildableMaxHeight > 1;}

  // This is triggered before the first click. After
  // the first click, we go to selection mode and use 
  // the handleSelectionMode method for hovering
  handleMouseOverTarget(target: Selectable) {
    if (target.isSelectable()) {
      target.hover(true);
      this.isSelectionValid = true;
    } else if (target.isHoverable()) {
      target.hover(false);
      this.isSelectionValid = false;
    }
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

  handleSelectionFinished(target: Selectable) {

    return {
      objects: [...this.insideRect],
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
    this.refreshInsideRect();
    this.addHoverToInsideRect(target);
  }

  #selectionSizeCondition() {
    this.#lengthX = Math.abs((this.#maxX - this.#minX)) + 1;
    this.#lengthY = Math.abs((this.#maxY - this.#minY)) + 1;
    this.#totalCount = this.#lengthX * this.#lengthY;

    return (this.#maxLength <= -1 ? true : this.#lengthX <= this.#maxLength) &&
      (this.#maxWidth <= -1 ? true : this.#lengthY <= this.#maxWidth);
  }

  #selectionIsExactRectangleCondition() {
    return this.insideRect.length === this.#totalCount;
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

  // Override
  protected refreshInsideRect() {
    this.insideRect.forEach(x => x.unhover());
    this.insideRect = [];

    selectables
      .filter(x => this.inBounds(x) && x.isSelectable())
      .forEach(x => this.insideRect.push(x));
  }

  // Override
  protected inBounds(cell: Selectable) {
    const coord = cell.getCoordinates();
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

  protected lengthX;
  protected lengthY;
  protected totalCount;
  protected buildableMaxHeight;
  
  constructor({buildableMaxHeight, length, width, meshesToSelect, meshesToHover}: FixedRectangleSelectorProps) {
    super(meshesToSelect, meshesToHover);
    this.lengthX = (length && length > 1) ? length : 1;
    this.lengthY = (width && width > 1) ? width : 1;
    this.totalCount = this.lengthX * this.lengthY;
    this.buildableMaxHeight = (buildableMaxHeight && buildableMaxHeight > 1) ? buildableMaxHeight : 1;

    this.selectionValidityConditions.push(this.#cellsAreAllSelectableCondition.bind(this));

    if (this.buildableMaxHeight > 1) {
      this.selectionValidityConditions.push(this.#allowStackCondition.bind(this));
    }


  }

  allowStacking() {return this.buildableMaxHeight > 1;}

  handleMouseOverTarget(target: Selectable) {
    this.#setMinMaxCoordinates(target);
    this.refreshInsideRect();
    this.addHoverToInsideRect(target);
  }

  // >= totalCount is used because the subclass ConnectingSelector adds
  // its chain cells to the inside rect, while the totalCount is based on
  // the original size of the insideRect. This is a compromise to make this
  // condition work with both the hotel and demolish action.
  #cellsAreAllSelectableCondition() {
    return this.insideRect.filter(x => x.isSelectable()).length >= this.totalCount;
  }

  // See note above about using >= with totalCount.
  #allowStackCondition() {
    const occupiedCells = this.insideRect.filter(x => x.isOccupied());

    if (occupiedCells.length === 0) {
      return true;
    } else {

    // If there are occupied cells, we can allow a stack only if:
    // 1. all the cells are occupied, AND
    // 2. the building on the cells is not yet at maxHeight, AND
    // 3. all the cells are occupied by the same building.
    return occupiedCells.length >= this.totalCount &&
      occupiedCells[0].getBuildables().length < this.buildableMaxHeight &&
      occupiedCells.filter(x => x.getBuildables()[0].id === occupiedCells[0].getBuildables()[0].id).length >= this.totalCount;
    }

  }

  // eslint-disable-next-line
  handleMouseLeaveBoard(target: Selectable) {
    this.insideRect.forEach(x => x.unselectAndUnhover());
  }

  // eslint-disable-next-line
  handleMouseLeaveTarget(target: Selectable) {}

  handleSelectionFinished(target: Selectable) {

    return {
      objects: this.insideRect,
      target: target,
      data: {
        minX: this.#minX,
        maxX: this.#maxX,
        minY: this.#minY,
        maxY: this.#maxY,
        lengthX: this.lengthX,
        lengthY: this.lengthY,
        totalArea: this.totalCount,
        validCount: 1,
      }
    };
  }

  #setMinMaxCoordinates(target: Selectable) {
    const targetX = target.getCoordinates().x, targetY = target.getCoordinates().y;

    const offsetX = Math.floor((this.lengthX) / 2);
    const offsetY = Math.floor((this.lengthY - 1) / 2);

    this.#minX = targetX - offsetX;
    this.#maxX = targetX + (this.lengthX - offsetX - 1); 
    this.#minY = targetY - offsetY;
    this.#maxY = targetY + (this.lengthY - offsetY - 1);

  }

  // Override
  protected inBounds(cell: Selectable) {
    const coord = cell.getCoordinates();
    return coord.x >= this.#minX && coord.x <= this.#maxX && coord.y >= this.#minY && coord.y <= this.#maxY;
  }
}








interface ConnectingSelectorProps {
  buildableMaxHeight?: number;
  maxDepth: number;
  maxBuildingsInChain: number,
  buildingType?: BuildableType;
  meshesToSelect?: SelectableProperties,
  meshesToHover?: SelectableProperties,
}

/* Connecting selector allows a building to connect onto
existing buildings by detecting the cells around the selection. If
We do not pass in a building type, then the connecting selector
will only find buildings of the exact same ID. */
export class ConnectingSelector extends FixedRectangleSelector {

  #buildingType;
  #maxDepth;
  #maxBuildingsInChain;
  #buildingChain: Selectable[];
  #selectablesWithSameBuilding: Selectable[];
  isConnectingSelector = true;

  constructor({buildableMaxHeight, buildingType, maxDepth, meshesToSelect, meshesToHover, maxBuildingsInChain}: ConnectingSelectorProps) {
    super({buildableMaxHeight, length: 1, width: 1, meshesToSelect, meshesToHover});
    this.#buildingType = buildingType;
    this.#selectablesWithSameBuilding = [];
    this.#maxDepth = maxDepth;
    this.#maxBuildingsInChain = maxBuildingsInChain;
    this.#buildingChain = [];

    this.selectionValidityConditions.push(this.#chainsizeCondition.bind(this));
  }

  handleSelectionFinished(target: Selectable) {

    let minX: number = Number.MAX_SAFE_INTEGER, 
    maxX: number = Number.MIN_SAFE_INTEGER, 
    minY: number = Number.MAX_SAFE_INTEGER, 
    maxY: number = Number.MIN_SAFE_INTEGER;

    this.insideRect
      .forEach(x => {
        const coord = x.getCoordinates();
        minX = Math.min(minX, coord.x);
        maxX = Math.max(maxX, coord.x);
        minY = Math.min(minY, coord.y);
        maxY = Math.max(maxY, coord.y);
      });
    
    const lengthX = (maxX - minX) + 1;
    const lengthY = (maxY - minY) + 1;
    

    return {
      objects: [...this.insideRect],
      target: target,
      data: {
        minX: minX,
        maxX: maxX,
        minY: minY,
        maxY: maxY,
        lengthX: lengthX,
        lengthY: lengthY,
        totalArea: lengthX * lengthY,
        validCount: this.insideRect.length,
      }
    };
  }

  init(objectsToUpdate?: Selectable[]) {
    super.init(objectsToUpdate);

    // Update the array of cells that have the same building
    if (this.#buildingType) {
      this.#selectablesWithSameBuilding = 
        selectables.filter(x => x.isOccupied() && x.getBuildables()[0].name === this.#buildingType);
    } else {
      this.#selectablesWithSameBuilding = 
        selectables.filter(x => x.isOccupied());
    }

  }

  #createChain(target: Selectable) {

    this.#buildingChain = [];
    if (!target.isHoverable()) return;

    const buildingArray = this.#getChainBuildingArray(target);

    let curDepth = 0;
    const queue: Selectable[] = [target];

    while (queue.length > 0 && curDepth < this.#maxDepth) {

      let levelSize = queue.length;

      while (levelSize-- > 0) {
        const currentCell = queue.shift();
        const adjCells = buildingArray.filter(x => ConnectingSelector.#isAdjacentTo(currentCell!, x));
  
        for (const cell of adjCells) {
          this.#buildingChain.push(cell);
          queue.push(cell);
          buildingArray.splice(buildingArray.indexOf(cell), 1);
        }
      }
      curDepth++;
    }

  }

  #getChainBuildingArray(target: Selectable) {
    if (this.#buildingType) {

      // If a building type is specified, we will do our
      // search using all cells with the same building;
      return [...this.#selectablesWithSameBuilding];
    } else {

      // If no building type was specified, we will do a search
      // using an array of all buildings with the same ID
      // (the same building, essentially).
      if (target.isOccupied()) {
        return this.#selectablesWithSameBuilding
          .filter(x => x.getBuildables()[0].id === target.getBuildables()[0].id);
      } else {
        return [];
      }

    }
  }

  #chainsizeCondition() {
    // Because the buildingChain includes the current target (which doesn't
    // yet have a building, use '<' here instead of '=<' to make it work out correctly.
    return this.#buildingChain.length < this.#maxBuildingsInChain;
  }

  // Override
  handleMouseOverTarget(target: Selectable) {
    this.#createChain(target);
    super.handleMouseOverTarget(target);
  }

  // Override
  protected refreshInsideRect() {
    super.refreshInsideRect();

    // remove duplicates
    this.insideRect = this.insideRect.concat(
      this.#buildingChain.filter(obj => this.insideRect.indexOf(obj) === -1)
    );

  }

  static #isAdjacentTo(target: Selectable, other: Selectable) {
    const targetC = target.getCoordinates();
    const otherC = other.getCoordinates();

    return target != other &&
      ((Math.abs(targetC.x - otherC.x) <= 1 && targetC.y === otherC.y) ||
      (Math.abs(targetC.y - otherC.y) <= 1 && targetC.x === otherC.x));
  }

  static getConnectingObjects(target: Selectable, objects: Selectable[]) {
    const targetC = target.getCoordinates();
      
    return objects
      .filter(x => ConnectingSelector.#isAdjacentTo(target, x))
      .map(cell => {
        return {
            offsetX: cell.getCoordinates().x - targetC.x,
            offsetY: cell.getCoordinates().y - targetC.y,
            cell: cell,
          }
        });
  }
}