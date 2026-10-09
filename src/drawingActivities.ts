export type DrawingActivity = { id: string; title: string; objective: string; reference: string; step: number; turn: number; repeats?: number; advanced?: boolean; free?: boolean };
const polygon = (sides: number, turn: number, distance = 60) => `for side in range(${sides}):\n    forward(${distance})\n    turn(${turn})`;
const activity = (id: string, title: string, objective: string, reference: string, step = 60, turn = 90, repeats?: number): DrawingActivity => ({ id,title,objective,reference,step,turn,repeats });
const free = (): DrawingActivity => ({ id:'create',title:'Make it yours',objective:'Invent a drawing. Explain your instructions, test them and change one part.',reference:'',step:40,turn:90,free:true });
const star = polygon(5,144,90);
const snowflake = 'for arm in range(6):\n    forward(80)\n    turn(180)\n    forward(80)\n    turn(180)\n    turn(60)';
const branch = 'push()\nturn(45)\nforward(20)\npop()\npush()\nturn(-45)\nforward(20)\npop()';
const indent = (text: string, n: number) => text.split('\n').map(line => ' '.repeat(n)+line).join('\n');
const dendrite = `for arm in range(6):\n    push()\n    for twig in range(3):\n        forward(25)\n${indent(branch,8)}\n    pop()\n    turn(60)`;
export const drawingActivities: Record<string, DrawingActivity[]> = {
  'grade-1': [
    activity('trail','A little trail','One forward arrow draws one step. Draw two steps in order.','forward(40)\nforward(40)',40),
    activity('corner','Turn a corner','Draw a step, turn left, then draw another step.','forward(40)\nturn(90)\nforward(40)',40),
    activity('square','Close a square','Four sides bring your pen back home. Turn after each side.','forward(40)\nturn(90)\nforward(40)\nturn(90)\nforward(40)\nturn(90)\nforward(40)',40),
    activity('stairs','Little stairs','Alternate a left turn and a right turn to draw two stairs.','forward(40)\nturn(90)\nforward(40)\nturn(-90)\nforward(40)\nturn(90)\nforward(40)',40),free(),
  ],
  'grade-2': [
    activity('square','A repeating square','Repeat one side and one turn four times.',polygon(4,90,40),40,90,4),
    activity('triangle','Three sides','Try a three-part repeat pattern. Notice the sharper turn.',polygon(3,120),60,120,3),
    activity('rectangle','Long side, short side','Repeat a group containing two different side lengths.','for pair in range(2):\n    forward(80)\n    turn(90)\n    forward(40)\n    turn(90)',40,90,2),
    activity('zigzag','Zigzag trail','Repeat forward, turn left, forward, turn right.','for zig in range(3):\n    forward(40)\n    turn(60)\n    forward(40)\n    turn(-60)',40,60,3),free(),
  ],
  'grade-3': [
    activity('square','Quarter-turn square','Four 90° quarter-turns make a full 360° turn.',polygon(4,90),60,90,4),
    activity('pentagon','Five-sided discovery','Five 72° outside turns close a pentagon.',polygon(5,72),60,72,5),
    activity('hexagon','Six equal sides','Compare six 60° turns with the square’s four 90° turns.',polygon(6,60),60,60,6),
    activity('star','A five-point star','A star uses five 144° turns. Its crossing lines make a different pattern.',star,90,144,5),
    activity('flower','Square-petal flower','Nest a four-side square inside a four-petal repeat.','for petal in range(4):\n    for side in range(4):\n        forward(40)\n        turn(90)\n    turn(90)',40,90,4),free(),
  ],
  'grade-4': [
    activity('triangle','Inside or outside?','An equilateral triangle has 60° inside angles but the pen turns 120° outside.',polygon(3,120),60,120,3),
    activity('octagon','Eight-sided route','Eight 45° outside turns sum to 360°.',polygon(8,45),60,45,8),
    activity('star','Crossing star','Predict where five 144° turns cross and where the pen returns.',star,90,144,5),
    activity('snowflake','Six-arm snowflake','Draw an arm, retrace it to the centre, then rotate 60° for the next arm.',snowflake,80,60,6),
    activity('rosette','Triangle rosette','Repeat a triangle, then rotate it to create six petals.','for petal in range(6):\n    for side in range(3):\n        forward(40)\n        turn(120)\n    turn(60)',40,60,6),free(),
  ],
  'grade-5': [
    activity('hexagon','Type a hexagon','Type a loop. Explain why the repeat count and outside angle work together.',polygon(6,60),60,60,6),
    activity('star','Type a star','Use five repeats and 144° turns to make crossing lines.',star,90,144,5),
    { ...activity('spiral','A growing spiral','Store distance, then increase it after each side. Compare a changing value with a fixed loop.','distance = 15\nfor side in range(8):\n    forward(distance)\n    turn(90)\n    distance += 10',15,90,8),advanced:true },
    { ...activity('branch','Remember a branch','push() remembers position and heading; pop() returns there without drawing a joining line.',`forward(40)\n${branch}\nforward(40)`,40,45),advanced:true },
    { ...activity('crystal','Branching ice crystal','Combine a repeated arm and two saved branches to make a six-arm ice crystal.',`for arm in range(6):\n    push()\n    forward(50)\n${indent(branch,4)}\n    forward(30)\n    pop()\n    turn(60)`,50,60,6),advanced:true },free(),
  ],
  'grade-6': [
    activity('octagon','Octagon prediction','Predict the result of eight 45° outside turns before running.',polygon(8,45),60,45,8),
    activity('double-star','Two rotated stars','Nest the five-point star inside a two-part repeat, rotating between stars.',`for star in range(2):\n${indent(star,4)}\n    turn(36)`,90,36,2),
    { ...activity('spiral','Variable-driven spiral','Use a stored distance to grow a twelve-part spiral. Trace the value after each iteration.','distance = 10\nfor side in range(12):\n    forward(distance)\n    turn(90)\n    distance += 8',10,90,12),advanced:true },
    { ...activity('dendrite','Stellar dendrite','Use nested loops and saved positions to build six arms, each with three pairs of twigs. This is a stylised ice-crystal diagram.',dendrite,25,60,6),advanced:true },
    { ...activity('separate','Separate shapes','Lift the pen to move between a square and a triangle without joining them.',`for side in range(4):\n    forward(40)\n    turn(90)\npen_up()\nforward(100)\npen_down()\nfor side in range(3):\n    forward(40)\n    turn(120)`,40,90,4),advanced:true },free(),
  ],
};
export const drawingSaveKey = (grade: string, id: string) => `kodearcade-drawing-v2-${grade}-${id}`;
