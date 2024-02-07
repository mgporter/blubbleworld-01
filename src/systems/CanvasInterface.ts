import { Camera, Raycaster, Scene } from "three";
import { Lights } from "../objects/Lights";
import { Board } from "./Board";
import { RootState } from "@react-three/fiber";
import { Animatable, Control, Selector } from "../types";
import { MyFlyControls } from "./MyFlyControls";
import { EmptySelector, MouseEventHandler } from "./MouseEventHandlers";
import { SelectableMesh } from "../objects/SelectableMesh";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";
import { FlyControls } from "three/examples/jsm/Addons.js";
import { C } from "../Constants";

export default class CanvasInterface {

  // These are set with the onCreated callback in the react-three 
  // Canvas element and should never be null
  #scene!: Scene;
  #camera!: Camera;
  #canvas!: HTMLCanvasElement;
  #raycaster!: Raycaster;

  // Control objects
  #board: Board | null;
  #flyControls: MyFlyControls | null;
  #mouseEvents: MouseEventHandler | null;

  // Collections
  #selectables: (SelectableMesh | SelectableInstancedMesh)[]
  #animatables: Animatable[];




  constructor() {
    this.#flyControls = null;
    this.#board = null;
    this.#animatables = [];
    this.#selectables = [];
    this.#mouseEvents = null;
  }

  get scene() {return this.#scene;}
  get camera() {return this.#camera;}
  get canvas() {return this.#canvas;}
  get raycaster() {return this.#raycaster;}

  setState(state: RootState) {
    this.#scene = state.scene;
    this.#camera = state.camera;
    this.#canvas = state.gl.domElement;
    this.#raycaster = state.raycaster;
  }

  enableFlyControls() {
    if (!this.#flyControls) 
      this.#flyControls = new MyFlyControls(this.#camera, this.#canvas);
    this.#flyControls.enable();
    this.#animatables.push(this.#flyControls);
  }

  disableFlyControls() {
    if (!this.#flyControls) return;
    this.#flyControls.dispose();
    this.#animatables.splice(this.#animatables.indexOf(this.#flyControls), 1);
  }

  updateAnimatables(delta: number) {
    for (const obj of this.#animatables) {
      obj.update(delta);
    }
  }

  #createNewMouseEventHandler() {
    this.#mouseEvents = new MouseEventHandler(
      this.#camera,
      this.#raycaster,
      this.#canvas,
      this.#selectables,
      );
  }

  /** Pass in a selector, or "null" to disable */
  setSelector(selector: Selector | null) {
    if (!this.#mouseEvents) this.#createNewMouseEventHandler();
    if (selector) this.#mouseEvents!.setSelector(selector);
    else this.#mouseEvents?.setSelector(new EmptySelector());
  }

  getSelector() {
    return this.#mouseEvents?.getSelector();
  }

  buildWorld(sizeX: number, sizeY: number, pondPercent: number, mountainPercent: number, seed: number | null) {
    const directionalLight = Lights.createDirectionalLight();
    const ambientLight = Lights.createAmbientLight();
    this.#scene.add(directionalLight, ambientLight);
    this.#board = new Board(sizeX, sizeY, pondPercent, mountainPercent, seed);
    this.#board.addBoardToScene(this.#scene);
    this.#selectables = this.#board.getSelectables();
  }

  clearWorld() {
    this.#scene.clear();
  }

  disposeAll() {
    if (this.#flyControls) this.#flyControls.dispose();
    if (this.#mouseEvents) this.#mouseEvents.dispose();
  }

}