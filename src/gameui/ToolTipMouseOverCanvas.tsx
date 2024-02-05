import { useEffect, useState } from "react";
import { MouseEventEmitter } from "../systems/EventEmitter";
import { Selectable } from "../types";

const displayGridName = (selectable: Selectable | null) => {
  if (selectable == null) return "";

  const displayName = selectable.getMesh().displayName;
  const coord = selectable.getCoordinates();
  return `${displayName} at (${Math.abs(coord.x) + 1}, ${Math.abs(coord.y) + 1})`;

};

export default function ToolTipMouseOverCanvas() {

  const [mouseHoverTip, setMouseHoverTip] = useState("");

  useEffect(() => {
    const subObj = MouseEventEmitter.subscribe("hover", (selectionObj) => {
      setMouseHoverTip(displayGridName(selectionObj.target));
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