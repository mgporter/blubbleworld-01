import UiArea from "./UiArea"
import NavSelectionOption from "./NavSelectionOption"

import buildBuildingIcon from '../images/Building-simple_house_256.png';
import houseIcon from '../images/Building-house_icon_256.png';
import hotelIcon from '../images/Building-hotel_icon_256.png';
import tentIcon from '../images/Building-tent_icon_256.png';
import skyscraperIcon from '../images/Building-skyscraper_icon_256.png';
import IconContainer from "./IconContainer";
import { useState } from "react";

import { motion } from "framer-motion";

export default function BuildMenu() {

  const [showMenu, setShowMenu] = useState(false);

  let menuWidth, menuHeight, itemsOpacity, itemsDelay, itemsDuration;

  if (showMenu) {
    menuWidth = "17rem";
    menuHeight = "96%";
    itemsOpacity = 1;
    itemsDelay = 0.24;
    itemsDuration = 0.2;
  } else {
    menuWidth = "7rem";
    menuHeight = "10%";
    itemsOpacity = 0;
    itemsDelay = 0  
    itemsDuration = 0.05;
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
        initial={false}>
        <h1 className='text-2xl mb-2'>Select a building</h1>
        <ul>
          <li><NavSelectionOption img={houseIcon} mainText="House" subText="$6" /></li>
          <li><NavSelectionOption img={hotelIcon} mainText="Hotel" subText="$40" /></li>
          <li><NavSelectionOption img={tentIcon} mainText="Tent" subText="$12" /></li>
          <li><NavSelectionOption img={skyscraperIcon} mainText="Skyscraper" subText="$100" /></li>
        </ul>
      </motion.div>

    </motion.div>
    </div>
  )
}