import { Vec2 } from "@thyseus/math";
import { Query } from "thyseus";

export class Position extends Vec2 { };
export class Velocity extends Vec2 { };

export function updateVelocitySystem(query: Query<[Position, Velocity]>) {
	for (const [pos, vel] of query) {
		pos.x += vel.x;
		pos.y += vel.y;
	}
}

