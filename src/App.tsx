import CanvasContainer from './gameui/CanvasContainer';
import GameUiContainer from './gameui/GameUiContainer';
import CanvasInterface from './systems/CanvasInterface';




export default function App() {

  const canvasInterface = new CanvasInterface();

  return (
    <>
      <GameUiContainer 
        canvasInterface={canvasInterface} />
      <CanvasContainer canvasInterface={canvasInterface} />
    </>
  )
}
