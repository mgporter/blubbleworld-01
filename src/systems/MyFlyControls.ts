import {
	EventDispatcher,
	Quaternion,
	Vector3,
  Camera
} from 'three';

import { C, Globals } from '../Constants';

const _changeEvent = { type: 'change' };

let _contextmenu: (e: Event) => void;
let _pointermove: (e: Event) => void;
let _pointerdown: (e: Event) => void;
let _pointerup: (e: Event) => void;
let _pointercancel: () => void;
let _keydown: (e: KeyboardEvent) => void;
let _keyup: (e: KeyboardEvent) => void;

class MyFlyControls extends EventDispatcher {

  enabled;
  movementSpeed;
  rollSpeed;
  dragToLook;
  autoForward;

  zoomInKey = "KeyR";
  zoomOutKey = "KeyF";
  moveUpKey = "KeyW";
  moveDownKey = "KeyS";
  moveLeftKey = "KeyA";
  moveRightKey = "KeyD";

  #camera;
  #enableLimits;
  #moveLimits;
  #domElement;
  #tmpQuaternion;
  #status;
  #moveState;
  #moveVector;
  #rotationVector;
  #movementSpeedMultiplier;
  #lastQuaternion;
  #lastPosition;
  #EPS;

	constructor() {

		super();

    this.#enableLimits = C.enableCameraLimits;
		this.#camera = Globals.camera;
		this.#domElement = Globals.domCanvas;

    // MIN: DOWN, HEIGHTMIN, LEFT
    // MAX: UP, HEIGHTMAX, RIGHT
    this.#moveLimits = {
      MIN: new Vector3(-16, 2, -1),
      MAX: new Vector3(C.worldsizeY - 7, 18, C.worldsizeX + 4)
    }

		this.enabled = true;
		this.movementSpeed = 10;
		this.rollSpeed = 1;
		this.dragToLook = false;
		this.autoForward = false;


		// internals
		this.#EPS = 0.000001;
		this.#lastQuaternion = new Quaternion();
		this.#lastPosition = new Vector3();
		this.#tmpQuaternion = new Quaternion();
		this.#status = 0;

		this.#moveState = {
      up: 0, 
      down: 0, 
      left: 0, 
      right: 0, 
      forward: 0, 
      back: 0, 
      pitchUp: 0, 
      pitchDown: 0, 
      yawLeft: 0, 
      yawRight: 0, 
      rollLeft: 0, 
      rollRight: 0
    };

		this.#moveVector = new Vector3( 0, 0, 0 );
		this.#rotationVector = new Vector3( 0, 0, 0 );
    this.#movementSpeedMultiplier = 1;



		_contextmenu = this.contextMenu.bind( this );
		_pointermove = this.pointermove.bind( this );
		_pointerdown = this.pointerdown.bind( this );
		_pointerup = this.pointerup.bind( this );
		_pointercancel = this.pointercancel.bind( this );
		_keydown = this.keydown.bind( this );
		_keyup = this.keyup.bind( this );

		// this.#domElement.addEventListener('contextmenu', _contextmenu);
		// this.#domElement.addEventListener('pointerdown', _pointerdown);
		// this.#domElement.addEventListener('pointermove', _pointermove);
		// this.#domElement.addEventListener('pointerup', _pointerup);
		// this.#domElement.addEventListener('pointercancel', _pointercancel);

		window.addEventListener('keydown', _keydown);
		window.addEventListener('keyup', _keyup);

		this.updateMovementVector();
		this.updateRotationVector();

	}

  keydown(event: KeyboardEvent) {

    if ( event.altKey || this.enabled === false ) {
      return;
    }

    switch ( event.code ) {

      case 'ShiftLeft':
      case 'ShiftRight': this.#movementSpeedMultiplier = .1; break;

      // Zoom in/out
      case this.zoomInKey: this.#moveState.forward = 1; break;
      case this.zoomOutKey: this.#moveState.back = 1; break;

      case this.moveLeftKey: this.#moveState.left = 1; break;
      case this.moveRightKey: this.#moveState.right = 1; break;

      case this.moveUpKey: this.#moveState.up = 1; break;
      case this.moveDownKey: this.#moveState.down = 1; break;

      // case 'ArrowUp': this.#moveState.pitchUp = 1; break;
      // case 'ArrowDown': this.#moveState.pitchDown = 1; break;

      // case 'ArrowLeft': this.#moveState.yawLeft = 1; break;
      // case 'ArrowRight': this.#moveState.yawRight = 1; break;

      // case 'KeyQ': this.#moveState.rollLeft = 1; break;
      // case 'KeyE': this.#moveState.rollRight = 1; break;

    }

    this.updateMovementVector();
    this.updateRotationVector();

  }

  keyup(event: KeyboardEvent) {

    if ( this.enabled === false ) return;

    switch ( event.code ) {

      case 'ShiftLeft':
      case 'ShiftRight': this.#movementSpeedMultiplier = 1; break;

      case this.zoomInKey: this.#moveState.forward = 0; break;
      case this.zoomOutKey: this.#moveState.back = 0; break;

      case this.moveLeftKey: this.#moveState.left = 0; break;
      case this.moveRightKey: this.#moveState.right = 0; break;

      case this.moveUpKey: this.#moveState.up = 0; break;
      case this.moveDownKey: this.#moveState.down = 0; break;

      // case 'ArrowUp': this.#moveState.pitchUp = 0; break;
      // case 'ArrowDown': this.#moveState.pitchDown = 0; break;

      // case 'ArrowLeft': this.#moveState.yawLeft = 0; break;
      // case 'ArrowRight': this.#moveState.yawRight = 0; break;

      // case 'KeyQ': this.#moveState.rollLeft = 0; break;
      // case 'KeyE': this.#moveState.rollRight = 0; break;

    }

    this.updateMovementVector();
    this.updateRotationVector();

  }

  pointerdown(event: Event) {

    if ( this.enabled === false ) return;

    if ( this.dragToLook ) {

      this.#status ++;

    } else {

      switch ( (event as PointerEvent).button ) {

        case 0: this.#moveState.forward = 1; break;
        case 2: this.#moveState.back = 1; break;

      }

      this.updateMovementVector();

    }

  }

  pointermove(event: Event) {

    if ( this.enabled === false ) return;

    if ( ! this.dragToLook || this.#status > 0 ) {

      const container = this.getContainerDimensions();
      const halfWidth = container.size[ 0 ] / 2;
      const halfHeight = container.size[ 1 ] / 2;

      this.#moveState.yawLeft = - ( ( (event as PointerEvent).pageX - container.offset[ 0 ] ) - halfWidth ) / halfWidth;
      this.#moveState.pitchDown = ( ( (event as PointerEvent).pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

      this.updateRotationVector();

    }

  }

  pointerup(event: Event) {

    if ( this.enabled === false ) return;

    if ( this.dragToLook ) {

      this.#status --;

      this.#moveState.yawLeft = this.#moveState.pitchDown = 0;

    } else {

      switch ( (event as PointerEvent).button ) {

        case 0: this.#moveState.forward = 0; break;
        case 2: this.#moveState.back = 0; break;

      }

      this.updateMovementVector();

    }

    this.updateRotationVector();

  }

  pointercancel() {

    if ( this.enabled === false ) return;

    if ( this.dragToLook ) {

      this.#status = 0;

      this.#moveState.yawLeft = this.#moveState.pitchDown = 0;

    } else {

      this.#moveState.forward = 0;
      this.#moveState.back = 0;

      this.updateMovementVector();

    }

    this.updateRotationVector();

  }

  contextMenu(event: Event) {

    if ( this.enabled === false ) return;

    event.preventDefault();

  }

  update(delta: number) {

    if ( this.enabled === false ) return;

    const moveMult = delta * this.movementSpeed;

    this.#camera.position.z += this.#moveVector.x * moveMult; // move L/R
    this.#camera.position.x += this.#moveVector.y * moveMult; // move Up/Down
    // this.#camera.position.x += this.#moveVector.x * moveMult;

    // this.#camera.translateX( this.#moveVector.x * moveMult );
    // this.#camera.translateY( this.#moveVector.y * moveMult );
    this.#camera.translateZ( this.#moveVector.z * moveMult ); // Zoom In/Out

    if (this.#enableLimits)
      this.#camera.position.clamp(this.#moveLimits.MIN, this.#moveLimits.MAX);


    // !!! Things below this are not needed for our simplified controls

    // const rotMult = delta * this.rollSpeed;

    // this.#tmpQuaternion.set( this.#rotationVector.x * rotMult, this.#rotationVector.y * rotMult, this.#rotationVector.z * rotMult, 1 ).normalize();
    // this.#camera.quaternion.multiply( this.#tmpQuaternion );

    // if (
    //   this.#lastPosition.distanceToSquared( this.#camera.position ) > this.#EPS ||
    //   8 * ( 1 - this.#lastQuaternion.dot( this.#camera.quaternion ) ) > this.#EPS
    // ) {

    //   // @ts-ignore
    //   this.dispatchEvent(_changeEvent);
    //   this.#lastQuaternion.copy( this.#camera.quaternion );
    //   this.#lastPosition.copy( this.#camera.position );

    // }

  }

  updateMovementVector() {

    // X is Left/Right; Z is Zoomin/out
    const forward = ( this.#moveState.forward || ( this.autoForward && ! this.#moveState.back ) ) ? 1 : 0;

    this.#moveVector.x = ( - this.#moveState.left + this.#moveState.right );
    this.#moveVector.y = ( - this.#moveState.down + this.#moveState.up );
    this.#moveVector.z = ( - forward + this.#moveState.back );

    // console.log( 'move:', [ this.#moveVector.x, this.#moveVector.y, this.#moveVector.z ] );

  }

  updateRotationVector() {

    this.#rotationVector.x = ( - this.#moveState.pitchDown + this.#moveState.pitchUp );
    this.#rotationVector.y = ( - this.#moveState.yawRight + this.#moveState.yawLeft );
    this.#rotationVector.z = ( - this.#moveState.rollRight + this.#moveState.rollLeft );

    //console.log( 'rotate:', [ this.#rotationVector.x, this.#rotationVector.y, this.#rotationVector.z ] );

  }

  getContainerDimensions() {

    if (this.#domElement instanceof HTMLElement) {

      return {
        size: [ this.#domElement.offsetWidth, this.#domElement.offsetHeight ],
        offset: [ this.#domElement.offsetLeft, this.#domElement.offsetTop ]
      };

    } else {

      return {
        size: [ window.innerWidth, window.innerHeight ],
        offset: [ 0, 0 ]
      };

    }

  }

  dispose() {

    // this.#domElement.removeEventListener( 'contextmenu', _contextmenu );
    // this.#domElement.removeEventListener( 'pointerdown', _pointerdown );
    // this.#domElement.removeEventListener( 'pointermove', _pointermove );
    // this.#domElement.removeEventListener( 'pointerup', _pointerup );
    // this.#domElement.removeEventListener( 'pointercancel', _pointercancel );

    window.removeEventListener( 'keydown', _keydown );
    window.removeEventListener( 'keyup', _keyup );

  }

}

export { MyFlyControls };