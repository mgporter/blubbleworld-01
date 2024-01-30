import { 
  Color, 
  DynamicDrawUsage, 
  ExtrudeGeometry, 
  Intersection, 
  Matrix4, 
  Mesh, 
  MeshStandardMaterial, 
  Object3D, 
  Object3DEventMap, 
  Raycaster, 
  Shape, 
  Sphere} from "three";

import { SelectableInstancedMesh } from "./SelectableInstancedMesh";

class InstancedGridCube extends SelectableInstancedMesh {

  #length;
  #width;
  #defaultColor;
  #selectedColor;
  #hoverColor;
  #transparency;
  #emissive;
  #metalness;

  #_sphere = new Sphere();
  #_instanceLocalMatrix = new Matrix4();
  #_instanceWorldMatrix = new Matrix4();
  #_mesh = new Mesh();
  #_instanceIntersects: Intersection<Object3D<Object3DEventMap>>[] = [];

  constructor(
    length: number, 
    width: number,
    count: number,
    options: {
      color?: number,
      selectedColor?: number,
      hoverColor?: number,
      transparency?: number,
      selectable?: boolean,
      emissive?: number,
      metalness?: number,
    }) {

    const color = new Color(options.color) || new Color(0x828282);
    const transparency = options.transparency || 1;
    const emissive = options.emissive || 0x203008;
    const metalness = options.metalness || 0.6;
    
    // length controls the Y axis (height)
    // width controls the Z axis (depth)
    const shape = new Shape();
    const scaleFactor = 0.9;
    shape.moveTo(0, 0);
    shape.lineTo(0, length * scaleFactor);
    shape.lineTo(width * scaleFactor, length * scaleFactor);
    shape.lineTo(width * scaleFactor, 0);
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
      opacity: 1,
      color: new Color(0xffffff),
      emissive: new Color(emissive),
      roughness: 0,
      metalness: metalness,
      flatShading: true,
      wireframe: false,
      fog: false,
    });

    super(geometry, material, count, options.selectable);
    this.instanceMatrix.setUsage(DynamicDrawUsage);

    this.#length = length;
    this.#width = width;
    this.#defaultColor = color;
    this.#selectedColor = new Color(options.selectedColor) || new Color(0x222222);
    this.#hoverColor = new Color(options.hoverColor) || new Color(0x666666);
    this.#transparency = transparency;
    this.#emissive = emissive;
    this.#metalness = metalness;
    this.#_mesh.geometry = geometry;
    this.#_mesh.material = material;

    this.rotation.order = "ZYX";
    this.rotation.set(0, Math.PI/2, Math.PI/2);
    this.position.set(this.#length/2, -this.#width/2, this.#width/2);

  }

  raycast(raycaster: Raycaster, intersects: Intersection<Object3D<Object3DEventMap>>[]): void {
    const matrixWorld = this.matrixWorld;
		const raycastTimes = this.count;

		// test with bounding sphere first

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

		this.#_sphere.copy(this.boundingSphere!);
		this.#_sphere.applyMatrix4(matrixWorld);

		if (raycaster.ray.intersectsSphere(this.#_sphere) === false) return;

		// now test each instance

		for (let instanceId = 0; instanceId < raycastTimes; instanceId ++) {

			// calculate the world matrix for each instance

			this.getMatrixAt( instanceId, this.#_instanceLocalMatrix );

			this.#_instanceWorldMatrix.multiplyMatrices( matrixWorld, this.#_instanceLocalMatrix );

			// the mesh represents this single instance

			this.#_mesh.matrixWorld = this.#_instanceWorldMatrix;
			this.#_mesh.raycast(raycaster, this.#_instanceIntersects);

			// process the result of raycast

      if (this.#_instanceIntersects.length > 0) {
        const intersect = this.#_instanceIntersects[0];
				intersect.instanceId = instanceId;
				intersect.object = this;
				intersects.push( intersect );
      }

      // Use the loop if you need ALL of the intersecting objects
			// for (let i = 0, l = this.#_instanceIntersects.length; i < l; i ++) {

			// 	const intersect = this.#_instanceIntersects[i];
			// 	intersect.instanceId = instanceId;
      //   intersect.coordinates = new Vector3().setFromMatrixPosition(this.#_instanceLocalMatrix);
			// 	intersect.object = this;
			// 	intersects.push( intersect );

			// }

			this.#_instanceIntersects.length = 0;

		}
  
  }

  changeToSelectedAppearance(index: number) {
    this.setColorAt(index, this.#selectedColor);
    // @ts-expect-error instanceColor will not be null
    this.instanceColor.needsUpdate = true;
  }

  changeToUnselectedAppearance(index: number) {
    this.setColorAt(index, this.#defaultColor);
    // @ts-expect-error instanceColor will not be null
    this.instanceColor.needsUpdate = true;
  }

  changeToHoverAppearance(index: number) {
    this.setColorAt(index, this.#hoverColor);
    // @ts-expect-error instanceColor will not be null
    this.instanceColor.needsUpdate = true;
  }

}

export { InstancedGridCube };