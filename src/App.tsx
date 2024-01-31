import CanvasContainer from './gameui/CanvasContainer';
import UiArea from './gameui/UiArea';



export default function App() {

  return (
    <>
      <div id="gameui-container" className='absolute z-30 w-full h-svh flex gap-8 pointer-events-none items-start'>
        <UiArea alignSelf="self-stretch">
          <h1 className='text-4xl'>Select a building</h1>
            <ul>
              <li>House</li>
              <li>Hotel</li>
            </ul>
        </UiArea>
        <UiArea>
          <div>Blubbles Remaining: 28</div>
        </UiArea>

      </div>
      <CanvasContainer />
    </>
  )
}
