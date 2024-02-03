import { useEffect } from "react"
import { MouseEventEmitter } from "../systems/EventEmitter"
import { Selectable } from "../types";

interface QuestionDialogBoxProps {
  setShowQuestionDialog: (e: boolean) => void;
}

let minX = Number.MAX_VALUE, 
  maxX = Number.MIN_VALUE, 
  minY = Number.MAX_VALUE, 
  maxY = Number.MIN_VALUE;


const parseCoordinates = (selectable: Selectable | Selectable[] | null) => {
  if (selectable == null) return;

  (selectable as Selectable[]).forEach((s) => {
    minX = Math.min(s.getCoordinates().x, minX);
    minY = Math.min(s.getCoordinates().y, minY);
    maxX = Math.max(s.getCoordinates().x, maxX);
    maxY = Math.max(s.getCoordinates().y, maxY);
  });

}

const cellProperties = "bg-green-500 border-red-400 border-2 "

export default function QuestionDialogBox({setShowQuestionDialog}: QuestionDialogBoxProps) {

  useEffect(() => {
    MouseEventEmitter.subscribe("selectionFinished", (selectable) => {
      parseCoordinates(selectable);
    });
  }, []);

  return (
    <div className='absolute w-full h-full flex justify-center items-center'>
      <div className='w-3/4 h-3/4 bg-black/50 rounded-3xl pointer-events-auto flex flex-col
        justify-center items-center'>
        <div className="grid grid-rows-4 grid-cols-6 border-2 border-white w-3/4 h-3/4">
          <div className={cellProperties + "row-start-3 row-span-1 col-start-3 col-span-1"}></div>
          {/* <div className={cellProperties}></div> */}
        </div>
      </div>
    </div>
  )

}