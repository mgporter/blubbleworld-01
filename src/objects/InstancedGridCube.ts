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
  #depth;
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
    depth: number,
    count: number,
    options: {
      color?: Color,
      selectedColor?: Color,
      hoverColor?: Color,
      rejectedColor?: Color,
      transparency?: number,
      selectable?: boolean,
      emissive?: number,
      metalness?: number,
    },
    createSelectionObjects?: boolean) {

    const color = options.color || new Color(0xFFFFFF);
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
      depth: depth,
      bevelEnabled: true,
      bevelThickness: 0.09,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 3
    }

    const geometry = new ExtrudeGeometry(shape, extrudeSettings);

    const material = new MeshStandardMaterial({
      transparent: transparency != 1,
      opacity: transparency,
      color: new Color(0xFFFFFF),  // later calls to setColorAt will multiply with this, so it must be white.
      emissive: new Color(emissive),
      roughness: 0,
      metalness: metalness,
      flatShading: true,
      wireframe: false,
      fog: false,
    });

    super(geometry, material, count, options.selectable, color, createSelectionObjects);
    this.instanceMatrix.setUsage(DynamicDrawUsage);
    this.name = "InstancedGridCube";
    this.displayName = "InstancedGridCube";

    this.#length = length;
    this.#width = width;
    this.#depth = depth;
    this.defaultColor = color;
    this.selectedColor = options.selectedColor || new Color(color).multiply(new Color(0x444444));  
    this.hoverColor = options.hoverColor || new Color(color).multiply(new Color(0x999999));
    this.rejectedColor = options.rejectedColor || new Color(color).multiply(new Color(0xff0000));
    this.#transparency = transparency;
    this.#emissive = emissive;
    this.#metalness = metalness;
    this.#_mesh.geometry = geometry;
    this.#_mesh.material = material;

    this.rotation.order = "ZYX";
    this.rotation.set(0, Math.PI/2, Math.PI/2);
    this.position.set(this.#length/2, -this.#width/2, this.#width/2);

  }

  // Override
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

      // For our custom method, we add the SelectionObject to the intersect,
      // instead of the instanceMesh itself. The SelectionObject holds the 
      // information about which instances are actually selected.
      if (this.#_instanceIntersects.length > 0) {
        const intersect = this.#_instanceIntersects[0];
				// intersect.instanceId = instanceId;

        // @ts-expect-error push to object class
				intersect.object = this.getSelectionObject(instanceId);
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
    this.setColorAt(index, this.selectedColor);
    // this.setColorAt(index, new Color(0x000000));
    // @ts-expect-error instanceColor will not be null
    this.instanceColor.needsUpdate = true;
  }

  changeToDefaultAppearance(index: number) {
    this.setColorAt(index, this.defaultColor);
    // @ts-expect-error instanceColor will not be null
    this.instanceColor.needsUpdate = true;
  }

  changeToHoverAppearance(index: number) {
    this.setColorAt(index, this.hoverColor);
    // @ts-expect-error instanceColor will not be null
    this.instanceColor.needsUpdate = true;
  }

  changeToRejectedAppearance(index: number) {
    this.setColorAt(index, this.rejectedColor);
    // @ts-expect-error instanceColor will not be null
    this.instanceColor.needsUpdate = true;
  }

}

export { InstancedGridCube };