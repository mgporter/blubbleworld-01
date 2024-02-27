import { PointerEvent, useState } from "react";
import IconContainer from "./IconContainer";

interface NavSelectionOptionProps {
  img: string,
  mainText: string,
  subText: string,
  onClickHandler: React.MouseEventHandler<HTMLDivElement>,
}

export default function NavSelectionOption({
  img,
  mainText,
  subText,
  onClickHandler
}: NavSelectionOptionProps) {

  // const [mouse, setMouse] = useState({x: 0, y: 0});

  // function onPointerMove(e: PointerEvent) {
  //   setMouse({x: e.clientX, y: e.clientY});
  // }

  // function showBuildingInfo() {

  // }

  return (
    <div onClick={onClickHandler} className="flex border-transparent hover:border-amber-700 border-4 bg-gray-800/30 rounded-xl
      hover:bg-gray-800/50 cursor-pointer my-1">
      <IconContainer img={img} />
      <div className="flex grow-1 w-full flex-col justify-center text-center">
        <p className="text-lg font-bold text-center">{mainText}</p>
        <p className="text-sm">{subText}</p>
      </div>
    </div>
  )

}