import { World, Schedule, Res, Plugin } from 'thyseus';
import { Vec2 } from '@thyseus/math';

const start = (keyboard: Res<Keyboard>) => {
  keyboard.start()
}
const stop = (keyboard: Res<Keyboard>) => {
  keyboard.stop();
}
const plugin = (startSchedule: typeof Schedule, stopSchedule: typeof Schedule, targetHtmlElement: HTMLElement): Plugin =>
  (world: World) => {
    world.insertResource(new Keyboard(targetHtmlElement));
    world.addSystems(startSchedule, Keyboard.start);
    world.addSystems(stopSchedule, Keyboard.stop);
  };
type Code = KeyboardEvent["code"];
export class Keyboard {
  static plugin = plugin;
  static start = start;
  static stop = stop;
  #target: HTMLElement;
  #keys: Map<Code, number> = new Map();
  constructor(target: HTMLElement) {
    this.#target = target;
  }
  start() {
    this.#keys.clear();
    this.#handle_keydown = (event) => this.#_handle_keydown(event);
    this.#target.addEventListener("keydown", (event) => this.#_handle_keydown(event));
    this.#handle_keyup = (event) => this.#_handle_keyup(event);
    this.#target.addEventListener("keyup", (event) => this.#_handle_keyup(event));
  }
  stop() {
    if (this.#handle_keydown) {
      this.#target.removeEventListener("keydown", this.#handle_keydown);
    }
    if (this.#handle_keyup) {
      this.#target.removeEventListener("keyup", this.#handle_keyup);
    }
  }
  isPressed(code: Code): boolean {
    if (this.#keys.get(code) === 1) {
      this.#keys.set(code, 2);
      return true;
    }
    return false;
  }
  isDown(code: Code): boolean {
    return (this.#keys.get(code) ?? 0) > 0;
  }
  #handle_keydown?: (event: KeyboardEvent) => void;
  #_handle_keydown(event: KeyboardEvent) {
    this.#keys.set(event.code, 1);
  }
  #handle_keyup?: (event: KeyboardEvent) => void;
  #_handle_keyup(event: KeyboardEvent) {
    this.#keys.set(event.code, 0);
  }
}

