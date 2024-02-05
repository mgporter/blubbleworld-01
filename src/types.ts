import { LineBasicMaterial, 
  LineDashedMaterial, 
  MeshBasicMaterial, 
  MeshLambertMaterial, 
  MeshMatcapMaterial, 
  MeshPhongMaterial, 
  MeshPhysicalMaterial, 
  MeshStandardMaterial, 
  MeshToonMaterial, 
  PointsMaterial, 
  ShadowMaterial, 
  SpriteMaterial } from "three";
import { SelectableMesh } from "./objects/SelectableMesh";
import { InstancedMeshSelectionObject } from "./objects/InstancedMeshSelectionObject";

export type ColoredMaterial = 
  MeshLambertMaterial | 
  MeshPhongMaterial | 
  MeshStandardMaterial |
  LineBasicMaterial |
  LineDashedMaterial |
  MeshBasicMaterial |
  MeshMatcapMaterial |
  MeshPhysicalMaterial |
  MeshToonMaterial |
  PointsMaterial |
  ShadowMaterial |
  SpriteMaterial;

export type Selectable = SelectableMesh | InstancedMeshSelectionObject;

type FinishSelectionData = {
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  lengthX: number,
  lengthY: number,
  totalArea: number,
  validCount: number,
}

export type FinishSelectionObject = {
  objects: Selectable[] | null,
  target: Selectable | null,
  data?: FinishSelectionData,
}

export interface Selector {
  handleMouseOverTarget: (target: Selectable) => void;
  handleMouseLeaveTarget: (target: Selectable) => void;
  handleSelectionFinished: (target: Selectable) => FinishSelectionObject;
  isSelectionValid: boolean
}

export interface SinglePhaseSelector extends Selector {

}

export interface TwoPhaseSelector extends Selector {
  handleFirstClick: (target: Selectable) => void;
  handleSelectionMode: (origin: Selectable, target: Selectable) => void;
}

type noiseLevel = Record<"OFF" | "LIGHT" | "MEDIUM" | "HEAVY" | "VERYHEAVY", number>;

export const noiseLevel: noiseLevel = {
  OFF: 1000,
  LIGHT: 50,
  MEDIUM: 8,
  HEAVY: 4,
  VERYHEAVY: 1,
}