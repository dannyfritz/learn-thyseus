import { World, Schedule, Res, Plugin } from 'thyseus';
import { Vec2 } from '@thyseus/math';

const start = (mouse: Res<Mouse>) => {
  mouse.start()
}
const stop = (mouse: Res<Mouse>) => {
  mouse.stop();
}
const plugin = (startSchedule: typeof Schedule, stopSchedule: typeof Schedule, targetHtmlElement: HTMLElement): Plugin =>
  (world: World) => {
    world.insertResource(new Mouse(targetHtmlElement));
    world.addSystems(startSchedule, Mouse.start);
    world.addSystems(stopSchedule, Mouse.stop);
  };
export class Mouse {
  static plugin = plugin;
  static start = start;
  static stop = stop;
  #buttons: Map<MouseEvent["button"], number> = new Map();
  pos: Vec2;
  target: HTMLElement;
  constructor(target: HTMLElement) {
    this.pos = new Vec2(0, 0);
    this.target = target;
  }
  start() {
    this.#buttons.clear();
    this.#handle_mousemove = (event) => this.#_handle_mousemove(event);
    this.target.addEventListener("mousemove", this.#handle_mousemove);
    this.#handle_mousedown = (event) => this.#_handle_mousedown(event);
    this.target.addEventListener("mousedown", this.#handle_mousedown);
    this.#handle_mouseup = (event) => this.#_handle_mouseup(event);
    this.target.addEventListener("mouseup", this.#handle_mouseup);
  }
  stop() {
    if (this.#handle_mousemove) {
      this.target.removeEventListener("mousemove", this.#handle_mousemove);
    }
    if (this.#handle_mousedown) {
      this.target.removeEventListener("mousedown", this.#handle_mousedown);
    }
    if (this.#handle_mouseup) {
      this.target.removeEventListener("mouseup", this.#handle_mouseup);
    }
  }
  isPressed(button: MouseEvent["button"]): boolean {
    if (this.#buttons.get(button) === 1) {
      this.#buttons.set(button, 2);
      return true;
    }
    return false;
  }
  isDown(button: MouseEvent["button"]): boolean {
    return (this.#buttons.get(button) ?? 0) > 0;
  }
  #handle_mousedown?: (event: MouseEvent) => void;
  #_handle_mousedown(event: MouseEvent) {
    this.#buttons.set(event.button, 1);
  }
  #handle_mouseup?: (event: MouseEvent) => void;
  #_handle_mouseup(event: MouseEvent) {
    this.#buttons.set(event.button, 0);
  }
  #handle_mousemove?: (event: MouseEvent) => void;
  #_handle_mousemove(event: MouseEvent) {
    this.pos.x = event.clientX;
    this.pos.y = event.clientY;
  }
}

