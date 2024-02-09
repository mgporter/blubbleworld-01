import { useCallback, useEffect, useState } from 'react';
import BuildMenu from './BuildMenu';
import ToolTipMouseOverCanvas from './ToolTipMouseOverCanvas';
import QuestionDialogBox from './QuestionDialogBox';
import { MouseEventEmitter } from '../systems/EventEmitter';
import { Buildable, BuildableType, Buildables } from '../Buildables';
import { FinishSelectionObject, Selectable } from '../types';
import CanvasInterface from '../systems/CanvasInterface';
import { Vector2, Vector3 } from 'three';
import CTr from '../systems/CoordinateTranslator';
import { MouseEventHandler } from '../systems/MouseEventHandlers';


interface GameUiContainerProps {
  canvasInterface: CanvasInterface;
}

export default function GameUiContainer({canvasInterface}: GameUiContainerProps) {

  const [selectedBuilding, setSelectedBuilding] = useState<BuildableType>("");
  const [questionDialogData, setQuestionDialogData] = useState<FinishSelectionObject>(({} as FinishSelectionObject));
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [buildMenuEnabled, setBuildMenuEnabled] = useState(true);
  const [showToolTips, setShowToolTips] = useState(true);
  const [mouseCoordinates, setMouseCoordinates] = useState(new Vector2());

  const onBuildingSelect = useCallback((buildingType: string) => {
    setSelectedBuilding(buildingType);
    const selector = Buildables[buildingType].selector;
    canvasInterface.setSelector(selector);
  }, [canvasInterface]);

  const onBuildingPlace = useCallback((result: FinishSelectionObject) => {
    setMouseCoordinates(new Vector2(result.target?.getCoordinates().x, result.target?.getCoordinates().y));
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
    if (questionDialogData.objects == null) return;
    canvasInterface.placeBuilding(Buildables[selectedBuilding], questionDialogData);
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

        <div className='topbar grow-0 h-12 m-2'>

        </div>
        <div className='bottombar grow-0 h-12 m-2 flex items-center justify-center'>
          {showToolTips &&<ToolTipMouseOverCanvas />}
        </div>
      </div>

    </div>
  )
}