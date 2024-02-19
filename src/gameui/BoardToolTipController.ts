import { Vector3 } from "three";
import CanvasInterface from "../systems/CanvasInterface";
import { BoardToolTip, Selectable } from "../types";
import { clamp } from "three/src/math/MathUtils.js";


class BoardToolTipController {
  
  #container;
  #canvas;
  #rect;
  #contex;
  #canvasInterface;
  #target: Selectable | null;
  #position;
  #tooltipDiv;

  #_resizeCanvas;
  #_draw;


  constructor(toolTipContainer: HTMLCanvasElement, container: HTMLDivElement, canvasInterface: CanvasInterface) {
    this.#container = container;
    this.#canvas = toolTipContainer;
    this.#contex = this.#canvas.getContext('2d')!;  // Need to handle condition where there is no 2d context
    this.#rect = this.#canvas.getBoundingClientRect();
    this.#canvasInterface =canvasInterface;
    this.#target = null;
    this.#position = new Vector3();
    this.#tooltipDiv = document.createElement('div');

    this.#_resizeCanvas = this.#resizeCanvas.bind(this);
    this.#_draw = this.#draw.bind(this);

    window.addEventListener('resize', this.#_resizeCanvas);
    window.addEventListener('cameraUpdate', this.#_draw);

    this.#resizeCanvas();
  }

  createTooltip(target: Selectable) {
    this.#target = target;

    this.#tooltipDiv.className = "absolute py-1 px-4 h-8 bg-black/60 rounded-3xl flex flex-col " + 
      "justify-evenly items-center text-white " +
      "border-2 border-orange-700 shadow-xl";
    
      this.#tooltipDiv.textContent = "This is a message!"

    this.#container.appendChild(this.#tooltipDiv);


    this.#draw();

  }

  #draw() {
    if (!this.#target) return;

    this.#position = this.#canvasInterface.getMouseCoordinatesOfSelectable(this.#target);

    const tooltipRect = this.#tooltipDiv.getBoundingClientRect();
    const tooltipHalfWidth = tooltipRect.width / 2;
    const tooltipX = clamp(this.#position.x - tooltipHalfWidth, 50, this.#rect.right - 50 - tooltipRect.width);
    const tooltipY = clamp(this.#position.y - 150, 50, this.#rect.bottom - 50 - tooltipRect.height);
    const tooltipAboveTarget = tooltipY < this.#position.y;

    this.#tooltipDiv.style.left = tooltipX + "px";
    this.#tooltipDiv.style.top = tooltipY + "px";


    this.#contex.clearRect(0, 0, this.#rect.width, this.#rect.height);
    console.log("DRAW")
    // Set line styles


    // Begin the path
    this.#contex.beginPath();
    this.#contex.strokeStyle = 'rgb(194, 65, 12)';
    this.#contex.lineWidth = 2;
    this.#contex.lineCap = 'round';
    this.#contex.moveTo(
      tooltipX + tooltipHalfWidth, 
      tooltipAboveTarget ? tooltipY + tooltipRect.height : tooltipY);
    this.#contex.lineTo(this.#position.x, this.#position.y);
    this.#contex.stroke();

    this.#contex.beginPath();
    this.#contex.arc(this.#position.x, this.#position.y, 4, 0, 2 * Math.PI, false);
    this.#contex.fillStyle = 'rgb(194, 65, 12)';
    this.#contex.fill();
    // this.#contex.lineWidth = 1;
    // this.#contex.strokeStyle = 'rgb(120, 35, 6)';
    // this.#contex.stroke();


  }



  #resizeCanvas() {
    this.#rect = this.#canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio;

    this.#canvas.width = this.#rect.width * ratio;
    this.#canvas.height = this.#rect.height * ratio;
    this.#contex.scale(ratio, ratio);

    this.#draw();
  }

  dispose() {
    window.removeEventListener('resize', this.#_resizeCanvas);
    window.removeEventListener('cameraChange', this.#_draw);
  }

}


export { BoardToolTipController };