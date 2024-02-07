import { useCallback, useEffect, useState } from 'react';
import BuildMenu from './BuildMenu';
import ToolTipMouseOverCanvas from './ToolTipMouseOverCanvas';
import QuestionDialogBox from './QuestionDialogBox';
import { MouseEventEmitter } from '../systems/EventEmitter';
import { BuildableType, Buildables } from '../Buildables';
import { FinishSelectionObject } from '../types';
import CanvasInterface from '../systems/CanvasInterface';

export default function GameUiContainer({canvasInterface}: {canvasInterface: CanvasInterface}) {

  const [selectedBuilding, setSelectedBuilding] = useState<BuildableType>("");
  const [questionDialogData, setQuestionDialogData] = useState<FinishSelectionObject>(({} as FinishSelectionObject));
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [buildMenuEnabled, setBuildMenuEnabled] = useState(true);

  const onBuildingSelect = useCallback((buildingType: string) => {
    console.log(buildingType)
    setSelectedBuilding(buildingType);
    const selector = Buildables[buildingType].selector;
    // selector.setMaxRectangleSize(4, 4);
    canvasInterface.setSelector(selector);
  }, [canvasInterface]);

  const onBuildingPlace = useCallback((result: FinishSelectionObject) => {
    console.log(result)
    setQuestionDialogData(result);
    setShowQuestionDialog(true);
    setBuildMenuEnabled(false);
    canvasInterface.setSelector(null);
  }, [canvasInterface]);

  const handleCloseQuestionDialog = useCallback(() => {
    setShowQuestionDialog(false);
    const selector = Buildables[selectedBuilding].selector;
    canvasInterface.setSelector(selector);
    setBuildMenuEnabled(true);
  }, [selectedBuilding, setShowQuestionDialog, canvasInterface]);

  useEffect(() => {
    const subscribeObj = MouseEventEmitter.subscribe("selectionFinished", onBuildingPlace);

    return () => {
      subscribeObj.unsubscribe();
    }
  }, [onBuildingPlace]);






  return (
    <div id="gameui-container" className='absolute z-30 w-full h-svh flex pointer-events-none'>
      <BuildMenu 
        onBuildingSelect={onBuildingSelect}
        buildMenuEnabled={buildMenuEnabled} />

      <div className="relative h-full w-full flex flex-col justify-between">

        {showQuestionDialog && <QuestionDialogBox 
          selectedBuilding={selectedBuilding} 
          questionDialogData={questionDialogData}
          handleCloseQuestionDialog={handleCloseQuestionDialog} />}

        <div className='topbar grow-0 h-12 m-2'>

        </div>
        <div className='bottombar grow-0 h-12 m-2 flex items-center justify-center'>
          <ToolTipMouseOverCanvas />
        </div>
      </div>

    </div>
  )
}