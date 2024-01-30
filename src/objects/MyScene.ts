import { Color, Scene } from "three";

class MyScene extends Scene {
  constructor() {
    super();
    this.background = new Color('skyblue');
  }
}

export { MyScene };