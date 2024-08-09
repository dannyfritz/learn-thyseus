import { Vec2 } from "@thyseus/math";
import { Query, Res } from "thyseus";
import { Time } from "./Time";

export class Position extends Vec2 { };
export class Velocity extends Vec2 { };

export function updateVelocitySystem(time: Res<Time>, query: Query<[Position, Velocity]>) {
	const dt = time.dts;
	for (const [pos, vel] of query) {
		pos.x += vel.x * dt;
		pos.y += vel.y * dt;
	}
}

