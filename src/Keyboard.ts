import { World, Schedule, Res, Plugin } from 'thyseus';

const keyboardPrepare = (keyboard: Res<Keyboard>) => {
  keyboard.start()
}
const keyboardCleanup = (keyboard: Res<Keyboard>) => {
  keyboard.stop();
}
const keyboardPlugin = (prepareSchedule: typeof Schedule, stopSchedule: typeof Schedule, targetHtmlElement: HTMLElement): Plugin =>
  (world: World) => {
    world.insertResource(new Keyboard(targetHtmlElement));
    world.addSystems(prepareSchedule, Keyboard.prepare);
    world.addSystems(stopSchedule, Keyboard.cleanup);
  };
type Code = KeyboardEvent["code"];
export class Keyboard {
  static plugin = keyboardPlugin;
  static prepare = keyboardPrepare;
  static cleanup = keyboardCleanup;
  target: HTMLElement;
  keys: Map<Code, boolean> = new Map();
  constructor(target: HTMLElement) {
    this.target = target;
  }
  start() {
    this.#handle_keydown = (event) => this.handle_keydown(event);
    this.target.addEventListener("keydown", (event) => this.handle_keydown(event));
    this.#handle_keyup = (event) => this.handle_keyup(event);
    this.target.addEventListener("keyup", (event) => this.handle_keyup(event));
  }
  stop() {
    if (this.#handle_keydown) {
      this.target.removeEventListener("keydown", this.#handle_keydown);
    }
    if (this.#handle_keyup) {
      this.target.removeEventListener("keyup", this.#handle_keyup);
    }
  }
  isDown(code: Code): boolean {
    return this.keys.get(code) ?? false;
  }
  #handle_keydown?: (event: KeyboardEvent) => void;
  handle_keydown(event: KeyboardEvent) {
    this.keys.set(event.code, true);
  }
  #handle_keyup?: (event: KeyboardEvent) => void;
  handle_keyup(event: KeyboardEvent) {
    this.keys.set(event.code, false);
  }
}

