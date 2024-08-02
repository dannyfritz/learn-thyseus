import { World, Schedule, Entity, Query, Res, Tag, With } from 'thyseus';
import { Vec2 } from '@thyseus/math';
import { Mouse } from "./Mouse";
import { Keyboard } from "./Keyboard";

class Position extends Vec2 { };
class Velocity extends Vec2 { };
class IsPlayer extends Tag { };
class IsBall extends Tag { };

function moveSystem(query: Query<[Position, Velocity]>) {
	for (const [pos, vel] of query) {
		pos.x += vel.x;
		pos.y += vel.y;
	}
}

const ballElement = document.querySelector("#ball")! as HTMLDivElement;

function renderBallSystem(query: Query<[Position], With<IsBall>>) {
	for (const [pos] of query) {
		ballElement.style.left = `${pos.x}px`;
		ballElement.style.top = `${pos.y}px`;
	}
}

const cursorElement = document.querySelector("#cursor")! as HTMLDivElement;

function renderCursorSystem(mouse: Res<Mouse>) {
	cursorElement.style.left = `${mouse.pos.x}px`;
	cursorElement.style.top = `${mouse.pos.y}px`;
}

function updatePlayerSystem(keyboard: Res<Keyboard>, player: Query<[Position], With<IsPlayer>>) {
	for (const [position] of player) {
		if (keyboard.isDown("KeyK")) {
			position.y -= 1;
		}
		if (keyboard.isDown("KeyJ")) {
			position.y += 1;
		}
		if (keyboard.isDown("KeyH")) {
			position.x -= 1;
		}
		if (keyboard.isDown("KeyL")) {
			position.x += 1;
		}
	}
}

const playerElement = document.querySelector("#player")! as HTMLDivElement;

function renderPlayerSystem(player: Query<[Position], With<IsPlayer>>) {
	for (const [position] of player) {
		playerElement.style.left = `${position.x}px`;
		playerElement.style.top = `${position.y}px`;
	}
}

class PrepareSchedule extends Schedule { }
class StopSchedule extends Schedule { }

let stopped = false;
function start(world: World) {
	world.runSchedule(PrepareSchedule);
	async function loop() {
		if (stopped) return;
		await world.runSchedule(Schedule);
		requestAnimationFrame(loop);
	}
	loop();
}
function stop(world: World) {
	world.runSchedule(StopSchedule);
	stopped = true;
}

const world = await new World()
	.addEventListener('start', start)
	.addEventListener('stop', stop)
	.addPlugin(Mouse.plugin(PrepareSchedule, StopSchedule, document.body))
	.addPlugin(Keyboard.plugin(PrepareSchedule, StopSchedule, document.body))
	.addSystems(Schedule, renderPlayerSystem)
	.addSystems(Schedule, renderBallSystem)
	.addSystems(Schedule, renderCursorSystem)
	.addSystems(Schedule, moveSystem)
	.addSystems(Schedule, updatePlayerSystem)
	.prepare();

function createBall(world: World): Entity {
	const entity = world.spawn();
	entity.addType(IsBall)
	entity.add(new Velocity(1, 1));
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
setTimeout(() => world.stop(), 10_000);
