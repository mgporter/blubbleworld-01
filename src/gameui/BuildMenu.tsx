import NavSelectionOption from "./NavSelectionOption";

import { useState } from "react";
import { BuildableType, Buildables } from "../Buildables";
import { motion } from "framer-motion";
import { capitalize } from "../Utils";
import { UiProps } from "./UiProperties";

interface BuildMenuProps {
  onBuildingSelect: (buildingType: BuildableType) => void,
  buildMenuEnabled: boolean,
  selectedBuilding: BuildableType,
}

export default function BuildMenu({onBuildingSelect, buildMenuEnabled, selectedBuilding}: BuildMenuProps) {

  const [showMenu, setShowMenu] = useState(false);

  let menuWidth, menuHeight, itemsOpacity, itemsDelay, itemsDuration, itemsPointerEvents;

  const buildings = [
    Buildables.tent,
    Buildables.house,
    Buildables.hotel,
    Buildables.skyscraper,
  ];

  const otherOptions = [
    Buildables.demolish,
    Buildables.bulldoze,
    Buildables.marker,
  ];

  if (showMenu) {
    menuWidth = "17rem";
    menuHeight = "96%";
    itemsOpacity = 1;
    itemsDelay = 0.24;
    itemsDuration = 0.2;
    itemsPointerEvents = "pointer-events-auto";
  } else {
    menuWidth = "7rem";
    menuHeight = "10%";
    itemsOpacity = 0;
    itemsDelay = 0  
    itemsDuration = 0.05;
    itemsPointerEvents = "pointer-events-none";
  }

  return (
    <div className="flex w-96 pointer-events-none select-none items-start relative z-[200]">
    <motion.div className={UiProps + "m-2 flex flex-col min-h-28 min-w-24 p-4"}
      animate={{width: menuWidth, height: menuHeight}} transition={{type: "just"}}
      layoutId="buildMenuOpenCloseAction"
      initial={false}>

      <div className="">
        <div className={"border-2 rounded-xl border-gray-700 border-solid size-18 p-2 self-start " +
          "bg-slate-700 transition-colors duration-100 cursor-pointer flex items-center" +
          "grow-0 " + (buildMenuEnabled ? "hover:bg-slate-600 active:bg-slate-400 ": " ")}
          onClick={() => {if (buildMenuEnabled) setShowMenu(!showMenu)}}>
            <div className="size-14 grow-0 shrink-0 flex justify-center items-center overflow-hidden">
              <img src={Buildables[selectedBuilding].icon} 
                className="" />
            </div>
            <motion.div 
              animate={{opacity: itemsOpacity, transition: {delay: itemsDelay, type: "tween", duration: itemsDuration}}}
              initial={false}
              className="font-extrabold text-yellow-500 self-center grow text-center text-xl tracking-wide">
                Build Menu</motion.div>
        </div>
      </div>
      
      <motion.div layoutId="buildMenuOpenCloseAction"
        animate={{opacity: itemsOpacity, transition: {delay: itemsDelay, type: "tween", duration: itemsDuration}}}
        initial={false}
        className={itemsPointerEvents + " overflow-y-auto mt-2"}>
        <ul>
          {buildings.map((b) => (
            <li key={b.displayName}>
              <NavSelectionOption 
              onClickHandler={() => {onBuildingSelect(b.keyName); setShowMenu(false);}} 
              img={b.icon} 
              mainText={capitalize(b.displayName)} 
              subText={`$${b.price}`} />
            </li>
          ))}
        </ul>
        <hr className="border-t-2 border-white my-6" />
        <ul>
          {otherOptions.map((b) => (
            <li key={b.displayName}>
              <NavSelectionOption 
              onClickHandler={() => {onBuildingSelect(b.keyName); setShowMenu(false);}} 
              img={b.icon} 
              mainText={capitalize(b.displayName)} 
              subText={`${b.price === 0 ? "Varies" : "$"+b.price}`} />
            </li>
          ))}
        </ul>

      </motion.div>

    </motion.div>
    </div>
  )
}