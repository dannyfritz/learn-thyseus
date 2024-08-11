import { Container, Graphics, WebGLRenderer } from "pixi.js";
import { Plugin, Query, Res, Schedule, World } from "thyseus";
import { Position } from "./Physics";

const renderSystem = (objects: Query<Position>, render: Res<Render>) => {
  render.render();
};

const start = (keyboard: Res<Render>) => {
  keyboard.start();
};
const stop = (keyboard: Res<Render>) => {
  keyboard.stop();
};
const renderPlugin =
  (
    startSchedule: typeof Schedule,
    stopSchedule: typeof Schedule,
    renderSchedule: typeof Schedule,
  ): Plugin =>
  (world: World) => {
    world.insertResource(new Render());
    world.addSystems(startSchedule, start);
    world.addSystems(stopSchedule, stop);
    world.addSystems(renderSchedule, renderSystem);
  };
export class Render {
  static plugin = renderPlugin;
  #renderer: WebGLRenderer;
  #container: Container;
  constructor() {
    this.#renderer = new WebGLRenderer();
  }
  async start() {
    await this.#renderer.init({});
    document.body.appendChild(this.#renderer.canvas)
    this.#container = new Container();
  }
  stop() {
    this.#renderer.destroy();
  }
  circle(x: number, y: number) {
    if (!this.#container) return;
    const g = new Graphics();
    g.circle(x, y, 10);
    g.fill("#fff");
    this.#container.addChild(g);
  }
  render() {
    if (!this.#container) return;
    this.#renderer.render(this.#container);
    this.#container = new Container();
  }
}
