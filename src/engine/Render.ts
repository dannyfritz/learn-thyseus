import { Plugin, Res, Schedule, World } from "thyseus";

const renderPrepare = (keyboard: Res<Render>) => {
  keyboard.start()
}
const renderCleanup = (keyboard: Res<Render>) => {
  keyboard.stop();
}
const renderPlugin = (prepareSchedule: typeof Schedule, stopSchedule: typeof Schedule, targetHtmlElement: HTMLElement): Plugin =>
  (world: World) => {
    world.insertResource(new Render(targetHtmlElement));
    world.addSystems(prepareSchedule, Render.prepare);
    world.addSystems(stopSchedule, Render.cleanup);
  };
export class Render {
  static plugin = renderPlugin;
  static prepare = renderPrepare;
  static cleanup = renderCleanup;
  #target: HTMLElement;
  constructor(target: HTMLElement) {
    this.#target = target;
  }
  start() {
  }
  stop() {
  }
}
