import { AxesHelper, GridHelper, Scene } from "three";
import { Lights } from "../objects/Lights";
import { Board } from "./Board";
import { Selector } from "../types";
import { C } from "../Constants";

class WorldBuilder {

  worldsizeX;   
  worldsizeY;   
  pondPercent;   
  mountainPercent;

  
  #board;
  #scene;

  constructor() {

    this.worldsizeX = C.worldsizeX;
    this.worldsizeY = C.worldsizeY;
    this.pondPercent = C.pondPercent;
    this.mountainPercent = C.mountainPercent;

    this.#scene = Globals.scene || new Scene();

    const directionalLight = Lights.createDirectionalLight();
    const ambientLight = Lights.createAmbientLight();
    this.#scene.add(directionalLight, ambientLight);

    this.#board = new Board(C.worldsizeX, C.worldsizeY, this.pondPercent, this.mountainPercent);
    this.#board.addBoardToScene(this.#scene);

  }

  addHelperObjects() {
    this.#scene.add(
      new AxesHelper(5),
      new GridHelper(10, 10)
    );
  }

  getBoardObjects() {
    return this.#board.getSelectables();
  }

  clearWorld() {
    this.#scene.clear();
  }

}

export { WorldBuilder };