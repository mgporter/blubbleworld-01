import { 
  Color, 
  ExtrudeGeometry, 
  MeshStandardMaterial, 
  Shape, 
  Vector3} from "three";

import { SelectableMesh } from "./SelectableMesh";

class GridCube extends SelectableMesh {

  #length;
  #width;
  #color;
  #transparency;
  #emissive;
  #metalness;
  #cubeId: number = 0;

  constructor(
    length: number, 
    width: number,
    coordinates: Vector3, 
    options: {
      color?: number,
      selectedColor?: number,
      hoverColor?: number,
      transparency?: number,
      selectable?: boolean,
      emissive?: number,
      metalness?: number,
    }) {

    const color = options.color || 0x828282;
    const transparency = options.transparency || 1;
    const emissive = options.emissive || 0x203008;
    const metalness = options.metalness || 0.6;
    
    // length controls the Y axis (height)
    // width controls the Z axis (depth)
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, length);
    shape.lineTo(width, length);
    shape.lineTo(width, 0);
    shape.lineTo(0, 0);

    const extrudeSettings = {
      steps: 1,
      depth: 1,
      bevelEnabled: true,
      bevelThickness: 0.09,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 3
    }

    const geometry = new ExtrudeGeometry(shape, extrudeSettings);

    const material = new MeshStandardMaterial({
      transparent: true,
      opacity: transparency,
      color: new Color(color),
      emissive: new Color(emissive),
      roughness: 0,
      metalness: metalness,
      flatShading: true,
      wireframe: false,
      fog: false,
    });

    super(geometry, material, coordinates, options.selectable);

    this.#length = length;
    this.#width = width;
    this.#color = color;
    this.#transparency = transparency;
    this.#emissive = emissive;
    this.#metalness = metalness;

    this.rotation.order = "ZYX";
    this.rotation.set(0, Math.PI/2, Math.PI/2);
    this.position.set(this.#length/2, -this.#width/2, this.#width/2);
    this.scale.set(0.92, 0.92, 0.92);

    // Must be set higher than the inside or else the inside
    // will disappear when transparency is set.
    // this.#outsideMesh.renderOrder = 1;

    const selectedColor = options.selectedColor || 0x222222;
    const hoverColor = options.hoverColor || 0x666666;

    // Overwrite the mesh's hook with our GroundCube implementation
    this.changeToSelectedAppearance = () => {
      this.material.color.set(selectedColor);
    }

    this.changeToUnselectedAppearance = () => {
      this.material.color.set(this.#color);
    }

    this.changeToHoverAppearance = () => {
      this.material.color.set(hoverColor);
    }

  }

  setId(id: number) {
    this.#cubeId = id;
  }

  getId() {
    return this.#cubeId;
  }

}

export { GridCube };