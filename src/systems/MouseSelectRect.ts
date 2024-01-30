import { SelectableMesh } from "../objects/SelectableMesh";
import { Selector } from "../types";
import { MouseEvents } from "./MouseEvents";
import { Camera, Raycaster } from "three";



class MouseSelectRect extends MouseEvents implements Selector {

  #currentTarget: SelectableMesh | null = null;
  #originOfSelection: SelectableMesh | null = null;
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
    objects: SelectableMesh[],
    callback: (selection: SelectableMesh[]) => void) {
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
    const selected = (this.getObjects() as SelectableMesh[]).filter(x => x.isSelected());
    this.#callback(selected);
  }

  #onClick() {

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
    (this.getObjects() as SelectableMesh[]).filter(x => x.isSelected()).forEach(x => x.unselect());
  }

  #onMousedown() {}

  #onMouseup() {}

  #updateRectangleSelection(origin: SelectableMesh, target: SelectableMesh) {

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

    (this.getObjects() as SelectableMesh[]).forEach(x => {
      if (this.#inBounds(x, minX, maxX, minZ, maxZ)) {
        x.select();
      } else {
        x.unselect();
      }
    });

  }

  #inBounds(obj: SelectableMesh, minX: number, maxX: number, minZ: number, maxZ: number) {
    const coord = obj.getCoordinates();
    return coord.x >= minX && coord.x <= maxX && coord.z >= minZ && coord.z <= maxZ;
  }

  #onMousemove(e: MouseEvent) {

    const intersections = 
      this.getIntersectedObject(e) as {object: SelectableMesh}[];

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

        if (this.#currentTarget) this.#currentTarget.unselect();
        this.#currentTarget = intersections[0].object;
        this.#currentTarget.select();        

      } else {
        if (this.#currentTarget) this.#currentTarget.unselect();
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