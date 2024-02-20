import { Camera, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Raycaster, Scene, SphereGeometry, Vector3, WebGLRenderer } from "three";
import { Lights } from "../objects/Lights";
import { Board } from "./Board";
import { Selectable, Selector, Animatable } from "../types";
import { MyFlyControls } from "./MyFlyControls";
import { BaseSelector, ConnectingSelector, MouseEventHandler } from "./MouseEventHandlers";
import { SelectableMesh } from "../objects/SelectableMesh";
import { SelectableInstancedMesh } from "../objects/SelectableInstancedMesh";
import { MyScene } from "../objects/MyScene";
import { MyPerspectiveCamera } from "../objects/MyPerspectiveCamera";
import { Buildable } from "../Buildables";
import { ModelInterface, MyGroup } from "./ModelInterface";
import { Blubble } from "../objects/Blubble";
import { C } from "../Constants";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { InstancedMeshSelectionObject } from "../objects/InstancedMeshSelectionObject";


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

  #localMatrix = new Matrix4();
  #worldMatrix = new Matrix4();
  #projectionVector = new Vector3();

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
    // this.#flyControls = new OrbitControls(this.#camera, this.#renderer.domElement);

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

  getMouseCoordinatesOfSelectable(target: Selectable) {

    // Get world matrix of target
    if ((target as InstancedMeshSelectionObject).isInstancedSelectionObject) {

      (target as InstancedMeshSelectionObject).getMesh().getMatrixAt(target.getIndex(), this.#localMatrix);
      this.#worldMatrix.multiplyMatrices(target.getMesh().matrixWorld, this.#localMatrix);

    } else {

      this.#worldMatrix = target.getMesh().matrixWorld;

    }

    // Get position from world matrix and set offsets so that the 
    // vector point refers to the center of the top surface of the cell 
    this.#projectionVector.setFromMatrixPosition(this.#worldMatrix);
    this.#projectionVector.set(
      this.#projectionVector.x - 0.38,
      this.#projectionVector.y + this.#worldMatrix.toArray()[9] + 0.1,  // factor in the height of the cell when calculating height
      this.#projectionVector.z - 0.5,
    );

    this.#projectionVector.project(this.#camera);

    // Denormalize the value to mouse coordinates scaled to the canvas size
    this.#projectionVector.set(
      (0.5 + this.#projectionVector.x / 2) * window.innerWidth,
      (0.5 - this.#projectionVector.y / 2) * window.innerHeight,
      0,
    );

    return this.#projectionVector;
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

  placeBuilding(building: Buildable, objects: Selectable[], target: Selectable, callback: () => void) {

    switch(building.keyName) {
      case "tent":
      case "house": {

        objects.forEach(cell => {
          const model = this.#modelInterface.getModel(building.keyName);
          cell.addBuildable(model);
          this.moveBlubblesToCell(cell, building.capacity, callback);
        });

        break;
      }

      case "hotel": {

        const model = this.#modelInterface.getModel(building.keyName);
        target.addBuildable(model);

        const adjCells = ConnectingSelector.getConnectingObjects(target, objects);
        this.#addConnectorsToBoard(building, model, adjCells, callback);

        this.moveBlubblesToCell(target, building.capacity, callback);

        break;
      }


      case "skyscraper": {

        const model = this.#modelInterface.getModel(building.keyName);
        const height = target.getBuildables().length;
        const peoplePerCell = building.capacity / objects.length;
  
        if (building.mesh)
          model.position.z += height * building.mesh.heightIncrementor;
  
        objects.forEach(cell => {
          if (cell === target) cell.addBuildable(model);
          else cell.addBuildable(model, false);
          this.moveBlubblesToCell(cell, peoplePerCell, callback);
        });

        break;
      }
    }


    this.#mouseEvents?.updateObjects(objects);

  }

  #addConnectorsToBoard(
    building: Buildable, 
    model: MyGroup, 
    adjCells: {
      offsetX: number,
      offsetY: number,
      cell: Selectable,
    }[],
    callback: () => void) {
      
    for (const adjCell of adjCells) {

      const connectorModel = this.#modelInterface.getModel(`${building.keyName}_Connector`);
      connectorModel.position.x += -(adjCell.offsetX * 0.5);
      connectorModel.position.y += 0;
      connectorModel.position.z += adjCell.offsetY * 0.5;

      // Add connector to the actual mesh
      model.add(connectorModel);

      // If we want to add connections between cells with
      // multiple buildings, or with multiple levels, we will have to
      // change this.
      const adjBuilding = adjCell.cell.getBuildables()[0];

      // Store a reference to the buildings which are connected to each other
      model.userData.connections.push({connector: connectorModel, adjBuilding: adjBuilding});
      adjBuilding.userData.connections.push({connector: connectorModel, adjBuilding: model});
      // adjCell.cell.getBuildables()[0].userData.connectors.push(connectorModel);

      // Create blubbles for each connector
      this.moveBlubblesToCell(adjCell.cell, building.connectorCapacity, callback);
      
    }
  }

  bulldozeMountain(selectables: Selectable[]) {
    selectables.forEach(mountain => {
      const index = mountain.getIndex();
      const instancedMesh = mountain.getMesh() as SelectableInstancedMesh;

      const matrix = new Matrix4();

      instancedMesh.getMatrixAt(index, matrix);
      const array = matrix.toArray();

      // Copy the array exactly, except for one value set to "1"
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

  #removeBuilding(mesh: MyGroup, selectable: Selectable) {
    if (mesh.userData.connections.length > 0) {

      mesh.userData.connections.forEach(connection => {
        
        // Remove this connector from the userData of adjacent buildings
        connection.adjBuilding.userData.connections = 
          connection.adjBuilding.userData.connections.filter(adjConnection => (
            adjConnection.connector != connection.connector
          ));

        // Remove this connector from whatever parent it has
        connection.connector.parent?.remove(connection.connector);
      });

    }

    mesh.parent?.remove(mesh);
    selectable.removeBuilding();
  }

  moveBlubblesToCell(target: Selectable, count: number = 1, callback: () => void) {
    
    let current = 0;

    const interval = setInterval(() => {

      const blubbleModel = this.#modelInterface.getRandomBlubble();
      const blubble = new Blubble(blubbleModel, callback);
  
      blubble.setTravel("left", target.getCoordinates());
  
      blubble.setBounceSpeed(0.5 + Math.random());
      blubble.setTravelSpeed(C.blubbleBaseTravelSpeed);
  
      this.#animatables.push(blubble);

      blubble.bounce();
      blubble.travel();

      // Only the scene doesn't have a parent, so the parent property
      // here will never be null, because the scene is not a Selectable
      target.getMesh().parent!.add(blubble.getModel());

      if (++current == count) clearInterval(interval);

    }, 100 + Math.random() * 150 - 25);

  }

  clearWorld() {
    this.#scene.clear();
  }

  disposeAll() {
    if (this.#flyControls) this.#flyControls.dispose();
    if (this.#mouseEvents) this.#mouseEvents.dispose();
  }

}