import { useEffect, useState } from "react";
import TerrainSlider from "./TerrainSlider";
import { C } from "../Constants";

interface OptionAdjustTerrainProps {
  handleAdjustTerrain: (water: number, mountains: number) => void;
}

export default function OptionAdjustTerrain({handleAdjustTerrain}: OptionAdjustTerrainProps) {

  const [waterPercent, setWaterPercent] = useState(C.pondPercent);
  const [mountainPercent, setMountainPercent] = useState(100 - C.mountainPercent);

  // useEffect(() => {
  //   handleAdjustTerrain(waterPercent, mountainPercent);
  // }, [waterPercent, mountainPercent, handleAdjustTerrain])

  return (
    <div>
      <p>Adjust Terrain</p>
      <TerrainSlider 
        waterPercent={waterPercent} 
        setWaterPercent={setWaterPercent}
        mountainPercent={mountainPercent}
        setMountainPercent={setMountainPercent} />
      <button 
        type="button" 
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm"
        onClick={() => handleAdjustTerrain(waterPercent, mountainPercent)}>Change Terrain</button>
    </div>
  )
}