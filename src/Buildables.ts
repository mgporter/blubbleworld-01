import houseIcon from './images/Building-house_icon_256.png';
import hotelIcon from './images/Building-hotel_icon_256.png';
import tentIcon from './images/Building-tent_icon_256.png';
import skyscraperIcon from './images/Building-skyscraper_icon_256.png';
import { Selector } from './types';
import { FixedRectangleSelector, FlexibleRectangleSelector } from './systems/MouseEventHandlers';

export type BuildableValue = {
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
}

type BuildableObj = Record<string, BuildableValue>;

export type BuildableType = keyof BuildableObj;

export const Buildables: BuildableObj = {
  house: {
    displayName: "House",
    keyName: "house",
    plural: "houses",
    price: 6,
    icon: houseIcon,
    iconAspectRatio: 1.59,
    capacity: 1,
    maxHeight: 1,
    description: "Houses are cheap buildings that hold one blubble per square.",
    selector: new FlexibleRectangleSelector(),
  },
  hotel: {
    displayName: "Hotel",
    keyName: "hotel",
    plural: "hotels",
    price: 40,
    icon: hotelIcon,
    iconAspectRatio: 1.113,
    capacity: 4,
    maxHeight: 1,
    description: "Hotels can hold four blubbles per square.",
    selector: new FlexibleRectangleSelector(false),
  },
  tent: {
    displayName: "Big Tent",
    keyName: "tent",
    plural: "tents",
    price: 12,
    icon: tentIcon,
    iconAspectRatio: 1.73,
    capacity: 4,
    maxHeight: 1,
    description: "Tents are large structures. The more tents that are together, the more blubbles they can all hold.",
    selector: new FixedRectangleSelector(1, 1),
  },
  skyscraper: {
    displayName: "Skyscraper",
    keyName: "skyscraper",
    plural: "skyscrapers",
    price: 100,
    icon: skyscraperIcon,
    iconAspectRatio: 0.59375,
    capacity: 1,
    maxHeight: 8,
    description: "Skycrapers are expensive buildings that can hold many blubbles using few squares. You can build a skyscraper up to 8 levels.",
    selector: new FixedRectangleSelector(2, 4),
  },
}