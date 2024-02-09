import { Selector } from './types';
import { ConnectingSelector, FixedRectangleSelector, FlexibleRectangleSelector } from './systems/MouseEventHandlers';

import houseIcon from './images/Building-house_icon_256.png';
import hotelIcon from './images/Building-hotel_icon_256.png';
import tentIcon from './images/Building-tent_icon_256.png';
import skyscraperIcon from './images/Building-skyscraper_icon_256.png';

import skyscraperGLB from './models/skyscraper.glb';
import houseGLB from './models/house.glb';
import tentGLB from './models/tent.glb';
import hotelGLB from './models/hotel.glb';
import hotelConnectorGLB from './models/hotel_connector.glb';
import { Vector3 } from 'three';

export type MeshInfo = {
  fileName: string,
  initialPosition: Vector3,
  initialScale: Vector3,
  initialRotation: Vector3,
  heightIncrementor: number,
}

export type Buildable = {
  displayName: string,
  keyName: BuildableType,
  plural: string,
  price: number,
  icon: string,
  capacity: number,
  maxHeight: number,
  description: string,
  selector: Selector,
  iconAspectRatio: number,
  mesh: MeshInfo,
  connector: MeshInfo | null,
}

export type BuildableType = "house" | "hotel" | "tent" | "skyscraper";
export const BuildableNames = ["house", "hotel", "tent", "skyscraper"] as const;

type BuildableList = Record<BuildableType, Buildable>;

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
    selector: new FlexibleRectangleSelector({buildableMaxHeight: 1, allowIncompleteRectangles: true, maxLength: 5, maxWidth: 5}),
    mesh: {
      fileName: houseGLB,
      initialPosition: new Vector3(-0.94, 0.6, -0.945),
      initialScale: new Vector3(0.9, 0.9, 0.9),
      initialRotation: new Vector3(0, -Math.PI/2, 0),
      heightIncrementor: 0,
    },
    connector: null,
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
    selector: new ConnectingSelector({buildableMaxHeight: 1, buildingType: "hotel", maxDepth: 2}),
    mesh: {
      fileName: hotelGLB,
      initialPosition: new Vector3(-0.96, 0.61, -0.96),
      initialScale: new Vector3(1, 1, 1),
      initialRotation: new Vector3(0, -Math.PI/2, 0),
      heightIncrementor: 0,
    },
    connector: {
      fileName: hotelConnectorGLB,
      initialPosition: new Vector3(-0.96, 0.61, -0.96),
      initialScale: new Vector3(1, 1, 1),
      initialRotation: new Vector3(0, -Math.PI/2, 0),
      heightIncrementor: 0,
    }
  },
  tent: {
    displayName: "Tent",
    keyName: "tent",
    plural: "tents",
    price: 10,
    icon: tentIcon,
    iconAspectRatio: 1.73,
    capacity: 2,
    maxHeight: 1,
    description: "Tents are cheap structures that hold two blubbles per square.",
    selector: new FlexibleRectangleSelector({buildableMaxHeight: 1, allowIncompleteRectangles: true, maxLength: 5, maxWidth: 5}),
    mesh: {
      fileName: tentGLB,
      initialPosition: new Vector3(-0.94, 0.6, -0.945),
      initialScale: new Vector3(0.9, 0.9, 0.9),
      initialRotation: new Vector3(0, -Math.PI/2, 0),
      heightIncrementor: 0.48,
    },
    connector: null,
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
    selector: new FixedRectangleSelector({buildableMaxHeight: 5, length: 2, width: 2}),
    mesh: {
      fileName: skyscraperGLB,
      initialPosition: new Vector3(-1.42, 0.61, -0.45),
      initialScale: new Vector3(1, 1, 1),
      initialRotation: new Vector3(0, 0, 0),
      heightIncrementor: 0.48,
    },
    connector: null,
  },
}