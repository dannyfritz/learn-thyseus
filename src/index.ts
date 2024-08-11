import {
  World,
  Entity,
  Query,
  Res,
  Tag,
  With,
  EventWriter,
  EventReader,
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

const kaboomSound = new URL(`../hit.wav`, import.meta.url).href;
const sound = new Howl({
  src: [kaboomSound],
});
sound.load();

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
  for (const [position] of player) {
    if (keyboard.isDown("KeyK")) {
      position.y -= 80 * dt;
    }
    if (keyboard.isDown("KeyJ")) {
      position.y += 80 * dt;
    }
    if (keyboard.isDown("KeyH")) {
      position.x -= 80 * dt;
    }
    if (keyboard.isDown("KeyL")) {
      position.x += 80 * dt;
    }
  }
}

function renderBallSystem(render: Res<Render>, query: Query<[Position], With<IsBall>>) {
  for (const [pos] of query) {
    render.circle(pos.x, pos.y);
  }
}

function renderCursorSystem(render: Res<Render>, mouse: Res<Mouse>) {
    render.circle(mouse.pos.x, mouse.pos.y);
}

function renderPlayerSystem(render: Res<Render>, player: Query<[Position], With<IsPlayer>>) {
  for (const [position] of player) {
    render.circle(position.x, position.y);
  }
}

function renderAudio(gameEvents: EventReader<GameEvent>) {
  for (const gameEvent of gameEvents) {
    if (gameEvent.event === "KABOOM") {
      sound.play();
    }
  }
}

const world = await new World()
  .addPlugin(baseEnginePlugin)
  .addPlugin(Render.plugin(StartSchedule, StopSchedule, RenderSchedule))
  .addSystems(MainSchedule, kaboom)
  .addSystems(MainSchedule, renderPlayerSystem)
  .addSystems(MainSchedule, renderBallSystem)
  .addSystems(MainSchedule, renderCursorSystem)
  .addSystems(MainSchedule, renderAudio)
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
