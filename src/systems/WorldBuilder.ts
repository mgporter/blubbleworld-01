import { AxesHelper, Camera, GridHelper, Raycaster, Scene, Vector2 } from "three";
import { Lights } from "../objects/Lights";
import { Board } from "./Board";
import { MouseSelectRect } from "./MouseSelectRect";
import { Selector } from "../types";

class WorldBuilder {

  zSize = 18;   // Left to Right dimension
  xSize = 12;   // Top to Bottom dimension
  pondPercent = 30;   // tiles below this percent are pond
  mountainPercent = 70;   // tiles above this percent are mountain

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

    this.#board = new Board(this.zSize, this.xSize, this.pondPercent, this.mountainPercent);
    this.#board.addBoardToScene(this.#scene);

  }

  setAndEnableBoardSelector(type: "single" | "rectangle", callback: (selection: Vector2[]) => void) {
    if (type === "rectangle") {
      this.#boardSelector = new MouseSelectRect(
        this.#camera, 
        this.#domElement, 
        this.#raycaster,
        this.#board.getSelectables(), 
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