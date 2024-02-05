import { useState } from 'react';
import BuildMenu from './BuildMenu';
import ToolTipMouseOverCanvas from './ToolTipMouseOverCanvas';
import QuestionDialogBox from './QuestionDialogBox';

export default function GameUiContainer() {

  const [showQuestionDialog, setShowQuestionDialog] = useState(true);

  return (
    <div id="gameui-container" className='absolute z-30 w-full h-svh flex pointer-events-none'>
      <BuildMenu />

      <div className="relative h-full w-full flex flex-col justify-between">

        {showQuestionDialog && <QuestionDialogBox setShowQuestionDialog={setShowQuestionDialog} />}

        <div className='topbar grow-0 h-12 m-2'>

        </div>
        <div className='bottombar grow-0 h-12 m-2 flex items-center justify-center'>
          <ToolTipMouseOverCanvas />
        </div>
      </div>

    </div>
  )
}