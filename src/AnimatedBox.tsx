import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { MathUtils, Mesh } from "three";

export default function AnimatedBox() {

  const [clicked, setClicked] = useState(false);

  const meshRef = useRef<Mesh>(null!);

  useFrame((state, delta) => {
    meshRef.current.rotation.x += deg * delta;
    meshRef.current.rotation.y += deg * delta;
    meshRef.current.rotation.z += deg * delta;
  });

  const deg = MathUtils.degToRad(30);


  return (
    <mesh 
      ref={meshRef}
      onClick={() => {setClicked(!clicked)}}  
    >
      <boxGeometry args={[2,2,2]} />
      <meshStandardMaterial color={clicked ? "red" : "royalblue"} />
    </mesh>
  )
}