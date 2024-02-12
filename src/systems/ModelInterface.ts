import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { BuildableType, BuildableUserData, Buildables, MeshInfo } from '../Buildables';
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

      const buildable = Buildables[(buildingName as BuildableType)];

      const userData: BuildableUserData = {
        displayName: buildable.displayName,
        keyName: buildable.keyName,
        plural: buildable.plural,
        price: buildable.price,
        capacity: buildable.capacity,
        connectors: [],
      }

      this.#loadGLTF(buildable.mesh, buildable.keyName, userData);
      
      if (buildable.connector) {
        this.#loadGLTF(buildable.connector, `${buildable.keyName}_Connector`)
      }

    }

  }

  getModel(modelName: string) {
    return this.#models[modelName].clone();
  }

  #loadGLTF(meshInfo: MeshInfo, name: string, userData?: BuildableUserData) {
    const glbFile = meshInfo.fileName;
    const position = meshInfo.initialPosition;
    const scale = meshInfo.initialScale;
    const rotation = meshInfo.initialRotation;

    this.#GLTFLoader.load(glbFile, (glb) => {
      const model = glb.scene;

      if (userData) {
        model.userData = userData;
      }

      model.position.set(position.x, position.y, position.z);
      model.scale.set(scale.x, scale.y, scale.z);
      model.rotation.set(rotation.x, rotation.y, rotation.z);
      model.name = name;
      this.#models[name] = model;
    });
  }

}

export { ModelInterface };