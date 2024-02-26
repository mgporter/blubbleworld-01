import { useState } from "react";
import OptionsButton from "./OptionsButton";
import { C } from "../Constants";

// interface OptionMathPracticeModeProps {
//   toggleMathPracticeMode: () => void;
// }

export default function OptionMathPracticeMode() {

  const [mathPracticeMode, setMathPracticeMode] = useState(C.showQuestions);

  function toggleMathPracticeMode() {
    setMathPracticeMode(!mathPracticeMode);
    C.showQuestions = !mathPracticeMode
  }

  return (
    <OptionsButton
      clickHandler={toggleMathPracticeMode}
      buttonText={`Turn ${mathPracticeMode ? "off" : "on"} Math Practice Mode`}
    />
  )
}