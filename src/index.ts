import { World, Entity, Query, Res, Tag, With, EventWriter, EventReader } from 'thyseus';
import { Mouse } from "./engine/Mouse";
import { Keyboard } from "./engine/Keyboard";
import { Howl } from "howler";
import { Position, updateVelocitySystem, Velocity } from './engine/Physics';
import { AfterSchedule, baseEnginePlugin, MainSchedule } from './engine/baseEngine';
import { Time } from './engine/Time';

const kaboomSound = new URL(`../hit.wav`, import.meta.url).href;
const sound = new Howl({
  src: [kaboomSound]
});
sound.load();

type Event =
	| "NOOP"
	| "KABOOM";

class GameEvent {
	public event: Event;
	constructor(event: Event) {
		this.event = event;
	};
}

function cleanupEvents(gameEvents: EventWriter<GameEvent>) {
	gameEvents.clear();
}
 
class IsPlayer extends Tag { };
class IsBall extends Tag { };

function kaboom(mouse: Res<Mouse>, gameEvents: EventWriter<GameEvent>) {
	if (mouse.isPressed(0)) {
		gameEvents.create(new GameEvent("KABOOM"));
	}
}

function updatePlayerSystem(time: Res<Time>, keyboard: Res<Keyboard>, player: Query<[Position], With<IsPlayer>>) {
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

const ballElement = document.querySelector("#ball")! as HTMLDivElement;
const cursorElement = document.querySelector("#cursor")! as HTMLDivElement;
const playerElement = document.querySelector("#player")! as HTMLDivElement;

function renderBallSystem(query: Query<[Position], With<IsBall>>) {
	for (const [pos] of query) {
		ballElement.style.left = `${pos.x}px`;
		ballElement.style.top = `${pos.y}px`;
	}
}

function renderCursorSystem(mouse: Res<Mouse>) {
	cursorElement.style.left = `${mouse.pos.x}px`;
	cursorElement.style.top = `${mouse.pos.y}px`;
}

function renderPlayerSystem(player: Query<[Position], With<IsPlayer>>) {
	for (const [position] of player) {
		playerElement.style.left = `${position.x}px`;
		playerElement.style.top = `${position.y}px`;
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
	entity.addType(IsBall)
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
