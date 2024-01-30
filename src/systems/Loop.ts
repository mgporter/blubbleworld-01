import { Camera, Clock, Scene, WebGLRenderer } from "three";

import { MyFlyControls } from "./MyFlyControls";

interface Updatable {
  tick: (delta: number) => void;
}

class Loop {

  #updatables: Updatable[];
  #camera;
  #scene;
  #renderer;
  #clock;
  #controls;
  #count = 0;
  
  constructor(camera: Camera, scene: Scene, renderer: WebGLRenderer, controls: MyFlyControls) {
    this.#updatables = [];
    this.#camera = camera;
    this.#scene = scene;
    this.#renderer = renderer;
    this.#controls = controls;
    this.#clock = new Clock();
  }

  addUpdatable(obj: Updatable) {
    this.#updatables.push(obj);
  }

  start() {
    this.#renderer.setAnimationLoop(() => {
      this.#animate();
      this.#renderer.render(this.#scene, this.#camera);
    })
  }

  stop() {
    this.#renderer.setAnimationLoop(null);
  }

  #animate() {
    const delta = this.#clock.getDelta();
    for (const obj of this.#updatables) {
      obj.tick(delta);
    }
    this.#controls.update(delta);
  }

}

export { Loop };