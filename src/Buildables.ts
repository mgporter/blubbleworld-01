import { Selector } from './types';
import { ConnectingSelector, FixedRectangleSelector, FlexibleRectangleSelector } from './systems/MouseEventHandlers';

import houseIcon from './images/Building-house_icon_256.png';
import hotelIcon from './images/Building-hotel_icon_256.png';
import tentIcon from './images/Building-tent_icon_256.png';
import skyscraperIcon from './images/Building-skyscraper_icon_256.png';
import bulldozerIcon from './images/Bulldozer_icon_256.png';
import demolishIcon from './images/Demolish_icon_256.png';

import skyscraperGLB from './models/skyscraper.glb';
import houseGLB from './models/house.glb';
import tentGLB from './models/tent.glb';
import hotelGLB from './models/hotel.glb';
import hotelConnectorGLB from './models/hotel_connector.glb';
import { Object3D, Vector3 } from 'three';

export type MeshInfo = {
  fileName: string,
  initialPosition: Vector3,
  initialScale: Vector3,
  initialRotation: Vector3,
  heightIncrementor: number,
}

export type BuildableUserData = {
  displayName: string,
  keyName: BuildableType,
  plural: string,
  price: number,
  capacity: number,
  connectors: Object3D[],
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

export type BuildableType = "house" | "hotel" | "tent" | "skyscraper" | "bulldozer" | "demolish";

type BuildableList = Record<BuildableType, Buildable>;

export const Buildables: BuildableList = {
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
    selector: new FlexibleRectangleSelector({
      buildableMaxHeight: 1, 
      allowIncompleteRectangles: true, 
      length: 5, 
      width: 5,
      meshesToSelect: {canPlaceBuildable: true, isOccupied: false},
      meshesToHover: {canPlaceBuildable: true},
    }),
    mesh: {
      fileName: tentGLB,
      initialPosition: new Vector3(0.45, 0.45, 1.09),
      initialScale: new Vector3(0.9, 0.9, 0.9),
      initialRotation: new Vector3(Math.PI/2, -Math.PI, 0),
      heightIncrementor: 0.48,
    },
    connector: null,
  },

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
    selector: new FlexibleRectangleSelector({
      buildableMaxHeight: 1, 
      allowIncompleteRectangles: true, 
      length: 5, 
      width: 5,
      meshesToSelect: {canPlaceBuildable: true, isOccupied: false},
      meshesToHover: {canPlaceBuildable: true},
    }),
    mesh: {
      fileName: houseGLB,
      initialPosition: new Vector3(0.45, 0.45, 1.09),
      initialScale: new Vector3(0.9, 0.9, 0.9),
      initialRotation: new Vector3(Math.PI/2, -Math.PI, 0),
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
    selector: new ConnectingSelector({
      buildableMaxHeight: 1, 
      buildingType: "hotel", 
      maxDepth: 2,
      meshesToSelect: {canPlaceBuildable: true, isOccupied: false},
      meshesToHover: {canPlaceBuildable: true},
    }),
    mesh: {
      fileName: hotelGLB,
      initialPosition: new Vector3(0.45, 0.45, 1.075),
      initialScale: new Vector3(1, 1, 1),
      initialRotation: new Vector3(Math.PI/2, -Math.PI, 0),
      heightIncrementor: 0,
    },
    connector: {
      fileName: hotelConnectorGLB,
      initialPosition: new Vector3(0, 0, 0),
      initialScale: new Vector3(1, 1, 1),
      initialRotation: new Vector3(0, -Math.PI/2, 0),
      heightIncrementor: 0,
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
    selector: new FixedRectangleSelector({
      buildableMaxHeight: 5, 
      length: 2, 
      width: 2,
      meshesToSelect: {canPlaceBuildable: true},
    }),
    mesh: {
      fileName: skyscraperGLB,
      initialPosition: new Vector3(-0.05, 0.95, 1.085),
      initialScale: new Vector3(1, 1, 1),
      initialRotation: new Vector3(Math.PI/2, Math.PI/2, 0),
      heightIncrementor: 0.48,
    },
    connector: null,
  },

  demolish: {
    displayName: "Demolish",
    keyName: "demolish",
    plural: "demolish",
    price: 0,
    icon: demolishIcon,
    iconAspectRatio: 1.3196,
    capacity: 0,
    maxHeight: 0,
    description: "Demolishing a building allows you to build something new there. The cost to demolish is the same as the building you are demolishing.",
    selector: new FixedRectangleSelector({
      buildableMaxHeight: Number.MAX_SAFE_INTEGER, 
      length: 1, 
      width: 1,
      meshesToSelect: {isOccupied: true},
      meshesToHover: {canPlaceBuildable: true},
    }),
    mesh: {
      fileName: skyscraperGLB,
      initialPosition: new Vector3(0, 0, 0),
      initialScale: new Vector3(1, 1, 1),
      initialRotation: new Vector3(0, 0, 0),
      heightIncrementor: 0,
    },
    connector: null,
  },

  bulldozer: {
    displayName: "Bulldozer",
    keyName: "bulldozer",
    plural: "bulldozers",
    price: 50,
    icon: bulldozerIcon,
    iconAspectRatio: 1.8156,
    capacity: 0,
    maxHeight: 0,
    description: "Use the bulldozer to flatten mountains, allowing you to build on them.",
    selector: new FixedRectangleSelector({
      buildableMaxHeight: Number.MAX_SAFE_INTEGER, 
      length: 1, 
      width: 1, 
      meshesToSelect: {name: "InstancedMountainCube", canPlaceBuildable: false},
      meshesToHover: {canPlaceBuildable: true},
    }),
    mesh: {
      fileName: skyscraperGLB,
      initialPosition: new Vector3(0, 0, 0),
      initialScale: new Vector3(1, 1, 1),
      initialRotation: new Vector3(0, 0, 0),
      heightIncrementor: 0,
    },
    connector: null,
  },

}