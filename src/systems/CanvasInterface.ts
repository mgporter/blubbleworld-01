import { Camera, Mesh, Object3D, Raycaster, Scene, WebGLRenderer } from "three";
import { Lights } from "../objects/Lights";
import { Board } from "./Board";
import { Animatable, FinishSelectionObject, Selectable, Selector } from "../types";
import { MyFlyControls } from "./MyFlyControls";
import { ConnectingSelector, EmptySelector, MouseEventHandler } from "./MouseEventHandlers";
import { SelectableMesh } from "../objects/SelectableMesh";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";
import { MyScene } from "../objects/MyScene";
import { MyPerspectiveCamera } from "../objects/MyPerspectiveCamera";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { Buildable, BuildableType, Buildables } from "../Buildables";
import { ModelInterface } from "../objects/ModelInterface";
import CTr from "./CoordinateTranslator";

export default class CanvasInterface {

  // These are set with the onCreated callback in the react-three 
  // Canvas element and should never be null
  #scene: Scene;
  #camera: Camera;
  #raycaster: Raycaster;
  #renderer!: WebGLRenderer;

  // Control objects
  #board: Board | null;
  #flyControls!: MyFlyControls | null;
  #mouseEvents!: MouseEventHandler | null;
  #modelInterface;

  // Collections
  #selectables: (SelectableMesh | SelectableInstancedMesh)[]
  #animatables: Animatable[];

  constructor() {
    this.#scene = new MyScene();
    this.#camera = new MyPerspectiveCamera(35, 1, 0.1, 100);
    this.#raycaster = new Raycaster();

    this.#flyControls = null;
    this.#board = null;
    this.#animatables = [];
    this.#selectables = [];
    this.#mouseEvents = null;

    this.#modelInterface = new ModelInterface();
  }

  get scene() {return this.#scene;}
  get camera() {return this.#camera;}
  get renderer() {return this.#renderer;}
  get raycaster() {return this.#raycaster;}

  setState(scene: Scene, camera: Camera, renderer: WebGLRenderer, raycaster: Raycaster) {
    this.#scene = scene;
    this.#camera = camera;
    this.#renderer = renderer;
    this.#raycaster = raycaster;

    this.init();
  }

  init() {

    console.log("CanvasInterface init");
    /* This cannot be set in the constructor because when the object
    is constructed, we do not have a reference to the renderer */
    this.#flyControls = new MyFlyControls(this.#camera, this.#renderer);

    this.#mouseEvents = new MouseEventHandler(
      this.#camera,
      this.#raycaster,
      this.#renderer,
      this.#selectables,
      );

    this.#modelInterface = new ModelInterface();

  }

  enableFlyControls() {
    if (!this.#flyControls) return;
    this.#flyControls!.enable();
    this.#animatables.push(this.#flyControls!);
  }

  disableFlyControls() {
    if (!this.#flyControls) return;
    this.#flyControls.dispose();
    this.#animatables.splice(this.#animatables.indexOf(this.#flyControls), 1);
  }

  enableMouseHandler() {
    // if (!this.#mouseEvents) return;
    this.#mouseEvents!.enable();
  }

  disableMouseHandler() {
    // if (!this.#mouseEvents) return;
    this.#mouseEvents!.dispose();
  }

  updateAnimatables(delta: number) {
    for (const obj of this.#animatables) {
      obj.update(delta);
    }
  }

  /** Pass in a selector, or "null" to disable */
  setSelector(selector: Selector | null) {
    // if (!this.#mouseEvents) this.#mouseEvents = new MouseEventHandler(
    //   this.#camera,
    //   this.#raycaster,
    //   this.#renderer,
    //   this.#selectables,
    //   );
    if (selector) this.#mouseEvents!.setSelector(selector);
    else this.#mouseEvents!.setSelector(new EmptySelector());
  }

  getSelector() {
    // if (!this.#mouseEvents) return;
    return this.#mouseEvents!.getSelector();
  }

  buildWorld(sizeX: number, sizeY: number, pondPercent: number, mountainPercent: number, seed: number | null) {
    const directionalLight = Lights.createDirectionalLight();
    const ambientLight = Lights.createAmbientLight();
    this.#scene.add(directionalLight, ambientLight);
    this.#board = new Board(sizeX, sizeY, pondPercent, mountainPercent, seed);
    this.#board.addBoardToScene(this.#scene);
    this.#selectables = this.#board.getSelectables();

    this.#mouseEvents!.setObjects(this.#selectables);
  }

  placeBuilding(building: Buildable, data: FinishSelectionObject) {

    if (data.objects == null) return;

    if (MouseEventHandler.isTwoPhaseSelector(building.selector)) {
      data.objects.forEach(x => {
        const model = this.#addBuildableToBoard(x, building);
        x.addBuildable(building, model.id);
      });
    } 

    else if (MouseEventHandler.isConnectingSelector(building.selector)) {
      if (data.target == null) return;
      const model = this.#addBuildableToBoard(data.target, building);
      data.target.addBuildable(building, model.id);

      const adjCells = ConnectingSelector.getConnectingObjects(data.target, data.objects);
      
      for (const adjCell of adjCells) {

        const connectorModel = this.#modelInterface.getModel(`${building.keyName}_Connector`);
        console.log(adjCell.offsetX, adjCell.offsetY);
        connectorModel.position.x = -(adjCell.offsetX * 0.5);
        connectorModel.position.y = 0;
        connectorModel.position.z = (adjCell.offsetY * 0.5);
        model.add(connectorModel);
      }

    }
    
    else {
      if (data.target == null) return;
      const model = this.#addBuildableToBoard(data.target, building);
      data.objects.forEach(x => x.addBuildable(building, model.id));
    }

  }

  #addBuildableToBoard(mesh: Selectable, building: Buildable) {
    const coordinates = mesh.getCoordinates();

    const level = mesh.getBuildables().length;

    const model = this.#modelInterface.getModel(building.keyName);
    model.position.x += CTr.boardToMouse(coordinates.y);
    model.position.y += (level * building.mesh.heightIncrementor);
    model.position.z += CTr.boardToMouse(coordinates.x);

    this.#scene.add(model);

    return model;

  }

  removeBuilding(mesh: Mesh) {
    this.#scene.remove(mesh);
  }

  clearWorld() {
    this.#scene.clear();
  }

  disposeAll() {
    if (this.#flyControls) this.#flyControls.dispose();
    if (this.#mouseEvents) this.#mouseEvents.dispose();
  }

}