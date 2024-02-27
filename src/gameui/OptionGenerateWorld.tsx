import { ChangeEvent, useRef, useState } from "react";
import OptionsButton from "./OptionsButton";
import { C } from "../Constants";

const inputProps = "w-9 rounded-sm ml-1 text-black pl-[4px] pr-[4px] invalid:bg-red-300 text-center";

interface OptionGenerateWorldProps {
  handleGenerateNewWorld: (l: number, w: number) => void;
}

export default function OptionGenerateWorld({handleGenerateNewWorld}: OptionGenerateWorldProps) {

  const [length, setLength] = useState(C.worldsizeX);
  const [width, setWidth] = useState(C.worldsizeY);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const setterRef = useRef(setLength);

  const minValue = 1;
  const maxValue = 100;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    let inputStr = e.target.value;
    if (inputStr.length > 3) inputStr = inputStr.substring(0, 3);
    
    const input = Number(inputStr);
    if (input > maxValue || input < minValue) {
      setEnableSubmit(false);
    } else {
      setEnableSubmit(true);
    }

    setterRef.current(input);

  }

  function setModifier(e: ChangeEvent) {
    switch(e.target.id) {
      case "length": setterRef.current = setLength; break;
      case "width": setterRef.current = setWidth; break;
    }
  }



  return (
    <div>
      <p>Generate New World</p>
      <div className="flex gap-3 my-3">
        <label htmlFor="length">Length: 
          <input onFocus={setModifier} onChange={handleChange} value={length}
            id="length" name="length" type="number" className={inputProps}
            min={minValue} max={maxValue} />
        </label>

        <label htmlFor="width">Width:
          <input onFocus={setModifier} onChange={handleChange} value={width} 
            id="width" name="width" type="number" className={inputProps}
            min={minValue} max={maxValue} />
        </label>
      </div>
      <OptionsButton
        clickHandler={() => {handleGenerateNewWorld(length, width);}}
        buttonText="Generate"
        enabled={enableSubmit}
      />

    </div>
  )
}