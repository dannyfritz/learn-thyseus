import { And,World, Schedule, Entity, Query, Res, Tag, With } from 'thyseus';
import { Vec2 } from '@thyseus/math';

class Mouse {
	x: number = 0;
	y: number = 0;
	target: HTMLElement;
	constructor(target: HTMLElement) {
		this.target = target;
		document.body.addEventListener("mousemove", (event) => this.handle_mousemove(event));
	}
	handle_mousemove(event: MouseEvent) {
		this.x = event.clientX;
		this.y = event.clientY;
	}
}

type Code = KeyboardEvent["code"];
class Keyboard {
	target: HTMLElement;
	keys: Map<Code, boolean> = new Map();
	constructor(target: HTMLElement) {
		this.target = target;
		document.body.addEventListener("keydown", (event) => this.handle_keydown(event));
		document.body.addEventListener("keyup", (event) => this.handle_keyup(event));
	}
	isDown(code: Code): boolean {
		return this.keys.get(code) ?? false;
	}
	handle_keydown(event: KeyboardEvent) {
		this.keys.set(event.code, true);
	}
	handle_keyup(event: KeyboardEvent) {
		this.keys.set(event.code, false);
	}
}

class Position extends Vec2 {};
class Velocity extends Vec2 {};
class IsPlayer extends Tag {};
class IsBall extends Tag {};

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

function updateCursorSystem(mouse: Res<Mouse>) {
	cursorElement.style.left = `${mouse.x}px`;
	cursorElement.style.top = `${mouse.y}px`;
}

const playerElement = document.querySelector("#player")! as HTMLDivElement;

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
			position.y += 1;
		}
	}
}

function renderPlayerSystem(player: Query<[Position], With<IsPlayer>>) {
	for (const [position] of player) {
		playerElement.style.left = `${position.x}px`;
		playerElement.style.top = `${position.y}px`;
	}
}

function start(world: World) {
	async function loop() {
		await world.runSchedule(Schedule);
		requestAnimationFrame(loop);
	}
	loop();
}

const world = await new World()
	.insertResource(new Mouse(document.body))
	.insertResource(new Keyboard(document.body))
	.addEventListener('start', start)
	.addSystems(Schedule, renderBallSystem)
	.addSystems(Schedule, updateCursorSystem)
	.addSystems(Schedule, renderPlayerSystem)
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
