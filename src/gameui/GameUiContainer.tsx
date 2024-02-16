import { useCallback, useEffect, useState } from 'react';
import BuildMenu from './BuildMenu';
import ToolTipMouseOverCanvas from './ToolTipMouseOverCanvas';
import QuestionDialogBox from './QuestionDialogBox';
import { MouseEventEmitter } from '../systems/EventEmitter';
import { BuildableType, BuildableUserData, Buildables } from '../Buildables';
import { FinishSelectionObject, NonNullableFinishSelectionObject } from '../types';
import CanvasInterface from '../systems/CanvasInterface';
import { useStore } from './Store';
import TopBar from './TopBar';
import { MouseEventHandler } from '../systems/MouseEventHandlers';
import { C } from '../Constants';


interface GameUiContainerProps {
  canvasInterface: CanvasInterface;
}

export default function GameUiContainer({canvasInterface}: GameUiContainerProps) {

  const spendMoney = useStore((state) => state.spendMoney);
  const money = useStore((state) => state.money);

  const [selectedBuilding, setSelectedBuilding] = useState<BuildableType>("tent");
  const [questionDialogData, setQuestionDialogData] = 
    useState<NonNullableFinishSelectionObject>(({} as NonNullableFinishSelectionObject));
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [buildMenuEnabled, setBuildMenuEnabled] = useState(true);
  const [showToolTips, setShowToolTips] = useState(true);

  const onBuildingSelect = useCallback((buildingType: BuildableType) => {
    setSelectedBuilding(buildingType);
    const selector = Buildables[buildingType].selector;
    canvasInterface.setSelector(selector);
  }, [canvasInterface]);

  const showQuestionDialogOnSelectionFinished = useCallback(() => {
    setShowQuestionDialog(true);
    setBuildMenuEnabled(false);
    setShowToolTips(false);
    canvasInterface.disableMouseHandler();
    canvasInterface.disableFlyControls();
  }, [canvasInterface]);

  const handleCloseQuestionDialog = useCallback(() => {
    setShowQuestionDialog(false);
    canvasInterface.enableMouseHandler();
    canvasInterface.enableFlyControls();
    setBuildMenuEnabled(true);
    setShowToolTips(true);
  }, [setShowQuestionDialog, canvasInterface]);


  const purchaseIfSufficientFunds = useCallback((price: number, quantity: number) => {

    const totalPrice = price * quantity;
    if (totalPrice <= money) {
      spendMoney(totalPrice);
      return true;
    } else return false;

  }, [money, spendMoney]);


  const placeBuildingOnCanvas = useCallback((result?: NonNullableFinishSelectionObject) => {
    handleCloseQuestionDialog();

    const target = result ? result.target : questionDialogData.target;
    const objects = result ? result.objects : questionDialogData.objects;

    const building = Buildables[selectedBuilding];
    
    switch(selectedBuilding) {

      case "bulldoze": {

        if (purchaseIfSufficientFunds(Buildables[selectedBuilding].price, 1)) {
          canvasInterface.bulldozeMountain(objects);
        }

        break;
      }

      case "demolish": {

        const price = target.getBuildables().length > 0 ?
          target.getBuildables()[0].userData.price : 0;

        if (purchaseIfSufficientFunds(price, 1)) {
          canvasInterface.demolishBuildings(objects);
        }

        break;
      }

      // For all buildings
      default: {

        // canvasInterface.moveBlubblesToCell(target, 1);

        const quantityBought = MouseEventHandler.isTwoPhaseSelector(building.selector) ?
          objects.length : 1;
        
        if (purchaseIfSufficientFunds(Buildables[selectedBuilding].price, quantityBought)) {
          canvasInterface.placeBuilding(
            Buildables[selectedBuilding], 
            objects, 
            target);
        }
        
        break;
      }
    }
  }, [
    canvasInterface, 
    handleCloseQuestionDialog, 
    purchaseIfSufficientFunds, 
    selectedBuilding,
    questionDialogData]);


  const handleSelectionFinished = useCallback((result: FinishSelectionObject) => {
    // check for any nulls, and if not, turn the result into 
    // a NonNullableFinishSelectionObject so we don't have to check again elsewhere
    if (!(result.data && result.objects && result.target)) return;
    const nonNullableResult = {target: result.target, objects: result.objects, data: result.data}

    setQuestionDialogData(nonNullableResult);

    if (C.showQuestions) showQuestionDialogOnSelectionFinished();
    else placeBuildingOnCanvas(nonNullableResult);
  }, [placeBuildingOnCanvas, showQuestionDialogOnSelectionFinished]);


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
        buildMenuEnabled={buildMenuEnabled} />

      <div className="relative h-full w-full flex flex-col justify-between">

        {showQuestionDialog && <QuestionDialogBox 
          selectedBuilding={selectedBuilding} 
          questionDialogData={questionDialogData}
          handleCloseQuestionDialog={handleCloseQuestionDialog}
          placeBuildingOnCanvas={placeBuildingOnCanvas} />}

        <TopBar />

        <div className='bottombar grow-0 h-12 m-2 flex items-center justify-center'>
          {showToolTips &&<ToolTipMouseOverCanvas />}
        </div>
      </div>

    </div>
  )
}