import { useCallback, useEffect, useState } from 'react';
import BuildMenu from './BuildMenu';
import ToolTipMouseOverCanvas from './ToolTipMouseOverCanvas';
import QuestionDialogBox from './QuestionDialogBox';
import { MouseEventEmitter } from '../systems/EventEmitter';
import { Buildable, BuildableType, BuildableUserData, Buildables } from '../Buildables';
import { FinishSelectionObject, Selectable } from '../types';
import CanvasInterface from '../systems/CanvasInterface';
import { useStore } from './Store';
import UiArea from './UiArea';
import { UiProps } from './UiProperties';
import TopBar from './TopBar';
import { MouseEventHandler } from '../systems/MouseEventHandlers';


interface GameUiContainerProps {
  canvasInterface: CanvasInterface;
}

export default function GameUiContainer({canvasInterface}: GameUiContainerProps) {

  const spendMoney = useStore((state) => state.spendMoney);
  const money = useStore((state) => state.money);

  const [selectedBuilding, setSelectedBuilding] = useState<BuildableType>("tent");
  const [questionDialogData, setQuestionDialogData] = useState<FinishSelectionObject>(({} as FinishSelectionObject));
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [buildMenuEnabled, setBuildMenuEnabled] = useState(true);
  const [showToolTips, setShowToolTips] = useState(true);

  const onBuildingSelect = useCallback((buildingType: BuildableType) => {
    setSelectedBuilding(buildingType);
    const selector = Buildables[buildingType].selector;
    canvasInterface.setSelector(selector);
  }, [canvasInterface]);

  const onBuildingPlace = useCallback((result: FinishSelectionObject) => {
    setQuestionDialogData(result);
    setShowQuestionDialog(true);
    setBuildMenuEnabled(false);
    setShowToolTips(false);
    canvasInterface.setSelector(null);
  }, [canvasInterface]);

  const handleCloseQuestionDialog = useCallback(() => {
    setShowQuestionDialog(false);
    const selector = Buildables[selectedBuilding].selector;
    canvasInterface.setSelector(selector);
    setBuildMenuEnabled(true);
    setShowToolTips(true);
  }, [selectedBuilding, setShowQuestionDialog, canvasInterface]);

  useEffect(() => {
    const subscribeObj = MouseEventEmitter.subscribe("selectionFinished", onBuildingPlace);

    return () => {
      subscribeObj.unsubscribe();
    }
  }, [onBuildingPlace]);

  // useEffect(() => {
  //   canvasInterface.placeBuilding(Buildables["tent"], 1, 1, 1);
  // }, [canvasInterface]);


  function placeBuildingOnCanvas() {
    handleCloseQuestionDialog();

    const building = Buildables[selectedBuilding];

    if (!(questionDialogData.objects && questionDialogData.target)) return;
    
    switch(selectedBuilding) {

      case "bulldoze": {

        if (purchaseIfSufficientFunds(Buildables[selectedBuilding].price, 1)) {
          canvasInterface.bulldozeMountain(questionDialogData.objects);
        }

        break;
      }

      case "demolish": {

        const price = questionDialogData.target.getBuildables().length > 0 ?
          (questionDialogData.target.getBuildables()[0].userData as BuildableUserData).price : 0;

        if (purchaseIfSufficientFunds(price, 1)) {
          canvasInterface.demolishBuildings(questionDialogData.objects);
        }

        break;
      }

      // For all buildings
      default: {

        const quantityBought = MouseEventHandler.isTwoPhaseSelector(building.selector) ?
          questionDialogData.objects.length : 1;
        
        if (purchaseIfSufficientFunds(Buildables[selectedBuilding].price, quantityBought)) {
          canvasInterface.placeBuilding(
            Buildables[selectedBuilding], 
            questionDialogData.objects, 
            questionDialogData.target);
        }
        
        break;
      }
    }
  }

  function purchaseIfSufficientFunds(price: number, quantity: number) {

    const totalPrice = price * quantity;
    if (totalPrice <= money) {
      spendMoney(totalPrice);
      return true;
    } else return false;

  }








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