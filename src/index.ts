import { And, World, Schedule, Entity, Query, Res, Tag, With, Plugin } from 'thyseus';
import { Vec2 } from '@thyseus/math';

class Mouse {
	pos: Vec2;
	target: HTMLElement;
	constructor(target: HTMLElement) {
		this.pos = new Vec2(0, 0);
		this.target = target;
	}
	start() {
		this.target.addEventListener("mousemove", (event) => this.handle_mousemove(event));
	}
	handle_mousemove(event: MouseEvent) {
		this.pos.x = event.clientX;
		this.pos.y = event.clientY;
	}
	static plugin: (schedule: typeof Schedule, target: HTMLElement) => Plugin
		= (schedule, target) => (world: World) => {
			world.insertResource(new Mouse(target));
			world.addSystems(schedule, prepareMouse);
		}
}
function prepareMouse(mouse: Res<Mouse>) {
	mouse.start()
}

type Code = KeyboardEvent["code"];
class Keyboard {
	target: HTMLElement;
	keys: Map<Code, boolean> = new Map();
	constructor(target: HTMLElement) {
		this.target = target;
	}
	start() {
		this.target.addEventListener("keydown", (event) => this.handle_keydown(event));
		this.target.addEventListener("keyup", (event) => this.handle_keyup(event));
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
	static plugin: (schedule: typeof Schedule, target: HTMLElement) => Plugin = (schedule, target) => (world: World) => {
		world.insertResource(new Keyboard(target));
		world.addSystems(schedule, prepareKeyboard);
	}
}
function prepareKeyboard(keyboard: Res<Keyboard>) {
	keyboard.start()
}

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

function start(world: World) {
	world.runSchedule(PrepareSchedule);
	async function loop() {
		await world.runSchedule(Schedule);
		requestAnimationFrame(loop);
	}
	loop();
}

const world = await new World()
	.addEventListener('start', start)
	.addPlugin(Mouse.plugin(PrepareSchedule, document.body))
	.addPlugin(Keyboard.plugin(PrepareSchedule, document.body))
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
