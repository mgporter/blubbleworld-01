import { Selector } from './types';
import { BaseSelector, ConnectingSelector, FixedRectangleSelector, FlexibleRectangleSelector } from './systems/MouseEventHandlers';
import { Object3D, Vector3 } from 'three';

import houseIcon from './images/Building-house_icon_256.png';
import hotelIcon from './images/Building-hotel_icon_256.png';
import tentIcon from './images/Building-tent_icon_256.png';
import skyscraperIcon from './images/Building-skyscraper_icon_256.png';
import bulldozerIcon from './images/Bulldozer_icon_256.png';
import demolishIcon from './images/Demolish_icon_256.png';
import buildMenuIcon from './images/Build-menu-icon_256.png';

import skyscraperGLB from './models/skyscraper.glb';
import houseGLB from './models/house.glb';
import tentGLB from './models/tent.glb';
import hotelGLB from './models/hotel.glb';
import hotelConnectorGLB from './models/hotel_connector.glb';

import blubbleBlueGLB from './models/blubble_blue.glb';
import blubblePurpleGLB from './models/blubble_purple.glb';
import blubbleRedGLB from './models/blubble_red.glb';
import { MyGroup } from './systems/ModelInterface';

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
  connections: {
    connector: MyGroup,
    adjBuilding: MyGroup,
  }[],
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
  mesh?: MeshInfo,
  connector?: MeshInfo,
  connectorCapacity?: number,
}

export type BuildableType = "house" | "hotel" | "tent" | "skyscraper" | "bulldoze" | "demolish" | "noSelection";
export type BlubbleType = "blubbleBlue" | "blubblePurple" | "blubbleRed";
export const BlubbleTypeArray = ["blubbleBlue", "blubblePurple", "blubbleRed"];

type BuildableList = Record<BuildableType, Buildable>;

export const Buildables: BuildableList = {
  tent: {
    displayName: "tent",
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
  },

  house: {
    displayName: "house",
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
  },

  hotel: {
    displayName: "hotel",
    keyName: "hotel",
    plural: "hotels",
    price: 60,
    icon: hotelIcon,
    iconAspectRatio: 1.113,
    capacity: 5,
    maxHeight: 1,
    description: "Hotels hold five blubbles. When hotels are next to each other, they connect together, and each connection holds an additional two blubbles. The more connections, the more they hold!",
    selector: new ConnectingSelector({
      buildableMaxHeight: 1, 
      buildingType: "hotel", 
      maxBuildingsInChain: 12,
      maxDepth: Number.MAX_SAFE_INTEGER,
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
    },
    connectorCapacity: 2,
  },

  skyscraper: {
    displayName: "skyscraper",
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
  },

  demolish: {
    displayName: "demolish",
    keyName: "demolish",
    plural: "demolish",
    price: 0,
    icon: demolishIcon,
    iconAspectRatio: 1.3196,
    capacity: 0,
    maxHeight: Number.MAX_SAFE_INTEGER,
    description: "Demolishing a building allows you to build something new there. The cost to demolish is the same as the building you are demolishing.",
    selector: new ConnectingSelector({
      buildableMaxHeight: Number.MAX_SAFE_INTEGER, 
      maxDepth: Number.MAX_SAFE_INTEGER,
      maxBuildingsInChain: Number.MAX_SAFE_INTEGER,
      meshesToSelect: {isOccupied: true},
      meshesToHover: {canPlaceBuildable: true},
    }),
  },

  bulldoze: {
    displayName: "bulldoze",
    keyName: "bulldoze",
    plural: "bulldoze",
    price: 50,
    icon: bulldozerIcon,
    iconAspectRatio: 1.8156,
    capacity: 0,
    maxHeight: 1,
    description: "Use the bulldozer to flatten mountains, allowing you to build on them.",
    selector: new FixedRectangleSelector({
      buildableMaxHeight: Number.MAX_SAFE_INTEGER, 
      length: 1, 
      width: 1, 
      meshesToSelect: {name: "InstancedMountainCube", canPlaceBuildable: false, isOccupied: false},
      meshesToHover: {canPlaceBuildable: true},
    }),
  },

  noSelection: {
    displayName: "No selection",
    keyName: "noSelection",
    plural: "noSelection",
    price: 0,
    icon: buildMenuIcon,
    capacity: 0,
    maxHeight: 0,
    description: "No building has been selected",
    selector: new BaseSelector(),
    iconAspectRatio: 0.94140625,
  }

}


export const Blubbles: Record<BlubbleType, MeshInfo> = {
  blubbleBlue: {
    fileName: blubbleBlueGLB,
    initialPosition: new Vector3(0, 0, 0),
    initialScale: new Vector3(1, 1, 1),
    initialRotation: new Vector3(0, 0, 0),
    heightIncrementor: 0,
  },
  blubblePurple: {
    fileName: blubblePurpleGLB,
    initialPosition: new Vector3(0, 0, 0),
    initialScale: new Vector3(1, 1, 1),
    initialRotation: new Vector3(0, 0, 0),
    heightIncrementor: 0,
  },
  blubbleRed: {
    fileName: blubbleRedGLB,
    initialPosition: new Vector3(0, 0, 0),
    initialScale: new Vector3(1, 1, 1),
    initialRotation: new Vector3(0, 0, 0),
    heightIncrementor: 0,
  },
}