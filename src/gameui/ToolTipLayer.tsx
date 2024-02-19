import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Object3D, Vector2, Vector3 } from "three";
import { MouseEventEmitter } from "../systems/EventEmitter";
import CanvasInterface from "../systems/CanvasInterface";
import { FinishSelectionObject, Selectable } from "../types";
import { BoardToolTipController } from "./BoardToolTipController";

interface ToopTipBoardItemProps {
  canvasInterface: CanvasInterface;
}

let controller: BoardToolTipController;


export default function ToolTipLayer({canvasInterface}: ToopTipBoardItemProps) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (canvasRef.current == null || containerRef.current == null) return;
    console.log("created")
    controller = new BoardToolTipController(canvasRef.current, containerRef.current, canvasInterface);

    return () => {
      controller.dispose();
    }
  }, [canvasInterface]);


  useEffect(() => {
    const subscribeObj = MouseEventEmitter.subscribe("selectionFinished", (result: FinishSelectionObject) => {
      if (!result.target) return;
      controller.createTooltip(result.target);
    });

    return () => {
      subscribeObj.unsubscribe();
    }
  }, []);


  // const [target, setTarget] = useState<Selectable | null>(null);



  // const draw = useCallback(() => {
  //   if (!ctx || !target) return;

  //   const position = canvasInterface.getMouseCoordinatesOfSelectable(target);
  //   console.log(canvasWidth, canvasHeight)
  //   ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  //   // Set line styles
  //   ctx.strokeStyle = '#000000';
  //   ctx.lineWidth = 3;
  //   ctx.lineCap = 'round';

  //   // Begin the path
  //   ctx.beginPath();
  //   ctx.moveTo(0, 0);

  //   ctx.lineTo(position.x, position.y);

  //   ctx.stroke();
  // }, [canvasInterface, target]);



  // const resizeCanvas = useCallback(() => {
  //   if (!ctx) return;
  //   const {width: canvasWidth, height: canvasHeight} = canvas.getBoundingClientRect();
  //   const ratio = window.devicePixelRatio;

  //   canvas.width = canvasWidth * ratio;
  //   canvas.height = canvasHeight * ratio;
  //   ctx.scale(ratio, ratio);
  //   draw();
  // }, [draw]);



  // useEffect(() => {

  //   window.addEventListener("cameraUpdate", draw);

  //   canvas = canvasRef.current;
  //   ctx = canvas.getContext('2d');
  //   resizeCanvas();
  //   draw();

  //   return () => {
  //     window.removeEventListener("cameraUpdate", draw);
  //   }
  // }, [resizeCanvas, draw])



  // useEffect(() => {
  //   window.addEventListener('resize', resizeCanvas);
  //   return () => {
  //     window.removeEventListener('resize', resizeCanvas);
  //   }
  // }, [resizeCanvas])

















  // useLayoutEffect(() => {
  //   const rect = containerRef.current.getBoundingClientRect();

  //   containerRef.current.style.left = `${position.x - (rect.width / 2)}px`;
  //   containerRef.current.style.top = `${position.y - (rect.height / 2) - 100}px`;
  // }, [position]);



  // useLayoutEffect

  return (
    <div ref={containerRef} className='absolute w-full h-full pointer-events-none'>
    <canvas ref={canvasRef} className='absolute w-full h-full pointer-events-none'>
      {/* <div className='absolute w-24 h-8 bg-black/60 rounded-3xl flex flex-col
      justify-evenly items-center pointer-events-none text-white
      border-2 border-orange-800 shadow-xl'
    >Test</div> */}
    </canvas>
    </div>
  )

}