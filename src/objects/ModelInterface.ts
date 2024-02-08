import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Buildables } from '../Buildables';
import { Object3D } from 'three';

type modelHolder = Record<string, Object3D>;

class ModelInterface {

  #GLTFLoader;
  #models: modelHolder;

  constructor() {
    this.#GLTFLoader = new GLTFLoader();
    this.#models = {};

    this.init();
  }

  init() {

    for (const building in Buildables) {
      const glbFile = Buildables[building].mesh.fileName;
      const position = Buildables[building].mesh.initialPosition;
      const scale = Buildables[building].mesh.initialScale;
      const rotation = Buildables[building].mesh.initialRotation;

      this.#GLTFLoader.load(glbFile, (glb) => {
        const model = glb.scene;
        model.position.set(position.x, position.y, position.z);
        model.scale.set(scale.x, scale.y, scale.z);
        model.rotation.set(rotation.x, rotation.y, rotation.z);
        this.#models[building] = model;
      });

    }

  }

  getModel(modelName: string) {
    return this.#models[modelName].clone();
  }

  // createSkyscraperBase(x: number, y: number, level: number) {
  //   this.#GLTFLoader.load(skyscraperGLB, (model) => {
  //     const mesh = model.scene;
  //     mesh.position.set(-0.42 + x, 0.61 + ((level - 1) * 0.48), 0.55 + y);
  //     this.#canvasInterface.placeBuilding(model.scene);
  //   });
  // }

}

export { ModelInterface };