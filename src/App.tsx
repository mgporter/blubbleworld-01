import { Canvas } from '@react-three/fiber';
import { Color, NoToneMapping, SRGBColorSpace, WebGLRenderer } from 'three';
import { MyScene } from './objects/MyScene';
import { MyPerspectiveCamera } from './objects/MyPerspectiveCamera';
import { World } from './World';
import { render } from 'react-dom';

const scene = new MyScene();
const camera = new MyPerspectiveCamera(35, 1, 0.1, 100);

const directionalLightColor = new Color(0xfdffbd);

const rendererProps = {
  antialias: true,
  alpha: true,
  powerPreference: "default",
}



export default function App() {

  return (
    <div id="canvas-container" className="w-full h-svh">
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
