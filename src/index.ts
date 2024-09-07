import {
  World,
  Entity,
  Query,
  Res,
  Tag,
  With,
  EventWriter,
  EventReader,
  applyEntityUpdates,
} from "thyseus";
import { Mouse } from "./engine/Mouse";
import { Keyboard } from "./engine/Keyboard";
import { Howl } from "howler";
import { Position, updateVelocitySystem, Velocity } from "./engine/Physics";
import {
  AfterSchedule,
  baseEnginePlugin,
  MainSchedule,
  RenderSchedule,
  StartSchedule,
  StopSchedule,
} from "./engine/baseEngine";
import { Time } from "./engine/Time";
import { Render } from "./engine/Render";

type Event = "NOOP" | "KABOOM";

class GameEvent {
  public event: Event;
  constructor(event: Event) {
    this.event = event;
  }
}

function cleanupEvents(gameEvents: EventWriter<GameEvent>) {
  gameEvents.clear();
}

class IsPlayer extends Tag {}
class IsBall extends Tag {}
class IsRain extends Tag {}

function kaboom(mouse: Res<Mouse>, gameEvents: EventWriter<GameEvent>) {
  if (mouse.isPressed(0)) {
    gameEvents.create(new GameEvent("KABOOM"));
  }
}

function updatePlayerSystem(
  time: Res<Time>,
  keyboard: Res<Keyboard>,
  player: Query<[Position], With<IsPlayer>>,
) {
  const dt = time.dts;
  for (const [pos] of player) {
    if (keyboard.isDown("KeyK")) {
      pos.y -= 80 * dt;
    }
    if (keyboard.isDown("KeyJ")) {
      pos.y += 80 * dt;
    }
    if (keyboard.isDown("KeyH")) {
      pos.x -= 80 * dt;
    }
    if (keyboard.isDown("KeyL")) {
      pos.x += 80 * dt;
    }
  }
}

function renderBallSystem(
  render: Res<Render>,
  rainDrops: Query<[Position], With<IsBall>>,
) {
  for (const [pos] of rainDrops) {
    render.circle(pos.x, pos.y);
  }
}

function renderCursorSystem(render: Res<Render>, mouse: Res<Mouse>) {
  render.circle(mouse.pos.x, mouse.pos.y);
}

function renderPlayerSystem(
  render: Res<Render>,
  player: Query<[Position], With<IsPlayer>>,
) {
  for (const [position] of player) {
    render.circle(position.x, position.y);
  }
}

function renderRainSystem(
  render: Res<Render>,
  drops: Query<[Position], With<IsRain>>,
) {
  for (const [pos] of drops) {
    if (!pos) continue;
    render.circle(pos.x, pos.y);
  }
}

function updateRainSystem(
  world: World,
  time: Res<Time>,
  drops: Query<[Entity, Position], With<IsRain>>,
) {
  if (drops.length < 10) {
    world.spawn().addType(IsRain).add(new Position(Math.random() * 200, 0));
  }
  for (const [entity, pos] of drops) {
    if (!pos) continue;
    pos.y += 80 * time.dts;
    if (pos.y > 100) {
      entity.despawn();
    }
  }
}

const createSound = (url: URL) => new Howl({ src: [url.href] }).load();

const SOUNDS = {
  hit: createSound(new URL("../hit.wav", import.meta.url)),
} as const satisfies Record<string, Howl>;

function renderAudio(gameEvents: EventReader<GameEvent>) {
  for (const gameEvent of gameEvents) {
    if (gameEvent.event === "KABOOM") {
      SOUNDS.hit.play();
    }
  }
}

const world = await new World()
  .addPlugin(baseEnginePlugin)
  .addPlugin(Render.plugin(StartSchedule, StopSchedule, RenderSchedule))
  .addSystems(MainSchedule, applyEntityUpdates)
  .addSystems(MainSchedule, kaboom)
  .addSystems(MainSchedule, renderPlayerSystem)
  .addSystems(MainSchedule, renderBallSystem)
  .addSystems(MainSchedule, renderRainSystem)
  .addSystems(MainSchedule, renderCursorSystem)
  .addSystems(MainSchedule, renderAudio)
  .addSystems(MainSchedule, updateRainSystem)
  .addSystems(MainSchedule, updateVelocitySystem)
  .addSystems(MainSchedule, updatePlayerSystem)
  .addSystems(AfterSchedule, cleanupEvents)
  .prepare();

function createBall(world: World): Entity {
  const entity = world.spawn();
  entity.addType(IsBall);
  entity.add(new Velocity(20, 10));
  entity.add(new Position(0, 0));
  return entity;
}

function createPlayer(world: World): Entity {
  const entity = world.spawn();
  entity.addType(IsPlayer);
  entity.add(new Position(0, 0));
  return entity;
}

createBall(world);
createPlayer(world);

world.start();
