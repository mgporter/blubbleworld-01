import { Camera, Raycaster, Scene } from "three";
import { noiseLevel } from "./types";

const C = {
  enableCameraLimits: true,             // limit camera movement
  worldsizeX: 18,                       // Left to Right dimension
  worldsizeY: 12,                       // Top to Bottom dimension
  pondPercent: 5,                      // tiles below this percent are pond
  mountainPercent: 5,                  // tiles above this percent are mountain
  mountainHeightMultiplier: 0.3,         // How tall the mountains are
  worldGenerationNoise: noiseLevel.LIGHT,    // Adds noise to the world generation algorithm
}

interface GlobalTypes {
  camera: Camera | null,
  scene: Scene | null,
  domCanvas: HTMLElement | null,
  raycaster: Raycaster | null,
}

// Global resource initialized to dummy values
const Globals: GlobalTypes = {
  camera: null,
  scene: null,
  domCanvas: null,
  raycaster: null,
}

export { C, Globals };