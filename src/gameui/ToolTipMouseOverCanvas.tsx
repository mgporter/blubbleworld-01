import { useEffect, useState } from "react";
import { MouseEventEmitter } from "../systems/EventEmitter";
import { Selectable } from "../types";
import CTr from "../systems/CoordinateTranslator";

const displayGridName = (selectable: Selectable) => {
  const displayName = selectable.getMesh().displayName;
  const coord = selectable.getCoordinates();
  const buildingName = selectable.getBuildables().length > 0 ?
    ` with ${selectable.getBuildables()[0].buildable.displayName.toLowerCase()}` : ""
  return `${displayName}${buildingName} at (${CTr.boardToMouse(coord.x)}, ${CTr.boardToMouse(coord.y)})`;

};

export default function ToolTipMouseOverCanvas() {

  const [mouseHoverTip, setMouseHoverTip] = useState("");
  const [textStyle, setTextStyle] = useState<React.CSSProperties>({display: "none"});

  useEffect(() => {
    const subObj = MouseEventEmitter.subscribe("hover", (selectionObj) => {
      if (selectionObj.target == null) {
        setTextStyle({display: "none"});
        return;
      }

      const text = displayGridName(selectionObj.target!);

      if (selectionObj.target!.isSelectable()) {
        setMouseHoverTip(text);
        setTextStyle({color: "rgb(230, 230, 230)", fontWeight: "400"});
      } else {
        setMouseHoverTip("Unselectable " + text);
        setTextStyle({color: "rgb(248, 113, 113)", fontWeight: "500"});
      }

    });

    return () => {
      subObj.unsubscribe();
    }
  }, []);

  return (
    <div className="bg-white/15 rounded-2xl px-8 text-center m-auto p-1 select-none"
      style={textStyle}>
      <p>{mouseHoverTip}</p>
    </div>
  )

}