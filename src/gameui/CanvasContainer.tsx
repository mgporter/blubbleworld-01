import { Canvas } from '@react-three/fiber';
import { NoToneMapping, SRGBColorSpace, WebGLRenderer } from 'three';
import { MyScene } from '../objects/MyScene';
import { MyPerspectiveCamera } from '../objects/MyPerspectiveCamera';
import { World } from '../World';

const scene = new MyScene();
const camera = new MyPerspectiveCamera(35, 1, 0.1, 100);

const rendererProps = {
  antialias: true,
  alpha: true,
  powerPreference: "default",
}

export default function CanvasContainer() {

  return (
    <div id="canvas-container" className="w-full h-svh z-0 absolute">
      <Canvas 
        scene={scene}
        camera={camera}
        gl={canvas => {
          const ren = new WebGLRenderer({canvas: canvas, ...rendererProps})
          ren.toneMapping = NoToneMapping;
          ren.outputColorSpace = SRGBColorSpace;
          return ren;
        }}>
        <World />
      </Canvas>
    </div>
  )
}