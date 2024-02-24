import { DragEvent, MutableRefObject, PointerEvent, useEffect, useRef, useState } from "react";
import { clamp } from "../Utils";
import { C } from "../Constants";

interface TerrainSliderProps {
  waterPercent: number;
  setWaterPercent: (val: number) => void;
  mountainPercent: number;
  setMountainPercent: (val: number) => void;
}

type SliderType = "water" | "mountain";

const SLIDERPADDING = 6;

export default function TerrainSlider({
  waterPercent, 
  setWaterPercent, 
  mountainPercent, 
  setMountainPercent}: TerrainSliderProps) {

  const sliderbarRef = useRef<HTMLDivElement>(null!);
  const waterSliderRef = useRef<HTMLDivElement>(null!);
  const mountainSliderRef = useRef<HTMLDivElement>(null!);
  const sliderBounds = useRef({left: 0, right: 0, span: 0});

  const selected = useRef({
    setter: setWaterPercent,
    slider: waterSliderRef.current,
    max: 0,
    min: 0,
  });
  
  // const selectedSliderRef = useRef<HTMLDivElement>(waterSliderRef.current);
  // const selectedPropertySetter = useRef(setWaterPercent);


  useEffect(() => {
    setSliderBoundsFunc();

    // The 208 here is the expected width considering the width of the options menu minus padding
    const initialWaterSliderPosition = (C.pondPercent * 208) / 100;
    waterSliderRef.current.style.transform = `translate(${initialWaterSliderPosition}px, 0px)`;

    const initialMountainSliderPosition = ((100 - C.mountainPercent) * 190) / 100;
    mountainSliderRef.current.style.transform = `translate(${initialMountainSliderPosition}px, 0px)`;
    console.log(initialMountainSliderPosition)
  }, []);

  function setSliderBoundsFunc() {
    const {left, right} = sliderbarRef.current.getBoundingClientRect();
    sliderBounds.current = {
      left: left + SLIDERPADDING, 
      right: right - SLIDERPADDING, 
      span: (right - SLIDERPADDING) - (left + SLIDERPADDING)};
  }

  function handlerSliderDrag(e: MouseEvent) {

    const left = clamp(
      e.clientX, 
      sliderBounds.current.left, 
      sliderBounds.current.right);
    
    const leftOffset = left - (sliderBounds.current.left - SLIDERPADDING);
    const percent = Math.round((leftOffset - SLIDERPADDING) * 100 / sliderBounds.current.span);

    if (percent > selected.current.max || percent < selected.current.min) return;

    selected.current.setter(percent);
    selected.current.slider.style.transform = `translate(${leftOffset}px, 0px)`;
  }

  function onPointerDown(type: "water" | "mountain") {
    setSliderBoundsFunc();
    document.body.style.cursor = "pointer";

    switch(type) {
      case "water": {
        selected.current = {
          setter: setWaterPercent,
          slider: waterSliderRef.current,
          max: mountainPercent - 1,
          min: 0,
        }
        break; 
      }

      case "mountain": {
        selected.current = {
          setter: setMountainPercent,
          slider: mountainSliderRef.current,
          max: 100,
          min: waterPercent + 1,
        }
        break;
      }
    }

    window.addEventListener("pointermove", handlerSliderDrag);
    window.addEventListener("pointerup", handleDragEnd, {once: true})
  }

  function handleDragEnd(e: MouseEvent) {
    document.body.style.cursor = "";
    window.removeEventListener("pointermove", handlerSliderDrag);
  }

  // bg-gradient-to-r from-blue-500 via-green-500 to-stone-600
  return (
    <div className="h-4 mt-6 mb-2 flex flex-col justify-center">
      <div ref={sliderbarRef} className="sliderbar relative w-full h-[8px] border-r-gray-600 border-b-gray-600 
        border-t-gray-500 border-l-gray-500 border-2 "
         style={{background: `linear-gradient(90deg, rgb(59,140,246) ${waterPercent}%, rgb(34, 197, 94) ${waterPercent+1}%, rgb(34, 197, 94) ${mountainPercent-1}%, rgb(167, 129, 89) ${mountainPercent}%)`}}>

        <div 
          onPointerDown={() => onPointerDown("water")} ref={waterSliderRef} 
          className="slider box-content w-[8px] h-[20px] 
            absolute top-[-17px] left-[-14px] p-2 cursor-pointer">

          <div className="knob rounded-lg border-[1px] w-full h-full
              border-gray-700 bg-slate-400 active:bg-slate-200">
          </div>

          <div className="label relative w-8 text-center bottom-[42px] left-[-12px]">
            {waterPercent}
          </div>

        </div>


        <div onPointerDown={() => onPointerDown("mountain")} ref={mountainSliderRef} 
          className="slider box-content w-[8px] h-[20px] 
          absolute top-[-17px] left-[-14px] p-2 cursor-pointer">

          <div className="knob rounded-lg border-[1px] w-full h-full
              border-gray-700 bg-slate-400 active:bg-slate-200">
          </div>

          <div className="label relative w-8 text-center bottom-[42px] left-[-12px]">
            {mountainPercent}
          </div>

        </div>     

        

      </div>
    </div>
  )
}