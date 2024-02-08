import { Vector3 } from "three";


/* Translates mouse coordinates to the coordinates used in the WebGL Canvas.
 Mouse Coordinates:
 +X: RIGHT, -X: LEFT
 +Y: DOWN, -Y : UP

 InstancedMesh board objects:

Mouse coordinates are given in X (left to right) and Y () */
export default class CTr {

  static boardToMouse(coordinate: number) {
    return Math.abs(coordinate) + 1;
  }

}