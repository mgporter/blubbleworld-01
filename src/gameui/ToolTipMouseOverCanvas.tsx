import { useEffect, useState } from "react";
import { MouseEventEmitter } from "../systems/EventEmitter";
import { Selectable } from "../types";

const displayGridName = (selectable: Selectable | Selectable[] | null) => {
  if (selectable == null) {
    return "";
  }

  const displayName = (selectable as Selectable).getMesh().displayName;
  const coord = (selectable as Selectable).getCoordinates();
  return `${displayName} at (${-coord.x + 1}, ${-coord.y + 1})`;

};

export default function ToolTipMouseOverCanvas() {

  const [mouseHoverTip, setMouseHoverTip] = useState("");

  useEffect(() => {
    const subObj = MouseEventEmitter.subscribe("hover", (selectable) => {
      setMouseHoverTip(displayGridName(selectable));
    });

    return () => {
      subObj.unsubscribe();
    }
  }, []);

  return (
    <div className={"bg-white/20 rounded-xl w-48 text-center m-auto p-1 select-none " +
      (mouseHoverTip === "" ? "hidden " : " ") +
      (mouseHoverTip.startsWith("Grass") ? "text-white " : "text-red-400 font-medium")}>
      <p>{mouseHoverTip}</p>
    </div>
  )

}