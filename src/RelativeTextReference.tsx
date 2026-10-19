import type { Mission } from './learning';
import { degreeTurns } from './relativeMovement';
export default function RelativeTextReference({ mission }: { mission: Mission }) {
  return <section aria-label="Relative movement commands"><p>Start facing right. Turns change facing, not position. Backward keeps your facing direction.</p>
    <pre>{'forward()\nturn_left()\nforward()\nbackward()\nturn_right()'}</pre>
    {degreeTurns(mission) && <><pre>{'turn_right(180)\nforward()'}</pre><p>Grid angles: 90°, 180° or 270°. Drawing supports other angles.</p></>}
    {mission.loops && <pre>{'for step in range(2):\n    forward()\n    turn_left()\n    forward()\n    turn_right()'}</pre>}
    {mission.conditionals && !mission.collectibles && !mission.gate && !mission.river && <pre>{'if relative_path_clear("forward"):\n    forward()\nelse:\n    turn_left()\n    forward()'}</pre>}
    {mission.variables && <pre>{'score = 2\nscore += 1\nforward(score)'}</pre>}
  </section>;
}
