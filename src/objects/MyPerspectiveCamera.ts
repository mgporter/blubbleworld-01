import { PerspectiveCamera } from "three";

class MyPerspectiveCamera extends PerspectiveCamera {

  constructor(fov: number, aspect: number, near: number, far: number) {
    super(fov, aspect, near, far);

    // Position: (RIGHT, UP, DOWN)
    this.position.set(-4,6,12);
    this.rotation.order = "YZX";
    this.rotation.set(-0.6, -1.4, 0);
  }

}

export { MyPerspectiveCamera };