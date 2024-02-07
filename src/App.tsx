import CanvasContainer from './gameui/CanvasContainer';
import GameUiContainer from './gameui/GameUiContainer';
import CanvasInterface from './systems/CanvasInterface';

const canvasInterface = new CanvasInterface();

export default function App() {

  return (
    <>
      <GameUiContainer canvasInterface={canvasInterface} />
      <CanvasContainer canvasInterface={canvasInterface} />
    </>
  )
}
