import { Perlin } from "../noise/Perlin";
import { C } from "../Constants";

interface PerlinInterface {
  seed: (x: number) => void;
  simplex2: (x: number, y: number) => number;
  simplex3: (x: number, y: number, z: number) => number;
  perlin2: (x: number, y: number) => number;
  perlin3: (x: number, y: number, z: number) => number;
}

class NoiseMaker {

  #noise: PerlinInterface;
  #seed = Math.random();
  #min = 1;
  #max = -1;
  #length;
  #width;
  #noiseGrid2d: number[][] | null = null;

  constructor(length: number, width: number) {
    this.#length = length;
    this.#width = width;

    // @ts-expect-error importing JS module
    this.#noise = new Perlin();
  }

  setSeed(val: number) {
    this.#seed = val;
  }

  /** Given n parameters of numbers, groups the numbers in the Perlin Group into
   * n groups and returns an array of the greatest number in each group. 
   */
  getBreakPoints(...values: number[]) {

    if (this.#noiseGrid2d == null) {
      console.error("Generate grid first before calling getBreakpoints");
      this.generatePerlinGrid();
    }

    const sortedArray = this.#noiseGrid2d!.flat(1).sort((a, b) => a - b);
    const outputArray: number[] = [];

    let cumulativeValue = 0;
    for (const val of values) {
      if ((cumulativeValue = cumulativeValue + val) < sortedArray.length)
        // outputArray.push(sortedArray[cumulativeValue] + 0.00000000000001);
        outputArray.push(sortedArray[cumulativeValue]);
    }
    
    return outputArray;

  }

  generatePerlinGrid() {

    this.#noise.seed(this.#seed);

    const outer: number[][] = [];
    for (let i = 0; i < this.#length; i++) {
      const inner = [];
      for (let j = 0; j < this.#width; j++) {

        // Add a small random value here, because sometimes Perlin
        // spits out the same value consecutively, which interferes
        // with our algorithm
        const value = this.#noise.perlin2(i/10, j/10) + (Math.random() / C.worldGenerationNoise);
        this.#min = Math.min(value, this.#min);
        this.#max = Math.max(value, this.#max);
        inner.push(value);
      }
      outer.push(inner);
    }

    this.#noiseGrid2d = outer;
    return outer;
  }

  // passing 0 gives you the min, passing 100 gives you the max;
  getNumberAtPercentile(val: number) {
    const perc = val / 100;
    return ((this.#max - this.#min) * perc) + this.#min;
  }

  getMin() {
    return this.#min;
  }

  getMax() {
    return this.#max;
  }

}

export { NoiseMaker };