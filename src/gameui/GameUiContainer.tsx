import { useCallback, useEffect, useRef, useState } from 'react';
import BuildMenu from './BuildMenu';
import ToolTipMouseOverCanvas from './ToolTipMouseOverCanvas';
import QuestionDialogBox from './QuestionDialogBox';
import { MouseEventEmitter } from '../systems/EventEmitter';
import { BuildableType, Buildables } from '../Buildables';
import { FinishSelectionObject, NonNullableFinishSelectionObject } from '../types';
import CanvasInterface from '../systems/CanvasInterface';
import { useStore } from './Store';
import TopBar from './TopBar';
import { C } from '../Constants';
import { calculateTransactionAmount } from '../Utils';
import ToolTipLayer from './ToolTipLayer';
import { Vector3 } from 'three';


interface GameUiContainerProps {
  canvasInterface: CanvasInterface;
}

export default function GameUiContainer({canvasInterface}: GameUiContainerProps) {

  const spendMoney = useStore((state) => state.spendMoney);
  const incrementOnePerson = useStore((state) => state.incrementOnePerson);
  const decrementPeople = useStore((state) => state.decrementPeople);
  const money = useStore((state) => state.money);

  // Ui Elements
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [buildMenuEnabled, setBuildMenuEnabled] = useState(true);
  const [showCoordinateToolTip, setShowCoordinateToolTip] = useState(true);
  const [showBoardToolTip, setShowBoardToolTip] = useState(false);


  const [selectedBuilding, setSelectedBuilding] = useState<BuildableType>("noSelection");
  const [questionDialogData, setQuestionDialogData] = 
    useState<NonNullableFinishSelectionObject>(({} as NonNullableFinishSelectionObject));
 
  const transactionAmount = useRef(0);


  const onBuildingSelect = useCallback((buildingType: BuildableType) => {
    setSelectedBuilding(buildingType);
    const selector = Buildables[buildingType].selector;
    canvasInterface.setSelector(selector);
  }, [canvasInterface]);

  const showQuestionDialogOnSelectionFinished = useCallback(() => {
    setShowQuestionDialog(true);
    setBuildMenuEnabled(false);
    setShowCoordinateToolTip(false);
    canvasInterface.disableMouseHandler();
    canvasInterface.disableFlyControls();
  }, [canvasInterface]);

  const handleCloseQuestionDialog = useCallback(() => {
    setShowQuestionDialog(false);
    canvasInterface.enableMouseHandler();
    canvasInterface.enableFlyControls();
    setBuildMenuEnabled(true);
    setShowCoordinateToolTip(true);
  }, [setShowQuestionDialog, canvasInterface]);




  const placeBuildingOnCanvas = useCallback((result?: NonNullableFinishSelectionObject) => {
    handleCloseQuestionDialog();

    const target = result ? result.target : questionDialogData.target;
    const objects = result ? result.objects : questionDialogData.objects;

    const building = Buildables[selectedBuilding];
    
    switch(selectedBuilding) {

      case "bulldoze": {
        canvasInterface.bulldozeMountain(objects);
        break;
      }

      case "demolish": {

        const buildingData = target.getBuildables()[0].userData;
        const connectorCount = buildingData.connections.length;
        const connectorCapacity = Buildables[buildingData.keyName].connectorCapacity || 0;

        canvasInterface.demolishBuildings(objects);
        decrementPeople(buildingData.capacity + (connectorCount * connectorCapacity));

        break;
      }

      // For all buildings
      default: {

        canvasInterface.placeBuilding(building, objects, target, incrementOnePerson);
        break;
      }
    }

    spendMoney(transactionAmount.current);

  }, [
    canvasInterface, 
    handleCloseQuestionDialog,
    selectedBuilding,
    questionDialogData,
    incrementOnePerson,
    decrementPeople,
    spendMoney,
  ]);


  const handleSelectionFinished = useCallback((result: FinishSelectionObject) => {
    // check for any nulls, and if not, turn the result into 
    // a NonNullableFinishSelectionObject so we don't have to check again elsewhere
    if (!(result.data && result.objects && result.target)) return;

    const nonNullableResult = {
      target: result.target, 
      objects: result.objects, 
      data: result.data
    }

    transactionAmount.current = 
      calculateTransactionAmount(Buildables[selectedBuilding], nonNullableResult);

    
    //temp

    
    if (money >= transactionAmount.current) {

      // Pass the transaction on if there is sufficient funds
      setQuestionDialogData(nonNullableResult);
      if (C.showQuestions) showQuestionDialogOnSelectionFinished();
      else placeBuildingOnCanvas(nonNullableResult);

    } else {

      // Stop the transaction

      setShowBoardToolTip(true);

    }


  }, [placeBuildingOnCanvas, showQuestionDialogOnSelectionFinished, money, selectedBuilding]);


  useEffect(() => {
    const subscribeObj = MouseEventEmitter.subscribe("selectionFinished", handleSelectionFinished);
    return () => {
      subscribeObj.unsubscribe();
    }
  }, [handleSelectionFinished]);








  return (
    <div id="gameui-container" className='absolute z-30 w-full h-svh flex pointer-events-none'>
      <BuildMenu 
        onBuildingSelect={onBuildingSelect}
        buildMenuEnabled={buildMenuEnabled}
        selectedBuilding={selectedBuilding} />

      {showQuestionDialog && <QuestionDialogBox 
        selectedBuilding={selectedBuilding} 
        questionDialogData={questionDialogData}
        handleCloseQuestionDialog={handleCloseQuestionDialog}
        placeBuildingOnCanvas={placeBuildingOnCanvas} />}

      {/* <div className='absolute size-4 bg-red-600'
        style={{left: `${vector.x}px`, top: `${vector.y}px`}}></div> */}

      <ToolTipLayer canvasInterface={canvasInterface} />

      <div className="relative h-full w-full flex flex-col justify-between">

        <TopBar />

        <div className='bottombar grow-0 h-12 m-2 flex items-center justify-center'>
          {showCoordinateToolTip && <ToolTipMouseOverCanvas />}
        </div>
      </div>

    </div>
  )
}