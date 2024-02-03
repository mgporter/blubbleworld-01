import { 
  BufferGeometry,
  Color,
  InstancedMesh, 
  Material, 
  Vector3} from "three";
  
import { InstancedMeshSelectionObject } from "./InstancedMeshSelectionObject";

class SelectableInstancedMesh extends InstancedMesh {

  #selectionObjects: InstancedMeshSelectionObject[];
  defaultColor = new Color(0xffffff);
  selectedColor = new Color(0x999999);
  hoverColor = new Color(0x444444);

  displayName = "SelectableInstanceMesh";

  constructor(
    geometry: BufferGeometry,
    material: Material,
    count: number,
    selectable?: boolean,
    initialColor?: Color,
    createSelectionObjects?: boolean) {

    super(geometry, material, count);
  
    const _createSelectionObjects = createSelectionObjects == undefined ? true : createSelectionObjects;

    if (_createSelectionObjects) {

      // Use "bind" when passing the function references to the constructor,
      // so that the SelectionObjects can access the functions from this
      // class, namely, setColorAt.
      this.#selectionObjects = Array.from({length: count}, (_, i) => {
        return new InstancedMeshSelectionObject(
          selectable == undefined ? true : selectable,
          i,
          this,
          this.changeToSelectedAppearance.bind(this),
          this.changeToDefaultAppearance.bind(this),
          this.changeToHoverAppearance.bind(this),
        )
      });

    }
    else this.#selectionObjects = [];




    // Every cube must have its color set upon creation
    for (let i = 0; i < count; i++) {
      this.setColorAt(i, initialColor || this.defaultColor);
    }

    // @ts-expect-error instanceColor is not null
    this.instanceColor.needsUpdate = true;
    
  }

  getSelectionObjects() {
    return this.#selectionObjects;
  }

  getSelectionObject(index: number) {
    return this.#selectionObjects[index];
  }

  getCoordinates(index: number) {
    return this.#selectionObjects[index].getCoordinates();
  }

  setCoordinates(index: number, coordinates: Vector3) {
    return this.#selectionObjects[index].setCoordinates(coordinates);
  }

  unselectAll() {
    this.#selectionObjects.forEach(x => x.unselect());
  }

  unhoverAll() {
    this.#selectionObjects.forEach(x => x.unhover());
  }

  unselectAndUnhoverAll() {
    this.#selectionObjects.forEach(x => x.unselectAndUnhover());
  }

  // Hooks to implement later

  //eslint-disable-next-line
  changeToDefaultAppearance(index: number) {}
  //eslint-disable-next-line
  changeToHoverAppearance(index: number) {}
  //eslint-disable-next-line
  changeToSelectedAppearance(index: number) {}

}

export { SelectableInstancedMesh };