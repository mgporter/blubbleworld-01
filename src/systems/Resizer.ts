import { Camera, PerspectiveCamera, WebGLRenderer } from "three";

class Resizer {
  
  #container;
  #camera;
  #renderer;

  constructor(container: HTMLElement, camera: Camera, renderer: WebGLRenderer) {

    this.#container = container;
    this.#camera = camera;
    this.#renderer = renderer;

    // Set initial size on load
    this.#setSize();

    // Set event listener
    window.addEventListener("resize", () => {
      this.#setSize();
      this.onResize();
    });

  }

  #setSize() {
    const cWidth = this.#container.clientWidth;
    const cHeight = this.#container.clientHeight;
    if (this.#camera instanceof PerspectiveCamera) {
      this.#camera.aspect = cWidth / cHeight;
      this.#camera.updateProjectionMatrix();
    }
    this.#renderer.setSize(cWidth, cHeight);
    this.#renderer.setPixelRatio(window.devicePixelRatio);
  }

  // Hook
  onResize() {}

}

export { Resizer };