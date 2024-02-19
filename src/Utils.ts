import { NonNullableFinishSelectionObject } from "./types";
import { Buildable } from "./Buildables";
import { MouseEventHandler } from "./systems/MouseEventHandlers";

export function forEachFilter<T>(
  objects: T[],
  filter: (x: T) => boolean, 
  callbackForPass: (x: T) => void, 
  callbackForReject: (x: T) => void)
{
  objects.forEach(obj => {
    if (filter(obj)) callbackForPass(obj);
    else callbackForReject(obj);
  });
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.substring(1);
}

export function boardToMouse(coordinate: number) {
  return Math.abs(coordinate) + 1;
}

export function calculateTransactionAmount(building: Buildable, selection: NonNullableFinishSelectionObject) {

  switch(building.keyName) {

    case "bulldoze": {
      return building.price;
    }

    case "demolish": {
      if (selection.target.isOccupied()) {
        return selection.target.getBuildables()[0].userData.price;
      } else {
        return Number.MAX_VALUE;
      }
    }

    // For all buildings
    default: {
      const quantityBought = MouseEventHandler.isTwoPhaseSelector(building.selector) ?
        selection.objects.length : 1;
      return building.price * quantityBought;
    }
  }
}