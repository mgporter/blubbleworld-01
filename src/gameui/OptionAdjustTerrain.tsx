import { useEffect, useState } from "react";
import TerrainSlider from "./TerrainSlider";
import { C } from "../Constants";
import OptionsButton from "./OptionsButton";

interface OptionAdjustTerrainProps {
  handleAdjustTerrain: (water: number, mountains: number) => void;
}

export default function OptionAdjustTerrain({handleAdjustTerrain}: OptionAdjustTerrainProps) {

  const [waterPercent, setWaterPercent] = useState(C.pondPercent);
  const [mountainPercent, setMountainPercent] = useState(100 - C.mountainPercent);


  return (
    <div>
      <p>Adjust Terrain</p>
      <TerrainSlider 
        waterPercent={waterPercent} 
        setWaterPercent={setWaterPercent}
        mountainPercent={mountainPercent}
        setMountainPercent={setMountainPercent} />
      <OptionsButton
        clickHandler={() => handleAdjustTerrain(waterPercent, mountainPercent)}
        buttonText="Change Terrain"
      />
    </div>
  )
}