import { Schedule, World } from "thyseus";

export class PrepareSchedule extends Schedule { }
export class StopSchedule extends Schedule { }
export class BeforeSchedule extends Schedule { }
export class MainSchedule extends Schedule { }
export class AfterSchedule extends Schedule { }

let stopped = false;

function _noop() {}

function start(world: World) {
	setTimeout(() => world.stop(), 10_000);
	world.runSchedule(PrepareSchedule);
	async function loop() {
		if (stopped) return;
		await world.runSchedule(BeforeSchedule);
		await world.runSchedule(Schedule);
		await world.runSchedule(AfterSchedule);
		requestAnimationFrame(loop);
	}
	loop();
}

function stop(world: World) {
	world.runSchedule(StopSchedule);
	stopped = true;
}

export function baseEnginePlugin(world: World) {
  world
	  .addEventListener('start', start)
	  .addEventListener('stop', stop)
	  // NOTE: NOOP added to prevent runSchedule from failing
	  .addSystems(BeforeSchedule, _noop)
	  .addSystems(Schedule, _noop)
	  .addSystems(AfterSchedule, _noop);
}

