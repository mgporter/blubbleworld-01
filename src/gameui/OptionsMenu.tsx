import { motion } from "framer-motion";
import { useState } from "react";
import OptionAdjustTerrain from "./OptionAdjustTerrain";
import CanvasInterface from "../systems/CanvasInterface";
import OptionGenerateWorld from "./OptionGenerateWorld";
import OptionMathPracticeMode from "./OptionMathPracticeMode";
import { C } from "../Constants";
import OptionsButton from "./OptionsButton";

interface OptionsMenuProps {
  canvasInterface: CanvasInterface;
  setShowStartupDialog: (val: boolean) => void;
}

const optionsItemsStyles = "bg-gray-600 rounded-lg text-center p-2 "
const gearIconPath = "M 405 572.035156 C 312.746094 572.035156 237.964844 497.253906 237.964844 405 C 237.964844 312.746094 312.746094 237.964844 405 237.964844 C 497.253906 237.964844 572.035156 312.746094 572.035156 405 C 572.035156 497.253906 497.253906 572.035156 405 572.035156 Z M 788.128906 326.90625 L 713.347656 318.050781 C 706.59375 294.023438 697.007812 270.636719 684.546875 248.417969 L 731.140625 189.308594 C 738.917969 179.445312 738.078125 165.324219 729.199219 156.449219 L 653.550781 80.800781 C 644.675781 71.921875 630.554688 71.082031 620.691406 78.859375 L 561.582031 125.453125 C 539.363281 112.992188 515.96875 103.40625 491.949219 96.652344 L 483.101562 21.863281 C 481.621094 9.390625 471.050781 0 458.488281 0 L 351.503906 0 C 338.949219 0 328.378906 9.390625 326.90625 21.863281 L 318.050781 96.652344 C 294.023438 103.40625 270.636719 112.992188 248.417969 125.453125 L 189.300781 78.859375 C 179.445312 71.082031 165.320312 71.921875 156.441406 80.800781 L 80.800781 156.449219 C 71.921875 165.324219 71.082031 179.445312 78.859375 189.308594 L 125.453125 248.417969 C 112.992188 270.636719 103.398438 294.023438 96.652344 318.050781 L 21.863281 326.90625 C 9.390625 328.378906 0 338.949219 0 351.503906 L 0 458.488281 C 0 471.050781 9.390625 481.621094 21.863281 483.101562 L 96.652344 491.949219 C 103.398438 515.96875 112.992188 539.363281 125.453125 561.582031 L 78.859375 620.691406 C 71.082031 630.554688 71.921875 644.675781 80.800781 653.550781 L 156.441406 729.199219 C 165.320312 738.078125 179.445312 738.917969 189.300781 731.140625 L 248.417969 684.546875 C 270.636719 697.007812 294.023438 706.59375 318.050781 713.347656 L 326.90625 788.128906 C 328.378906 800.609375 338.949219 810 351.503906 810 L 456.71875 810 C 469.050781 810 479.511719 800.925781 481.246094 788.703125 L 491.949219 713.347656 C 515.96875 706.59375 539.363281 697.007812 561.582031 684.546875 L 620.691406 731.140625 C 630.554688 738.917969 644.675781 738.078125 653.550781 729.199219 L 729.199219 653.550781 C 738.078125 644.675781 738.917969 630.554688 731.140625 620.691406 L 684.546875 561.582031 C 697.007812 539.363281 706.59375 515.96875 713.347656 491.949219 L 788.128906 483.101562 C 800.609375 481.621094 810 471.050781 810 458.488281 L 810 351.503906 C 810 338.949219 800.609375 328.378906 788.128906 326.90625 "

export default function OptionsMenu({canvasInterface, setShowStartupDialog}: OptionsMenuProps) {

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  function handleAdjustTerrain(pondPercent: number, mountainPercent: number) {
    canvasInterface.rebuildExistingWorld(pondPercent, 100 - mountainPercent);
  }

  function handleGenerateNewWorld(length: number, width: number) {
    canvasInterface.createWorld(
      length,
      width,
      C.pondPercent,
      C.mountainPercent,
      Math.random(),
    );
    setShowOptionsMenu(false);
  }

  function handleStartupDialogOption() {
    setShowOptionsMenu(false);
    setShowStartupDialog(true);
  }


  let menuWidth, menuHeight, itemsOpacity, itemsDelay, itemsDuration, itemsPointerEvents, borderRadius;

  if (showOptionsMenu) {
    menuWidth = "14rem";
    menuHeight = "28rem";
    itemsOpacity = 1;
    itemsDelay = 0.24;
    itemsDuration = 0.2;
    itemsPointerEvents = "pointer-events-auto ";
    borderRadius = "0.5rem";
  } else {
    menuWidth = "3rem";
    menuHeight = "3rem";
    itemsOpacity = 0;
    itemsDelay = 0  
    itemsDuration = 0.05;
    itemsPointerEvents = "pointer-events-none ";
    borderRadius = "1.5rem";
  }

  return (
    <div className="flex flex-col items-end w-60 relative">

      <motion.div 
        animate={{width: menuWidth, height: menuHeight, borderRadius: borderRadius}} transition={{type: "just"}}
        layoutId="optionsMenuOpenCloseAction"
        initial={false}
        className="bg-slate-800/50 pointer-events-auto justify-start absolute top-0 right-0
          select-none flex flex-col items-end ">

        <div className="mt-2 mr-2" onClick={() => setShowOptionsMenu(!showOptionsMenu)}>
          <svg className={"group cursor-pointer transition-all duration-150 " + (showOptionsMenu ? "rotate-[-45deg] " : "rotate-0 ")}
            xmlns="http://www.w3.org/2000/svg" width="32" viewBox="0 0 810 810" height="32" preserveAspectRatio="xMidYMid meet" version="1.0">
            <path className={"fill-amber-200 group-hover:fill-amber-400 group-active:fill-amber-600 "}
              d={gearIconPath} fillOpacity="1" />
          </svg>
        </div>

        <motion.div
          animate={{opacity: itemsOpacity, transition: {delay: itemsDelay, type: "tween", duration: itemsDuration}}}
          layoutId="optionsMenuOpenCloseAction"
          className={itemsPointerEvents + "w-full h-full flex flex-col p-2"}>
          <ul className="flex flex-col gap-2 mt-2">
            <li className={optionsItemsStyles}><OptionsButton clickHandler={handleStartupDialogOption} buttonText="Show startup dialog"/></li>
            <li className={optionsItemsStyles}><OptionMathPracticeMode setShowOptionsMenu={setShowOptionsMenu} /></li>
            <li className={optionsItemsStyles}><OptionAdjustTerrain handleAdjustTerrain={handleAdjustTerrain} /></li>
            <li className={optionsItemsStyles}><OptionGenerateWorld handleGenerateNewWorld={handleGenerateNewWorld} /></li>
          </ul>
        </motion.div>

      </motion.div>

    </div>
  )
}