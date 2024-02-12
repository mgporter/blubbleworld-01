import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react"
import { C } from "./Constants";
import CanvasInterface from "./systems/CanvasInterface";

export function World({canvasInterface}: {canvasInterface: CanvasInterface}) {

  const {camera, scene, gl, raycaster} = useThree();

  useEffect(() => {

    canvasInterface.setState(scene, camera, gl, raycaster);
    canvasInterface.enableFlyControls();

    /* These will occur as soon as the canvas loads up */
    canvasInterface.buildWorld(
      C.worldsizeX, 
      C.worldsizeY, 
      C.pondPercent, 
      C.mountainPercent, 
      C.worldGenerationSeed);
      
    canvasInterface.setSelector(null);

    gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight, true);

    return () => {
      canvasInterface.clearWorld();
      canvasInterface.disableFlyControls();
      canvasInterface.disposeAll();
    }
  }, [canvasInterface, camera, scene, raycaster, gl]);

  useFrame((state, delta) => {
    canvasInterface.updateAnimatables(delta);
  });


  return (
    <>
    </>
  )

}