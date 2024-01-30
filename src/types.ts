import { LineBasicMaterial, 
  LineDashedMaterial, 
  Mesh, 
  MeshBasicMaterial, 
  MeshLambertMaterial, 
  MeshMatcapMaterial, 
  MeshPhongMaterial, 
  MeshPhysicalMaterial, 
  MeshStandardMaterial, 
  MeshToonMaterial, 
  Object3D, 
  PointsMaterial, 
  ShadowMaterial, 
  SpriteMaterial } from "three";

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

// export interface Selectable {
//   isSelectable: () => boolean;
//   setSelectable: (val: boolean) => void;
//   isSelected: () => boolean;
//   select: () => void;
//   unselect: () => void;
//   toggleSelect: () => void;
// }

// export interface SelectableInstance {
//   isSelectable: (idx: number) => boolean;
//   setSelectable: (idx: number, val: boolean) => void;
//   isSelected: (idx: number) => boolean;
//   select: (idx: number) => void;
//   unselect: (idx: number) => void;
//   toggleSelect: (idx: number) => void;
// }

export interface Selector {
  enable: () => void;
  dispose: () => void;
}