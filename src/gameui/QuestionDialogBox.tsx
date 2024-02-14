import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"
import { FinishSelectionObject, Selectable } from "../types";
import { BuildableType, BuildableUserData, Buildables } from "../Buildables";
import { motion } from "framer-motion";
import { C } from "../Constants";
import { ConnectingSelector, MouseEventHandler } from "../systems/MouseEventHandlers";
import { useStore } from "./Store";

interface QuestionDialogBoxProps {
  selectedBuilding: BuildableType,
  questionDialogData: FinishSelectionObject,
  handleCloseQuestionDialog: () => void,
  placeBuildingOnCanvas: () => void,
}

const cellProperties = "bg-green-700 flex gap-[8%] items-center justify-center row-span-1 col-span-1 "
const connectorProps = "absolute text-sm border-2 border-black bg-gray-500 p-0.5 z-20 w-8 text-center rounded-md "


export default function QuestionDialogBox({
  selectedBuilding, 
  questionDialogData, 
  handleCloseQuestionDialog,
  placeBuildingOnCanvas}: QuestionDialogBoxProps) {

  const [answer, setAnswer] = useState("");
  const money = useStore((state) => state.money);

  const building = Buildables[selectedBuilding];
  let headlineText: string;
  let cellInternals: JSX.Element;
  let equation: string;
  let correctAnswer: number;
  let buttonText: string;

  if (!(questionDialogData.data && questionDialogData.objects && questionDialogData.target)) return <></>;

  const cellImgProps = `max-h-[70%] max-w-[70%] aspect-[${building.iconAspectRatio}]`;
  const cellTextProps = "text-xs lg:text-xl text-white";
  const quantity = 
    MouseEventHandler.isTwoPhaseSelector(building.selector) ? questionDialogData.objects.length : 1;
  const plural = quantity > 1;
  const currentHeight = questionDialogData.target.getBuildables().length;
  


  // Set the grid container's size, and also the flex-direction of individual cells
  const flow = questionDialogData.data.lengthX >= questionDialogData.data.lengthY ? "flex-col " : "flex-row ";

  const gridSize = {
    row: questionDialogData.data.lengthY, 
    col: questionDialogData.data.lengthX, 
    cellFlexDir: flow};

  // Normalize the coordiantes of cells from their board coordinates to 
  // coordinates on the CSS grid. Note that columns mappings are reversed.
  // If a building is stackable (maxHeight > 1), we need to treat it separately
  let cells: {row: number, col: number, hasRight: boolean, hasBottom: boolean}[];
  if (building.maxHeight === 1) {

    cells = questionDialogData.objects.map((selectable) => {
      return {
        col: questionDialogData.data!.lengthX - (selectable.getCoordinates().x - questionDialogData.data!.minX),
        row: selectable.getCoordinates().y - questionDialogData.data!.minY + 1,
        hasBottom: false,
        hasRight: false,
      }
    });
    
  } else {
    
    // This is currently only for the SkyScraper
    cells = Array.from({length: currentHeight + 1}, (v, i) => {
      return {
        row: i + 1,
        col: 1,
        hasBottom: false,
        hasRight: false,
      }
    })

  }

  // This is for the FixedRectangleSelector ONLY, and not its ConnectingSelector subclass.
  if (!MouseEventHandler.isTwoPhaseSelector(building.selector) &&
  (building.selector as ConnectingSelector).isConnectingSelector != true) {
    gridSize.row = currentHeight + 1;
    gridSize.col = 1;
    gridSize.cellFlexDir = "flex-row ";
  }




  switch(selectedBuilding) {

    case "demolish": {

      gridSize.row = 1;
      gridSize.col = 1;
      cells = [{  // maybe let it be taken care of by skyscraper case
        row: 1,
        col: 1,
        hasBottom: false,
        hasRight: false,
      }];

      const buildingToDemo = questionDialogData.target.getBuildables()[0].userData as BuildableUserData;

      headlineText = `How many ${C.currencyNamePlural} will we have left after demolishing this ${buildingToDemo.displayName}?`;
      if (currentHeight > 1) {
        headlineText = "This action will demolish only one level of this building.\n" + headlineText;
      }

      cellInternals = 
        <>
          <img className={cellImgProps} src={building.icon}></img>
          <p className={cellTextProps}>{buildingToDemo.price}</p>
        </>
      equation = `${money} - ${buildingToDemo.price} =`;
      correctAnswer = money - buildingToDemo.price;
      buttonText = "Knock it down!";
      break;
    }

    case "bulldoze": {
      headlineText = `How many ${C.currencyNamePlural} will we have left after bulldozing?`;
      cellInternals = 
        <>
          <img className={cellImgProps} src={building.icon}></img>
          <p className={cellTextProps}>{building.price}</p>
        </>
      equation = `${money} - ${building.price} =`;
      correctAnswer = money - building.price;
      buttonText = "Flatten it!";
      break;
    }

    case "hotel": {

      let connectorQuantity = 0;
      const hotelCount = questionDialogData.objects.length;
      const hotelPlural = hotelCount > 1;

      // for each cell, find if there is a cell to the right or to the bottom, and add connector
      cells.forEach((cell, _, arr) => {

        if (arr.some(other => cell.col === other.col - 1 && 
            cell.row === other.row)){
              cell.hasRight = true;
              connectorQuantity++;
          }
        
        if (arr.some(other => cell.row === other.row - 1 && 
            cell.col === other.col)) {
              cell.hasBottom = true;
              connectorQuantity++;
          }
        
      });

      headlineText = hotelPlural ? 
        `How many ${C.peopleNamePlural} can our group of ${building.plural} hold now?` :
        `How many ${C.peopleNamePlural} can this ${building.displayName} hold?`;


      cellInternals = 
        <>
          <img className={cellImgProps} src={building.icon} style={{scale: "0.8"}}></img>
          <p className={cellTextProps}>{building.capacity}</p>
        </>

      equation = 
        `(${hotelCount} ${hotelPlural ? building.plural : building.displayName} × ${building.capacity}) + ` + 
        `(${connectorQuantity} connectors × 2) =`;
      correctAnswer = quantity * building.capacity;
      buttonText = "Build it!";
      break;
    }

    default: {
      headlineText = `How many ${C.peopleNamePlural} can our ${plural ? building.plural : building.displayName} hold in all?`;
      cellInternals = 
        <>
          <img className={cellImgProps} src={building.icon}></img>
          <p className={cellTextProps}>{building.capacity}</p>
        </>
      equation = `${quantity} ${plural ? building.plural : building.displayName} × ${building.capacity} each =`;
      correctAnswer = quantity * building.capacity;
      buttonText = "Build it!";
      break;
    }


  }



  function handleAnswerInput(e: ChangeEvent<HTMLInputElement>) {
    let answer = e.target.value;
    if (answer.length > 4) answer = answer.substring(0, 4);
    setAnswer(answer);
  }

  function submitAnswer() {
    if (Number(answer) === correctAnswer) {
      placeBuildingOnCanvas();
    } else {
      placeBuildingOnCanvas();
    }
  }






  // console.log(questionDialogData)
  // console.log(cells)
  // console.log(gridSize)


  return (
    <div className='absolute w-full h-full flex justify-center items-center'
      style={{perspective: "800px"}}>

      {/* This is the container with a background */}
      <motion.div className='relative w-3/4 h-3/4 bg-black/50 rounded-3xl flex flex-col
        justify-center gap-4 items-center pointer-events-auto'
        initial={{rotateX: 90}}
        animate={{rotateX: 0}}
        transition={{duration: 0.6, ease: "anticipate"}}>

        <div className="absolute top-0 right-3 text-red-500 text-5xl font-bold
        cursor-pointer hover:text-red-700 select-none"
        onClick={() => handleCloseQuestionDialog()}>×</div>
        <h1 className="text-xl text-white text-center whitespace-pre-line p-2">{headlineText}</h1>



        {/* This is the grid container */}
        <div className={`relative grid border-2 border-gray-400 bg-black gap-[2px] w-3/4 h-3/4 z-10`}
          style={{
            gridTemplateRows: `repeat(${gridSize.row}, minmax(0, 1fr))`, 
            gridTemplateColumns: `repeat(${gridSize.col}, minmax(0, 1fr))`,
          }}>
              {cells.map((cell, i) => (
                <div key={i} className={cellProperties + gridSize.cellFlexDir}
                    style={{gridRowStart: cell.row, gridColumnStart: cell.col}}>{cellInternals}</div>
              ))}
            
          {/* This is the dummy grid container */}

          <div className={`absolute inset-0 grid gap-[2px] z-20 `}
            style={{
              gridTemplateRows: `repeat(${gridSize.row}, minmax(0, 1fr))`, 
              gridTemplateColumns: `repeat(${gridSize.col}, minmax(0, 1fr))`,
            }}>
                {cells.map((cell, i) => (
                  <div key={i} className={"row-span-1 col-span-1 flex items-center justify-center "}
                      style={{gridRowStart: cell.row, gridColumnStart: cell.col, position: "relative"}}>
                    <>
                      {cell.hasBottom && <div className={"bottom-[-1rem] " + connectorProps + cellTextProps}>2</div>}
                      {cell.hasRight && <div className={"right-[-1rem] " + connectorProps + cellTextProps}>2</div>}
                    </>
                  </div>
                ))}
          </div>

        </div>



        <div className="flex gap-4 text-white text-xl">
            <p>{equation}</p>
            <input className="font-bold w-12 p-0 m-0 bg-transparent focus:outline-none align-middle
            border-white border-b-2 border-opacity-50 hover:border-opacity-100 focus:border-opacity-100"
             type="number" onChange={handleAnswerInput} value={answer}></input>
            <button onClick={submitAnswer} className="btn btn-emerald">{buttonText}</button>
        </div>

      </motion.div>
    </div>
  )

}