import { AxesHelper, Camera, GridHelper, Raycaster, Scene } from "three";
import { Lights } from "../objects/Lights";
import { Board } from "./Board";
import { MouseSelectRect } from "./MouseSelectRect";
import { Selector } from "../types";
import { MouseSelectRectInstanced } from "./MouseSelectRectInstanced";
import { SelectableMesh } from "../objects/SelectableMesh";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";

class WorldBuilder {

  zSize = 18;   // Left to Right dimension
  xSize = 12;   // Top to Bottom dimension
  pondPercent = 20;   // percent of tiles that are pond

  #camera;
  #scene;
  #domElement;
  #raycaster;
  
  #board;
  #boardSelector: Selector | null;

  constructor(camera: Camera, scene: Scene, domElement: HTMLElement, raycaster: Raycaster) {

    this.#camera = camera;
    this.#scene = scene;
    this.#domElement = domElement;
    this.#raycaster = raycaster;
    this.#boardSelector = null;

    const directionalLight = Lights.createDirectionalLight();
    const ambientLight = Lights.createAmbientLight();
    this.#scene.add(directionalLight, ambientLight);

    this.#board = new Board(this.zSize, this.xSize, this.pondPercent);
    this.#board.addBoardToScene(this.#scene);

  }

  setAndEnableBoardSelector(type: "single" | "rectangle", callback: (selection: SelectableMesh[] | SelectableInstancedMesh[]) => void) {
    if (type === "rectangle") {
      this.#boardSelector = new MouseSelectRectInstanced(
        this.#camera, 
        this.#domElement, 
        this.#raycaster,
        this.#board.getInstancedSelectables(), 
        callback);

      this.enableSelector(this.#boardSelector);

      return this.#boardSelector;
    } else {
      throw new Error();
    }
  }

  enableSelector(selector: Selector) {
    selector.enable();
  }

  disableSelector(selector: Selector) {
    selector.dispose();
  }

  addHelperObjects() {
    this.#scene.add(
      new AxesHelper(5),
      new GridHelper(10, 10)
    );
  }

  clearWorld() {
    this.#scene.clear();
  }

}

export { WorldBuilder };