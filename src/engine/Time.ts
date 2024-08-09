import { Plugin, Res, Schedule, World } from "thyseus";
import { BeforeSchedule } from "./baseEngine";

const start = (time: Res<Time>) => {
  time.start()
}
const tick = (time: Res<Time>) => {
  time.tick();
}
const plugin = (startSchedule: typeof Schedule): Plugin =>
  (world: World) => {
    world.insertResource(new Time());
    world.addSystems(startSchedule, Time.start);
    world.addSystems(BeforeSchedule, tick);
  };
export class Time {
  static plugin = plugin;
  static start = start;
  static stop = stop;
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
    this.dts = this.dt / 1000;
    this.#lastTime = now;
  }
  start() {
    this.#lastTime = performance.now();
  }
}
