import { ChangeEvent, useState } from "react"
import { FinishSelectionObject } from "../types";
import { BuildableType, Buildables } from "../Buildables";

interface QuestionDialogBoxProps {
  selectedBuilding: BuildableType,
  questionDialogData: FinishSelectionObject,
  handleCloseQuestionDialog: () => void,
}

const cellProperties = "bg-green-700 flex gap-[8%] items-center justify-center row-span-1 col-span-1 "


export default function QuestionDialogBox({selectedBuilding, questionDialogData, handleCloseQuestionDialog}: QuestionDialogBoxProps) {

  const [answer, setAnswer] = useState<string>("");


  function handleAnswer(e: ChangeEvent<HTMLInputElement>) {
    let answer = e.target.value;
    if (answer.length > 4) answer = answer.substring(0, 4);
    setAnswer(answer);
  }

  const currentBuilding = selectedBuilding;
  const building = Buildables[currentBuilding];
  const cellInternals = 
      <>
        <img className={`max-h-[70%] max-w-[70%] aspect-[${building.iconAspectRatio}]`} src={building.icon}></img>
        <p className="text-xs lg:text-xl text-white">${building.price}</p>
      </>

  if (!questionDialogData.data || !questionDialogData.objects) return <></>;

  // Set the grid container's size, and also the flex-direction of individual cells
  const flow = questionDialogData.data.lengthX >= questionDialogData.data.lengthY ? "flex-col " : "flex-row ";
  const gridSize = {
    row: questionDialogData.data.lengthY, 
    col: questionDialogData.data.lengthX, 
    cellFlexDir: flow, 
    objectCount: questionDialogData.objects!.length};

  // Get the coordinates of selected cells. Columns mappings are reversed.
  const cells = questionDialogData.objects?.map((selectable) => {
    const col = questionDialogData.data!.lengthX - (selectable.getCoordinates().x - questionDialogData.data!.minX);
    const row = selectable.getCoordinates().y - questionDialogData.data!.minY + 1;
    return {row: row, col: col};
  })


  return (
    <div className='absolute w-full h-full flex justify-center items-center'>
      <div className='relative w-3/4 h-3/4 bg-black/50 rounded-3xl flex flex-col
        justify-center gap-4 items-center pointer-events-auto'>
        <div className="absolute top-0 right-3 text-red-500 text-5xl font-bold
        cursor-pointer hover:text-red-700 select-none"
        onClick={() => handleCloseQuestionDialog()}>×</div>
        <h1 className="text-xl text-white">How much are we going to spend for this?</h1>

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
            <input className="font-bold w-12 p-0 m-0 bg-transparent focus:outline-none align-middle
            border-white border-b-2 border-opacity-50 hover:border-opacity-100 focus:border-opacity-100"
             type="number" onChange={handleAnswer} value={answer}></input>
            <button className="btn btn-emerald">🗸 Buy it!</button>
        </div>

      </div>
    </div>
  )

}