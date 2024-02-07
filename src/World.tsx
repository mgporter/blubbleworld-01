import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react"
import { C } from "./Constants";
import CanvasInterface from "./systems/CanvasInterface";

export function World({canvasInterface}: {canvasInterface: CanvasInterface}) {

  useEffect(() => {

    // canvasInterface.setState({camera, scene, raycaster, gl});

    /* These will occur as soon as the canvas loads up */
    canvasInterface.buildWorld(
      C.worldsizeX, 
      C.worldsizeY, 
      C.pondPercent, 
      C.mountainPercent, 
      C.worldGenerationSeed);
      
    canvasInterface.enableFlyControls();
    canvasInterface.setSelector(null);

    return () => {
      canvasInterface.clearWorld();
      canvasInterface.disableFlyControls();
      canvasInterface.disposeAll();
    }
  }, [canvasInterface]);

  useFrame((state, delta) => {
    canvasInterface.updateAnimatables(delta);
  });


  return (
    <>
    </>
  )

}