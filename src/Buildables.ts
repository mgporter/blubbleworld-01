import houseIcon from './images/Building-house_icon_256.png';
import hotelIcon from './images/Building-hotel_icon_256.png';
import tentIcon from './images/Building-tent_icon_256.png';
import skyscraperIcon from './images/Building-skyscraper_icon_256.png';

type BuildableValue = {
  displayName: string,
  plural: string,
  price: number,
  icon: string,
  capacity: number,
  maxHeight: number,
  description: string,
}

type BuildableObj = Record<string, BuildableValue>;

export type BuildableType = keyof BuildableObj;

export const Buildables: BuildableObj = {
  house: {
    displayName: "House",
    plural: "houses",
    price: 6,
    icon: houseIcon,
    capacity: 1,
    maxHeight: 1,
    description: "Houses are cheap buildings that hold one bubble per square."
  },
  hotel: {
    displayName: "Hotel",
    plural: "hotels",
    price: 40,
    icon: hotelIcon,
    capacity: 4,
    maxHeight: 1,
    description: "Hotels can hold four bubbles per square."
  },
  tent: {
    displayName: "Big Tent",
    plural: "tents",
    price: 12,
    icon: tentIcon,
    capacity: 4,
    maxHeight: 1,
    description: "Tents are large structures. The more tents that are together, the more blubbles they can all hold."
  },
  skyscraper: {
    displayName: "Skyscraper",
    plural: "skyscrapers",
    price: 100,
    icon: skyscraperIcon,
    capacity: 1,
    maxHeight: 8,
    description: "Skycrapers are expensive buildings that can hold many blubbles using few squares. You can build a skyscraper up to 8 levels."
  },
}