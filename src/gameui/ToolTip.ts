import { clamp } from "three/src/math/MathUtils.js";
import { Selectable, TooltipProps } from "../types";
import { BoardToolTipController } from "./BoardToolTipController";
import { Vector3 } from "three";

interface TooltipElements {
  container: HTMLDivElement;
  canvas: HTMLCanvasElement;
  tooltipDiv: HTMLDivElement;
  pulseDiv: HTMLDivElement | null;
}


class Tooltip {

  #domElements: TooltipElements;
  #canvasRect: DOMRect;
  #tooltipRect: DOMRect;
  #context;

  #target: Selectable;

  #leftLimit = 0;
  #rightLimit = 0;
  #topLimit = 0;
  #bottomLimit = 0;
  #tooltipHalfWidth = 0;

  tooltipAboveTarget = true;
  borderColor;




  constructor(target: Selectable, props: TooltipProps) {

    this.#target = target;

    this.#domElements = {
      container: document.createElement('div'),
      canvas: document.createElement('canvas'),
      tooltipDiv: document.createElement('div'),
      pulseDiv: null,
    }

    const fullscreenProps = "absolute w-full h-full pointer-events-none z-10";

    this.#domElements.container.className = fullscreenProps;
    this.#domElements.canvas.className = fullscreenProps;
    this.#domElements.tooltipDiv.className = 
      "absolute py-1 px-4 h-8 rounded-3xl flex flex-col justify-evenly items-center border-2";

    const textColor = props.textColor || "rgb(255,255,255)";
    const bgColor = props.bgColor || "rgba(84,27,11,0.6)";
    this.borderColor = props.borderColor || "rgb(194,65,12)";
    const pulse = props.pulse != undefined ? props.pulse : "true"; 

    this.#domElements.tooltipDiv.style.color = textColor;
    this.#domElements.tooltipDiv.style.backgroundColor = bgColor;
    this.#domElements.tooltipDiv.style.borderColor = this.borderColor;
    this.#domElements.tooltipDiv.textContent = props.message;

    this.#domElements.container.append(
      this.#domElements.tooltipDiv,
      this.#domElements.canvas,
    );

    this.#canvasRect = this.#domElements.canvas.getBoundingClientRect();
    this.#tooltipRect = this.#domElements.tooltipDiv.getBoundingClientRect();

    this.#context = this.#domElements.canvas.getContext('2d')!;  // NEED TO handle situation where 2d context is not supported

    if (pulse) {
      this.#domElements.pulseDiv = document.createElement('div');
      this.#domElements.pulseDiv.className = 
        "absolute z-[-10] inset-0 opacity-60 border-2 rounded-[3rem] tooltip-ping";

      this.#domElements.pulseDiv.style.backgroundColor = bgColor;
      this.#domElements.pulseDiv.style.borderColor = this.borderColor;

      this.#domElements.tooltipDiv.appendChild(this.#domElements.pulseDiv);
    }

  }

  getDomElement() {
    return this.#domElements.container;
  }

  getTarget() {
    return this.#target;
  }

  updateValues() {

    this.#canvasRect = this.#domElements.canvas.getBoundingClientRect();
    this.#tooltipRect = this.#domElements.tooltipDiv.getBoundingClientRect();

    this.#leftLimit = BoardToolTipController.PADDING;
    this.#topLimit = BoardToolTipController.PADDING;
    this.#rightLimit = this.#canvasRect.width - BoardToolTipController.PADDING - this.#tooltipRect.width;
    this.#bottomLimit = this.#canvasRect.height - BoardToolTipController.PADDING - this.#tooltipRect.height;

    this.#tooltipHalfWidth = this.#tooltipRect.width / 2;

    const ratio = window.devicePixelRatio;

    this.#domElements.canvas.width = this.#canvasRect.width * ratio;
    this.#domElements.canvas.height = this.#canvasRect.height * ratio;
    this.#context.scale(ratio, ratio);
  }

  draw(position: Vector3) {

    const tooltipX = clamp(position.x - this.#tooltipHalfWidth, this.#leftLimit, this.#rightLimit);
    const tooltipY = clamp(position.y - BoardToolTipController.TOOLTIPOFFSETHEIGHT, this.#topLimit, this.#bottomLimit);
    this.tooltipAboveTarget = tooltipY < position.y;

    this.#domElements.tooltipDiv.style.transform = `translate(${tooltipX}px, ${tooltipY}px)`;

    
    this.#context.clearRect(0, 0, this.#canvasRect.width, this.#canvasRect.height);

    // Begin the path
    this.#context.beginPath();
    this.#context.strokeStyle = this.borderColor;
    this.#context.lineWidth = 2;
    this.#context.lineCap = 'round';
    this.#context.moveTo(tooltipX + this.#tooltipHalfWidth, this.tooltipAboveTarget ? tooltipY + this.#tooltipRect.height : tooltipY);
    this.#context.lineTo(position.x, position.y);
    this.#context.stroke();

    this.#context.beginPath();
    this.#context.arc(position.x, position.y, 4, 0, 2 * Math.PI, false);
    this.#context.fillStyle = this.borderColor;
    this.#context.fill();


  }

  remove(callbackAfterExit: () => void) {
    this.#domElements.container.classList.add('fadeout-2s');

    setTimeout(() => {
      this.#domElements.container.remove();
      callbackAfterExit();
    }, 2500);
  }

}

export { Tooltip };