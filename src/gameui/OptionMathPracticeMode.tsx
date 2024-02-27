import { useState } from "react";
import OptionsButton from "./OptionsButton";
import { C } from "../Constants";

interface OptionMathPracticeModeProps {
  setShowOptionsMenu: (val: boolean) => void;
}

export default function OptionMathPracticeMode({setShowOptionsMenu}: OptionMathPracticeModeProps) {

  const [mathPracticeMode, setMathPracticeMode] = useState(C.showQuestions);

  function toggleMathPracticeMode() {
    setMathPracticeMode(!mathPracticeMode);
    C.showQuestions = !mathPracticeMode;
    setShowOptionsMenu(false);
  }

  return (
    <>
      <p className="mb-2">Math practice mode is 
        <span className="text-yellow-300 font-bold">{mathPracticeMode ? " on" : " off"}</span>
      </p>
      <OptionsButton
        clickHandler={toggleMathPracticeMode}
        buttonText={`Turn ${mathPracticeMode ? "off" : "on"} Math Practice Mode`}
      />
    </>

  )
}