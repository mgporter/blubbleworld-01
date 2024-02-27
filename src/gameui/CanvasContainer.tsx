import { Canvas } from '@react-three/fiber';
import { WebGLRenderer } from 'three';
import { World } from '../World';
import CanvasInterface from '../systems/CanvasInterface';

const createRenderer = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const renderer = new WebGLRenderer({
    canvas: canvas, 
    antialias: true,
    alpha: true,
    powerPreference: "default",
  })
  return renderer;
}


export default function CanvasContainer({canvasInterface}: {canvasInterface: CanvasInterface}) {

  return (
    <div id="canvas-container" className="w-full h-svh z-0 absolute">
      <Canvas 
        scene={canvasInterface.scene}
        // @ts-expect-error camera is assignable
        camera={canvasInterface.camera}
        raycaster={canvasInterface.raycaster}
        gl={createRenderer}
        flat={true}>
        <World canvasInterface={canvasInterface} />
      </Canvas>
    </div>
  )
}