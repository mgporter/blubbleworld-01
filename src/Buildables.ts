import { Selector } from './types';
import { FixedRectangleSelector, FlexibleRectangleSelector } from './systems/MouseEventHandlers';

import houseIcon from './images/Building-house_icon_256.png';
import hotelIcon from './images/Building-hotel_icon_256.png';
import tentIcon from './images/Building-tent_icon_256.png';
import skyscraperIcon from './images/Building-skyscraper_icon_256.png';

import skyscraperGLB from './models/skyscraper.glb';
import houseGLB from './models/house.glb';
import { Vector3 } from 'three';

export type Buildable = {
  displayName: string,
  keyName: string,
  plural: string,
  price: number,
  icon: string,
  capacity: number,
  maxHeight: number,
  description: string,
  selector: Selector,
  iconAspectRatio: number,
  mesh: {
    fileName: string,
    initialPosition: Vector3,
    initialScale: Vector3,
    initialRotation: Vector3,
    heightIncrementor: number,
  }
}

type BuildableList = Record<string, Buildable>;

export type BuildableType = keyof BuildableList;

export const Buildables: BuildableList = {
  house: {
    displayName: "House",
    keyName: "house",
    plural: "houses",
    price: 35,
    icon: houseIcon,
    iconAspectRatio: 1.59,
    capacity: 4,
    maxHeight: 1,
    description: "Houses are general-purpose dwellings that hold four blubbles per square.",
    selector: new FlexibleRectangleSelector(true, false, 5, 5),
    mesh: {
      fileName: houseGLB,
      initialPosition: new Vector3(-0.94, 0.6, -0.945),
      initialScale: new Vector3(0.9, 0.9, 0.9),
      initialRotation: new Vector3(0, -Math.PI/2, 0),
      heightIncrementor: 0,
    }
  },
  hotel: {
    displayName: "Hotel",
    keyName: "hotel",
    plural: "hotels",
    price: 60,
    icon: hotelIcon,
    iconAspectRatio: 1.113,
    capacity: 4,
    maxHeight: 1,
    description: "Hotels hold four blubbles, but hold more blubbles the bigger they get. Two hotels together hold 5 each, three hotels hold 6 each, and four hotels hold 7 each.",
    selector: new FixedRectangleSelector(false, 1, 1),
    mesh: {
      fileName: houseGLB,
      initialPosition: new Vector3(0.05, 0.6, 0.1),
      initialScale: new Vector3(0, 0, 0),
      initialRotation: new Vector3(0, 0, 0),
      heightIncrementor: 0,
    }
  },
  tent: {
    displayName: "Big Tent",
    keyName: "tent",
    plural: "tents",
    price: 10,
    icon: tentIcon,
    iconAspectRatio: 1.73,
    capacity: 2,
    maxHeight: 1,
    description: "Tents are cheap structures that hold two blubbles per square.",
    selector: new FlexibleRectangleSelector(true, false, 5, 5),
    mesh: {
      fileName: skyscraperGLB,
      initialPosition: new Vector3(-0.42, 0.61, 0.55),
      initialScale: new Vector3(0, 0, 0),
      initialRotation: new Vector3(0, 0, 0),
      heightIncrementor: 0.48,
    }
  },
  skyscraper: {
    displayName: "Skyscraper",
    keyName: "skyscraper",
    plural: "skyscrapers",
    price: 225,
    icon: skyscraperIcon,
    iconAspectRatio: 0.59375,
    capacity: 12,
    maxHeight: 5,
    description: "Skycrapers are expensive buildings that can hold many blubbles using few squares. Each 2x2 level holds 12 bubbles, and you can build a skyscraper up to 5 levels.",
    selector: new FixedRectangleSelector(true, 2, 2),
    mesh: {
      fileName: skyscraperGLB,
      initialPosition: new Vector3(-1.42, 0.61, -0.45),
      initialScale: new Vector3(1, 1, 1),
      initialRotation: new Vector3(0, 0, 0),
      heightIncrementor: 0.48,
    }
  },
}