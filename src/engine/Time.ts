import { Plugin, Res, Schedule, World } from "thyseus";

const start = (time: Res<Time>) => {
  time.start()
}
const tick = (time: Res<Time>) => {
  time.tick();
}
const plugin = (startSchedule: typeof Schedule, beforeSchedule: typeof Schedule): Plugin =>
  (world: World) => {
    world.insertResource(new Time());
    world.addSystems(startSchedule, start);
    world.addSystems(beforeSchedule, tick);
  };
export class Time {
  static plugin = plugin;
  dt: number = Number.EPSILON;
  dts: number = Number.EPSILON;
  time: number = 0;
  #lastTime: number;
  constructor() {
    this.#lastTime = performance.now();
  }
  tick() {
    const now = performance.now();
    this.dt = now - this.#lastTime 
    this.time += this.dt;
    this.dts = this.dt / 1000;
    this.#lastTime = now;
  }
  start() {
    this.#lastTime = performance.now();
  }
}
