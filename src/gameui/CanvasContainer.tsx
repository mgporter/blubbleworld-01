import { Canvas } from '@react-three/fiber';
import { Raycaster, WebGLRenderer } from 'three';
import { MyScene } from '../objects/MyScene';
import { MyPerspectiveCamera } from '../objects/MyPerspectiveCamera';
import { World } from '../World';
import CanvasInterface from '../systems/CanvasInterface';

// const scene = new MyScene();
// const camera = new MyPerspectiveCamera(35, 1, 0.1, 100);
const raycaster = new Raycaster();
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
        // onCreated={(state) => {canvasInterface.setState(state);}}
        scene={canvasInterface.scene}
        camera={canvasInterface.camera}
        raycaster={canvasInterface.raycaster}
        gl={createRenderer}
        flat={true}>
        <World canvasInterface={canvasInterface} />
      </Canvas>
    </div>
  )
}