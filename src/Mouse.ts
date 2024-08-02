import { World, Schedule, Res, Plugin } from 'thyseus';
import { Vec2 } from '@thyseus/math';

const mousePrepare = (mouse: Res<Mouse>) => {
  mouse.start()
}
const mouseCleanup = (mouse: Res<Mouse>) => {
  mouse.stop();
}
const mousePlugin = (prepareSchedule: typeof Schedule, stopSchedule: typeof Schedule, targetHtmlElement: HTMLElement): Plugin =>
  (world: World) => {
    world.insertResource(new Mouse(targetHtmlElement));
    world.addSystems(prepareSchedule, Mouse.prepare);
    world.addSystems(stopSchedule, Mouse.cleanup);
  };
export class Mouse {
  static plugin = mousePlugin;
  static prepare = mousePrepare;
  static cleanup = mouseCleanup;
  pos: Vec2;
  target: HTMLElement;
  constructor(target: HTMLElement) {
    this.pos = new Vec2(0, 0);
    this.target = target;
  }
  start() {
    this.#handle_mousemove = (event) => this.handle_mousemove(event);
    this.target.addEventListener("mousemove", this.#handle_mousemove);
  }
  stop() {
    if (this.#handle_mousemove) {
      this.target.removeEventListener("mousemove", this.#handle_mousemove);
    }
  }
  #handle_mousemove?: (event: MouseEvent) => void;
  handle_mousemove(event: MouseEvent) {
    this.pos.x = event.clientX;
    this.pos.y = event.clientY;
  }
}

