import {
  Camera, 
  Mesh, 
  Raycaster, 
  Vector2 } from "three";

import { SelectableMesh } from "../objects/SelectableMesh";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";

type Selectables = SelectableMesh | SelectableInstancedMesh;

class MouseEvents {

  #camera;
  #canvas;
  #raycaster;
  #mouse;
  #objects: Selectables[];
  
  constructor(camera: Camera, canvas: HTMLElement, raycaster: Raycaster, objects: Selectables[]) {
    this.#camera = camera;
    this.#canvas = canvas;
    this.#raycaster = raycaster;
    this.#mouse = new Vector2();
    this.#objects = objects;
  }

  getCamera() {
    return this.#camera;
  }

  getCanvas() {
    return this.#canvas;
  }

  getObjects() {
    return this.#objects;
  }

  getIntersectedObject(e: MouseEvent) {
    this.#raycaster.setFromCamera(this.#getPointerCoordinates(e), this.#camera);
    return this.#raycaster.intersectObjects(this.#objects, false) as {object: Selectables}[];
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

}

export { MouseEvents };