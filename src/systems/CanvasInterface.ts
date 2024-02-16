import { Camera, Matrix4, Object3D, Raycaster, Scene, WebGLRenderer } from "three";
import { Lights } from "../objects/Lights";
import { Board } from "./Board";
import { Animatable, Selectable, Selector } from "../types";
import { MyFlyControls } from "./MyFlyControls";
import { BaseSelector, MouseEventHandler } from "./MouseEventHandlers";
import { SelectableMesh } from "../objects/SelectableMesh";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";
import { MyScene } from "../objects/MyScene";
import { MyPerspectiveCamera } from "../objects/MyPerspectiveCamera";
import { Buildable, BuildableUserData } from "../Buildables";
import { ModelInterface, MyGroup } from "./ModelInterface";


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
  #mouseEventsEnabled = false;
  #flyControlsEnabled = false;
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
    if (!this.#flyControls || this.#flyControlsEnabled) return;
    this.#flyControls!.enable();
    this.#animatables.push(this.#flyControls!);
    this.#flyControlsEnabled = true;
  }

  disableFlyControls() {
    if (!this.#flyControls || !this.#flyControlsEnabled) return;
    this.#flyControls.dispose();
    this.#animatables.splice(this.#animatables.indexOf(this.#flyControls), 1);
    this.#flyControlsEnabled = false;
  }

  enableMouseHandler() {
    if (!this.#mouseEvents || this.#mouseEventsEnabled) return;
    this.#mouseEvents.enable();
    this.#mouseEventsEnabled = true;
  }

  disableMouseHandler() {
    if (!this.#mouseEvents || !this.#mouseEventsEnabled) return;
    this.#mouseEvents.dispose();
    this.#mouseEventsEnabled = false;
  }

  updateAnimatables(delta: number) {
    for (const obj of this.#animatables) {
      obj.update(delta);
    }
  }

  /** Pass in a selector, or "null" to disable */
  setSelector(selector: Selector | null) {
    if (selector) this.#mouseEvents!.setSelector(selector);
    else this.#mouseEvents!.setSelector(new BaseSelector());
  }

  buildWorld(sizeX: number, sizeY: number, pondPercent: number, mountainPercent: number, seed: number | null) {
    const directionalLight = Lights.createDirectionalLight();
    const ambientLight = Lights.createAmbientLight();
    this.#scene.add(directionalLight, ambientLight);
    this.#board = new Board(sizeX, sizeY, pondPercent, mountainPercent, seed);
    this.#board.addBoardToScene(this.#scene);
    this.#selectables = this.#board.getSelectables();

    this.#mouseEvents?.setObjects(this.#selectables);
  }

  placeBuilding(building: Buildable, objects: Selectable[], target: Selectable) {

    if (MouseEventHandler.isTwoPhaseSelector(building.selector)) {
      objects.forEach(x => {
        const model = this.#modelInterface.getModel(building.keyName);
        x.addBuildable(model);
      });
    } 

    else if (MouseEventHandler.isConnectingSelector(building.selector)) {
      const model = this.#modelInterface.getModel(building.keyName);
      target.addBuildable(model);
      const adjCells = building.selector.getConnectingObjects(target, objects);

      this.#addConnectorToBoard(building, model, adjCells);
    }
    
    else {
      // Single Phase selector: currently only for Skyscraper
      const model = this.#modelInterface.getModel(building.keyName);

      // get Height info
      const level = target.getBuildables().length;

      if (building.mesh)
        model.position.z += level * building.mesh.heightIncrementor;

      objects.forEach(x => {
        if (x === target) x.addBuildable(model);
        else x.addBuildable(model, false);
      });

    }

    this.#mouseEvents?.updateObjects(objects);

  }

  #addConnectorToBoard(
    building: Buildable, 
    model: MyGroup, 
    adjCells: {
      offsetX: number,
      offsetY: number,
      cell: Selectable,
    }[]) {
      
    for (const adjCell of adjCells) {

      const connectorModel = this.#modelInterface.getModel(`${building.keyName}_Connector`);
      connectorModel.position.x += -(adjCell.offsetX * 0.5);
      connectorModel.position.y += 0;
      connectorModel.position.z += adjCell.offsetY * 0.5;

      // Add connector to the actual mesh
      model.add(connectorModel);

      // Store a reference to the connector inside both of the parts being connected
      model.userData.connectors.push(connectorModel);
      adjCell.cell.getBuildables()[0].userData.connectors.push(connectorModel);
      
    }
  }

  bulldozeMountain(selectables: Selectable[]) {
    selectables.forEach(mountain => {
      const index = mountain.getIndex();
      const instancedMesh = mountain.getMesh() as SelectableInstancedMesh;

      const matrix = new Matrix4();

      instancedMesh.getMatrixAt(index, matrix);
      const array = matrix.toArray();
      matrix.fromArray([
        array[0], array[1], array[2], array[3],
        array[4], array[5], array[6], array[7],
        array[8], array[9], 1, array[11],
        array[12], array[13], array[14], array[15],
      ]);
      
      instancedMesh.setMatrixAt(index, matrix);
      instancedMesh.instanceMatrix.needsUpdate = true;

      mountain.canPlaceBuildable = true;
    })

    this.#mouseEvents?.updateObjects(selectables);
  }

  demolishBuildings(selectables: Selectable[]) {
    selectables.forEach(x => {
      const model = x.getBuildables()[x.getBuildables().length - 1];
      this.#removeBuilding(model, x);
    })

    this.#mouseEvents?.updateObjects(selectables);
  }

  #removeBuilding(mesh: Object3D, selectable?: Selectable) {
    if ((mesh.userData as BuildableUserData).connectors) {
      (mesh.userData as BuildableUserData).connectors
        .forEach(x => x.parent?.remove(x));
    }
    mesh.parent?.remove(mesh);
    if (selectable) selectable.getBuildables().pop();
  }

  moveBlubblesToCell(target: Selectable, number: number) {

    const model = this.#modelInterface.getModel("blubbleBlue");

    model.position.x += -(target.getCoordinates().y); // - is front / + is back
    model.position.y += target.getCoordinates().z + 0.7;  // - is down / + is up
    model.position.z += -(target.getCoordinates().x);  // - is left / + is right

    // Only the scene doesn't have a parent, so the parent property
    // here will never be null, because the scene is not a Selectable
    target.getMesh().parent!.add(model);

  }


  clearWorld() {
    this.#scene.clear();
  }

  disposeAll() {
    if (this.#flyControls) this.#flyControls.dispose();
    if (this.#mouseEvents) this.#mouseEvents.dispose();
  }

}