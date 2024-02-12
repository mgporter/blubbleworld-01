import { useEffect, useState } from "react";
import { MouseEventEmitter } from "../systems/EventEmitter";
import { Selectable } from "../types";
import CTr from "../systems/CoordinateTranslator";
import { BuildableUserData } from "../Buildables";
import { capitalize } from "../Utils";

const displayGridName = (selectable: Selectable) => {
  const displayName = selectable.getMesh().displayName;
  const coord = selectable.getCoordinates();

  // userData is defined as type Record<string, any> by Three.js, so we need a cast here
  const buildingName = selectable.getBuildables().length > 0 ?
    ` with ${(selectable.getBuildables()[0].userData as BuildableUserData).displayName}` : "";

  const string = 
    `${displayName}${buildingName} at (${CTr.boardToMouse(coord.x)}, ${CTr.boardToMouse(coord.y)})`;
  
  return capitalize(string);

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
      setMouseHoverTip(text);

      if (selectionObj.target!.isSelectable()) {
        setTextStyle({color: "rgb(230, 230, 230)", fontWeight: "400"});
      } else {
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