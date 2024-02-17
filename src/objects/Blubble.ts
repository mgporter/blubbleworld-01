import { AnimationAction, AnimationClip, AnimationMixer, LoopOnce, Vector3, VectorKeyframeTrack } from "three";
import { MyGroup } from "../systems/ModelInterface";
import { Animatable } from "../types";


function generateBounceAnimationClip(height: number = 0.5) {
  
  const bounceKF = new VectorKeyframeTrack(
    ".position",
    [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    [
      0, height*0, 0,
      0, height*0.1, 0,
      0, height*0.36, 0,
      0, height*0.62, 0,
      0, height*0.9, 0,
      0, height*1, 0,
      0, height*0.9, 0,
      0, height*0.64, 0,
      0, height*0.38, 0,
      0, height*0.1, 0,
      0, height*0, 0,
    ],
  );

  return new AnimationClip("bounce", -1, [bounceKF]);

}

const defaultBounceAnimationClip = generateBounceAnimationClip();

function generateTravelAnimationClip(to: Vector3) {

  // const toX = -(to.y); // - is front / + is back
  // const toY = to.z + 0.7;  // - is down / + is up
  // const toZ = -(to.x);  // - is left / + is right

  const randomX = Math.random() - 0.5;
  const randomZ = Math.random() - 0.5;


  const travelKF = new VectorKeyframeTrack(
    ".position",
    [0, 1],
    [
      -to.y + randomX, to.z + 0.7, -0.5 + randomZ, 
      -to.y + randomX, to.z + 0.7, -to.x + randomZ,
    ],
  );

  return new AnimationClip("travel", -1, [travelKF]);

}








export class Blubble implements Animatable {

  #model;
  #bounceClip;
  #bounceMixer;
  #travelMixer;
  #bounceAction;
  #travelAction: AnimationAction | null;
  #travelDistance = 0;
  #callbackOnDispose;
  #_dispose;

  removeAfterTravel = true;


  constructor(model: MyGroup, callbackOnDispose?: () => void) {
    this.#model = model;

    this.#bounceClip = defaultBounceAnimationClip;
    this.#bounceMixer = new AnimationMixer(this.#model.children[0]);
    this.#bounceAction = this.#bounceMixer.clipAction(this.#bounceClip);

    this.#travelAction = null
    this.#travelMixer = new AnimationMixer(this.#model);

    this.#callbackOnDispose = callbackOnDispose || (() => {});
    this.#_dispose = this.#dispose.bind(this);
  }

  getModel() {
    return this.#model;
  }

  setBounceSpeed(speed: number) {
    this.#bounceAction.setDuration(0.5 / speed);
  }

  setTravelSpeed(speed: number) {
    if (!this.#travelAction) return;
    this.#travelAction.setDuration(this.#travelDistance / speed);
  }

  bounce() {
    this.#bounceAction.play();
  }

  travel() {
    if (!this.#travelAction) return;
    this.#travelAction.play();

    if (this.removeAfterTravel) {
      this.#travelMixer.addEventListener('finished', this.#_dispose);
    }
  }

  setTravel(from: "left", toCoordinates: Vector3) {

    /* To implement: blubbles come from other directions */

    const travelClip = generateTravelAnimationClip(toCoordinates);
    this.#travelAction = this.#travelMixer.clipAction(travelClip);
    this.#travelAction.setLoop(LoopOnce, 1);
    this.#travelDistance = -0.5 - toCoordinates.x + 1;
  }

  #dispose() {
    this.#model.clear();
    this.#callbackOnDispose();
    this.#travelMixer.removeEventListener('finished', this.#_dispose);
    if (this.#model.parent) {
      this.#model.parent.remove(this.#model);
    }
  }

  update(delta: number) {
    this.#bounceMixer.update(delta);
    this.#travelMixer.update(delta);
  }

}