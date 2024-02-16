import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { BlubbleType, Blubbles, BuildableType, BuildableUserData, Buildables, MeshInfo } from '../Buildables';
import { Group } from 'three';

export interface MyGroup extends Omit<Group, "userData"> {
  userData: BuildableUserData;
}

class ModelInterface {

  #GLTFLoader;
  #models: Record<string, MyGroup>;
  #blubbles: Record<string, MyGroup>;

  constructor() {
    this.#GLTFLoader = new GLTFLoader();
    this.#models = {};
    this.#blubbles = {};

    this.#loadbuildings();
    this.#loadBlubbles();
  }

  #loadBlubbles() {

    for (const blubbleKey in Blubbles) {
      const blubble = Blubbles[(blubbleKey as BlubbleType)];
      this.#loadGLTF(blubble, blubbleKey);
    }

  }

  #loadbuildings() {

    for (const buildingKey in Buildables) {

      const buildable = Buildables[(buildingKey as BuildableType)];

      if (!buildable.mesh) continue;

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
    return (this.#models[modelName].clone() as MyGroup);
  }

  #loadGLTF(meshInfo: MeshInfo, name: string, userData?: BuildableUserData) {
    const glbFile = meshInfo.fileName;
    const position = meshInfo.initialPosition;
    const scale = meshInfo.initialScale;
    const rotation = meshInfo.initialRotation;

    this.#GLTFLoader.load(glbFile, (glb) => {

      // override the model type to use MyGroup instead of Group.
      // This way, we can control the type definitions, particularly
      // the userData type definition.
      const model = (glb.scene as MyGroup);

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