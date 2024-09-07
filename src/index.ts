import { World, Entity, Query, Schedule } from "thyseus";
function updateRainSystem(entities: Query<[Entity]>) {
  for (const [entity] of entities) {
    entity.despawn();
  }
}
const world = await new World()
  .addSystems(Schedule, updateRainSystem)
  .prepare();
world.start();
world.spawn();
await world.runSchedule(Schedule);
await world.runSchedule(Schedule);
