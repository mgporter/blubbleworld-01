import { useCallback, useEffect, useState } from "react"
import { MouseEventEmitter } from "../systems/EventEmitter"
import { FinishSelectionObject } from "../types";
import { BuildableType, Buildables } from "../Buildables";

interface QuestionDialogBoxProps {
  setShowQuestionDialog: (e: boolean) => void;
}


const cellProperties = "bg-green-800 flex gap-[8%] items-center justify-center row-span-1 col-span-1 "


export default function QuestionDialogBox({setShowQuestionDialog}: QuestionDialogBoxProps) {

  const [gridSize, setGridSize] = useState({row: 1, col: 1, cellFlexDir: " ", objectCount: 1});
  const [cells, setCells] = useState([{row: 0, col: 0}]);

  const currentBuilding: BuildableType = "house";
  const building = Buildables[currentBuilding];
  const cellInternals = 
      <>
        <img className="max-h-24 max-w-[70%] h-2/3" src={building.icon}></img>
        <p className="text-xs lg:text-xl text-white">${building.price}</p>
      </>

  const handleSelectionFinished = useCallback((result: FinishSelectionObject) => {

    if (!result.data || !result.objects) return;
    
    setShowQuestionDialog(true);

    // Set the grid container's size, and also the flex-direction of individual cells
    const flow = result.data.lengthX >= result.data.lengthY ? "flex-col " : "flex-row ";
    setGridSize({
      row: result.data.lengthY, 
      col: result.data.lengthX, 
      cellFlexDir: flow, 
      objectCount: result.objects!.length});
    
    // Get the coordinates of selected cells. Columns mappings are reversed.
    const resultCells = result.objects?.map((selectable) => {
      const col = result.data!.lengthX - (selectable.getCoordinates().x - result.data!.minX);
      const row = selectable.getCoordinates().y - result.data!.minY + 1;
      return {row: row, col: col};
    })

    setCells(resultCells!);

  }, [setShowQuestionDialog]);

  useEffect(() => {
    const subscribeObj = MouseEventEmitter.subscribe("selectionFinished", handleSelectionFinished);

    return () => {
      subscribeObj.unsubscribe();
    }
  }, [handleSelectionFinished]);


  return (
    <div className='absolute w-full h-full flex justify-center items-center'>
      <div className='w-3/4 h-3/4 bg-black/50 rounded-3xl flex flex-col
        justify-center gap-4 items-center pointer-events-auto'>

        {/* This is the grid container */}
        <div className={`grid border-2 border-gray-400 bg-black gap-[2px] w-3/4 h-3/4`}
          style={{
            gridTemplateRows: `repeat(${gridSize.row}, minmax(0, 1fr))`, 
            gridTemplateColumns: `repeat(${gridSize.col}, minmax(0, 1fr))`,
          }}>
              {cells.map((cell, i) => (
                <div key={i} className={cellProperties + gridSize.cellFlexDir}
                    style={{gridRowStart: cell.row, gridColumnStart: cell.col}}>{cellInternals}</div>
              ))}
        </div>

        <div className="flex gap-4 text-white text-xl">
            <p>{gridSize.objectCount} {gridSize.objectCount === 1 ? building.displayName.toLowerCase() : building.plural} × ${building.price} each =</p>
            <input type="number" min="0" max="1000000"></input>
        </div>

      </div>
    </div>
  )

}