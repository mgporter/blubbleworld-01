import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Buildable, BuildableNames, BuildableType, Buildables, MeshInfo } from '../Buildables';
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

    for (const buildingName in Buildables) {

      const building = Buildables[(buildingName as BuildableType)];
      this.#loadGLTF(building.mesh, building.keyName);
      
      if (building.connector) {
        this.#loadGLTF(building.connector, `${building.keyName}_Connector`)
      }

    }

  }

  getModel(modelName: string) {
    return this.#models[modelName].clone();
  }

  #loadGLTF(meshInfo: MeshInfo, name: string) {
    const glbFile = meshInfo.fileName;
    const position = meshInfo.initialPosition;
    const scale = meshInfo.initialScale;
    const rotation = meshInfo.initialRotation;

    this.#GLTFLoader.load(glbFile, (glb) => {
      const model = glb.scene;
      model.position.set(position.x, position.y, position.z);
      model.scale.set(scale.x, scale.y, scale.z);
      model.rotation.set(rotation.x, rotation.y, rotation.z);
      this.#models[name] = model;
    });
  }

}

export { ModelInterface };