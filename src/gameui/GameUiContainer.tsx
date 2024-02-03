import BuildMenu from './BuildMenu';
import NavSelectionOption from './NavSelectionOption';
import ToolTipMouseOverCanvas from './ToolTipMouseOverCanvas';
import UiArea from './UiArea';

export default function GameUiContainer() {

  return (
    <div id="gameui-container" className='absolute z-30 w-full h-svh flex pointer-events-none'>
      <BuildMenu />
      <div className="relative h-full w-full flex flex-col justify-between">
        <div className='topbar grow-0 h-12 m-2'>

        </div>
        <div className='bottombar grow-0 h-12 m-2 flex items-center justify-center'>
          <ToolTipMouseOverCanvas />
        </div>
      </div>

    </div>
  )
}