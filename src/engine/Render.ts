import { Plugin, Res, Schedule, World } from "thyseus";

const start = (keyboard: Res<Render>) => {
  keyboard.start()
}
const stop = (keyboard: Res<Render>) => {
  keyboard.stop();
}
const renderPlugin = (startSchedule: typeof Schedule, stopSchedule: typeof Schedule, targetHtmlElement: HTMLElement): Plugin =>
  (world: World) => {
    world.insertResource(new Render(targetHtmlElement));
    world.addSystems(startSchedule, start);
    world.addSystems(stopSchedule, stop);
  };
export class Render {
  static plugin = renderPlugin;
  #target: HTMLElement;
  constructor(target: HTMLElement) {
    this.#target = target;
  }
  start() {
  }
  stop() {
  }
}
