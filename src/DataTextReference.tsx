import type { Mission } from './learning';
import { relativeMovement } from './relativeMovement';
import { dataBlocks } from './dataProgram';
export default function DataTextReference({ mission }: { mission: Mission }) {
  const task = mission.dataTask;
  if (!task) return null;
  const relative = relativeMovement(mission), blocks = dataBlocks(mission, false);
  const move = (value: string) => relative ? `forward(${value})` : `move("right", ${value})`;
  return <section aria-label="Data commands">
    {task.topic === 'statements' && <><p>{relative ? 'Pass a distance argument to forward or backward.' : 'Arguments: direction first, distance second.'} Distances are whole numbers from 0 to 9.</p><pre>{relative ? 'forward(3)\nturn_left()\nforward(1)' : 'move("right", 3)\nmove("up", 1)'}</pre></>}
    {(task.topic === 'lists' || task.list) && <><p>Lists contain 1–8 values from 0 to 9. Index 0 is the first item. Reading does not remove it.</p><pre>{['steps = [2, 1]', ...(blocks.includes('list_append') ? ['steps.append(3)'] : []), ...(blocks.includes('list_update') ? ['steps[0] = 3'] : []), move('steps[0]')].join('\n')}</pre></>}
    {task.topic === 'objects' && <><p>Create the two named properties before reading or updating them. This is dictionary-style data, not a class.</p><pre>{['robot = {"speed": 2, "energy": 3}', ...(blocks.includes('object_update') ? ['robot["speed"] = 1'] : []), move('robot["speed"]')].join('\n')}</pre>{task.list && <pre>{'robot["speed"] = steps[0]'}</pre>}</>}
  </section>;
}
