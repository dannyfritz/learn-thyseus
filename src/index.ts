import { World, Schedule, Entity, Query, Res } from 'thyseus';
import { Vec2 } from '@thyseus/math';

function start(world: World) {
	async function loop() {
		await world.runSchedule(Schedule);
		requestAnimationFrame(loop);
	}
	loop();
}

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

class Velocity extends Vec2 {};

class Position extends Vec2 {};

function moveSystem(query: Query<[Position, Velocity]>) {
	for (const [pos, vel] of query) {
		pos.x += vel.x;
		pos.y += vel.y;
	}
}

const ballElement = document.querySelector("#ball");

function renderBallSystem(query: Query<[Position]>) {
	for (const [pos] of query) {
		ballElement.style.left = `${pos.x}px`;
		ballElement.style.top = `${pos.y}px`;
	}
}

const cursorElement = document.querySelector("#cursor");

function renderCursorSystem(mouse: Res<Mouse>) {
	cursorElement.style.left = `${mouse.x}px`;
	cursorElement.style.top = `${mouse.y}px`;
}

function createBall(world: World): Entity {
	const entity = world.spawn();
	entity.add(new Velocity(1, 1)).add(new Position(0, 0));
	return entity;
}

const world = await new World()
	.insertResource(new Mouse(document.body))
	.addEventListener('start', start)
	.addSystems(Schedule, renderBallSystem)
	.addSystems(Schedule, renderCursorSystem)
	.addSystems(Schedule, moveSystem)
	.prepare();

createBall(world);

world.start();
