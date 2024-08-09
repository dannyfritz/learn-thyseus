import { Res, Schedule, World } from "thyseus";
import { Time } from "./Time";

export class StartSchedule extends Schedule { }
export class StopSchedule extends Schedule { }
export class RenderSchedule extends Schedule { }
export class BeforeSchedule extends Schedule { }
export class MainSchedule extends Schedule { }
export class AfterSchedule extends Schedule { }

class Engine {
	stopped: boolean = false;
}

function _noop() { }

function start(world: World) {
	setTimeout(() => world.stop(), 10_000);
	world.runSchedule(StartSchedule);
	async function loop() {
		const engine = await world.getResource(Engine);
		if (engine.stopped) return;
		await world.runSchedule(BeforeSchedule);
		await world.runSchedule(RenderSchedule);
		await world.runSchedule(MainSchedule);
		await world.runSchedule(AfterSchedule);
		requestAnimationFrame(loop);
	}
	loop();
}

function stopSystem(engine: Res<Engine>) {
	engine.stopped = true;
}

function stop(world: World) {
	world.runSchedule(StopSchedule);
}

export function baseEnginePlugin(world: World) {
	world
		.addEventListener('start', start)
		.addEventListener('stop', stop)
		.addPlugin(Time.plugin(StartSchedule))
		.insertResource(new Engine())
		.addSystems(StopSchedule, stopSystem)
		// NOTE: NOOP added to prevent runSchedule from failing
		.addSystems(RenderSchedule, _noop)
		.addSystems(BeforeSchedule, _noop)
		.addSystems(MainSchedule, _noop)
		.addSystems(AfterSchedule, _noop);
}

