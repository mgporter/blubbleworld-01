import { Selectable } from "../types";

// The record is: Record<EventNames, TypeOfDataToBeDispatched>

// eslint-disable-next-line
type EventMap = Record<string, any>;

type MouseEventList = "hover" | "selectionStart" | "selectionFinished";
type MouseEventMap = Record<MouseEventList, Selectable | Selectable[] | null>;

// type EventKey<T extends MouseEventMap> = keyof T;
// type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  dispatch<K extends keyof T> (event: K, data: T[K]): void;
  subscribe<K extends keyof T> (event: K, callback: (parameter: T[K]) => void): {unsubscribe: () => void};
}


function EventEmitter<T extends EventMap>(): Emitter<T> {

  // type K = keyof T;

  const eventList: {
    [K in keyof T]?: Record<number, (parameter: T[K]) => void>;
  } = {};

  let subscriptionIndex = 0;

  function isEmpty(obj: object) {
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        return false;
      }
    }
  
    return true;
  }

  return {
    dispatch(event, data) {
      if (eventList[event] != null)
      Object.values(eventList[event]!).forEach((callback) => {
        callback(data);
      });
    },

    subscribe(event, callback) {
      if (eventList[event]) eventList[event]![subscriptionIndex] = callback;
      else eventList[event] = [callback];
      const thisIndex = subscriptionIndex;
      subscriptionIndex++;

      return {
        unsubscribe: () => {
          if (eventList[event])
            delete eventList[event]![thisIndex];

          if (isEmpty(eventList[event]!))
            delete eventList[event];
        }
      }
    }
  }
}

const MouseEventEmitter = EventEmitter<MouseEventMap>();

export { MouseEventEmitter };
