import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react"
import { MyFlyControls } from "./systems/MyFlyControls";
import { WorldBuilder } from "./systems/WorldBuilder";
import { C, Globals } from "./Constants";
import { MouseEventHandler, RectangleSelector } from "./systems/MouseSelectRect";

let flyControls: MyFlyControls;
let worldBuilder: WorldBuilder;

export function World() {

  const { camera, scene, gl, raycaster } = useThree();

  useEffect(() => {
    Globals.camera = camera;
    Globals.scene = scene;
    Globals.domCanvas = gl.domElement;
    Globals.raycaster = raycaster;
  }, [camera, scene, gl, raycaster]); 

  useEffect(() => {

    worldBuilder = new WorldBuilder();

    flyControls = new MyFlyControls();

    return () => {
      flyControls.dispose();
      worldBuilder.clearWorld();
    }
  }, [camera, scene, gl, raycaster]);

  useFrame((state, delta) => {
    flyControls.update(delta);
  });

  useEffect(() => {

    const rectSelector = new MouseEventHandler(
      worldBuilder.getBoardObjects(), 
      new RectangleSelector(true, 12, 12));

    return () => {
      rectSelector.dispose();
    }

  }, []);

  return (
    <>
    </>
  )

}