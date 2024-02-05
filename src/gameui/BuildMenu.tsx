import NavSelectionOption from "./NavSelectionOption"
import buildBuildingIcon from '../images/Building-simple_house_256.png';

import { useState } from "react";
import { Buildables } from "../Buildables";
import { motion } from "framer-motion";

export default function BuildMenu() {

  const [showMenu, setShowMenu] = useState(false);

  let menuWidth, menuHeight, itemsOpacity, itemsDelay, itemsDuration, itemsPointerEvents;

  const buildings = [
    Buildables.house,
    Buildables.hotel,
    Buildables.tent,
    Buildables.skyscraper
  ]

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
    <div className="flex w-96 pointer-events-none items-start">
    <motion.div className="m-2 flex flex-col bg-slate-800/50 min-h-28 min-w-24
      text-white p-4 pointer-events-auto rounded-2xl"
      animate={{width: menuWidth, height: menuHeight}} transition={{type: "just"}}
      layoutId="buildMenuOpenCloseAction"
      initial={false}>

      <div className="border-2 rounded-xl border-gray-700 border-solid size-18 p-2 self-start
        bg-slate-700 hover:bg-slate-200 active:bg-white transition-colors duration-100 cursor-pointer
        grow-0"
        onClick={() => setShowMenu(!showMenu)}>
        <img src={buildBuildingIcon} className="size-14" />
      </div>
      
      <motion.div layoutId="buildMenuOpenCloseAction"
        animate={{opacity: itemsOpacity, transition: {delay: itemsDelay, type: "tween", duration: itemsDuration}}}
        initial={false}
        className={itemsPointerEvents}>
        <h1 className='text-2xl mb-2'>Select a building</h1>
        <ul>
          {buildings.map((b) => (
            <li><NavSelectionOption img={b.icon} mainText={b.displayName} subText={`$${b.price}`} /></li>
          ))}
        </ul>
      </motion.div>

    </motion.div>
    </div>
  )
}