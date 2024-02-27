import keyboardMap from '../images/keyboard_map.png';

interface StartupDialogProps {
  setShowStartupDialog: (val: boolean) => void;
}

const emphasisStyle = "text-yellow-300 font-bold ";

export default function StartupDialog({setShowStartupDialog}: StartupDialogProps) {

  return (
    <div onClick={() => setShowStartupDialog(false)} 
      className="absolute h-full w-full backdrop-blur-sm z-[999] 
      flex justify-center items-center pointer-events-auto">
      <div className='relative w-3/4 max-h-[90%] bg-black/70 rounded-3xl flex flex-col
         justify-start gap-4 items-center pointer-events-auto border-2 border-orange-800
         text-gray-100 p-4 text-md overflow-auto'>
          
          <div className=' text-center'>
            <h1 className="text-2xl">Welcome to the Blubble's World Demo!</h1>
            <h2 className="text-lg underline hover:text-gray-400"><a href="https://github.com/mgporter" target="_blank">Created by mgporter</a></h2>
          </div>

          <p>Blubble's World is currently in development. 
            It is meant as a future tool to help build math skills in elementary-aged 
            children by asking them mathematical questions about the world they 
            are building and changing. Right now, this app is just a demo to 
            show what that world could look like.</p>
          
          <div className='flex gap-8 items-center'>
            <div className='flex flex-col items-center'>
              <span className={emphasisStyle + "mb-2"}>Movement:</span>
              <img className="invert-[0.9] bg-white/70 p-2 rounded-xl mb-2 w-72" src={keyboardMap}></img>
            </div>
            <div className='flex flex-col items-start gap-3'>
              <div>
                <span className={emphasisStyle}>Math Practice Mode:</span>
                <p>Enable math practice mode in the options menu. This mode asks questions after placement of a building.</p>
              </div>
              <div>
                <span className={emphasisStyle}>World Generation:</span>
                <p>You can also change and regenerate the world as you like. Note that all buildings and markers will be lost when changing the world in this way.</p>
              </div>
            </div>
          </div>

          <div className='text-4xl text-white/40 select-none'>Click anywhere to close</div>
      </div>
    </div>
  )
}