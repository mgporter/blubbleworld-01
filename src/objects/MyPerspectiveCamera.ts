import { PerspectiveCamera } from "three";

class MyPerspectiveCamera extends PerspectiveCamera {

  constructor(fov: number, aspect: number, near: number, far: number) {
    super(fov, aspect, near, far);

    // Position: (DOWN, UP, RIGHT)
    this.position.set(-9,10,10);
    this.rotation.order = "YZX";

    // Rotation: (pointing up, pointing left, rotate in direction of view)
    this.rotation.set(-0.6, -1.45, 0);
  }

}

export { MyPerspectiveCamera };