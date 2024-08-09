import { Plugin, Res, Schedule, World } from "thyseus";

const start = (time: Res<Time>) => {
  time.start()
}
const stop = (keyboard: Res<Time>) => {
  keyboard.stop();
}
const plugin = (startSchedule: typeof Schedule, stopSchedule: typeof Schedule): Plugin =>
  (world: World) => {
    world.insertResource(new Time());
    world.addSystems(startSchedule, Time.start);
    world.addSystems(stopSchedule, Time.stop);
  };
export class Time {
  static plugin = plugin;
  static start = start;
  static stop = stop;
  constructor() {
  }
  start() {
  }
  stop() {
  }
}
