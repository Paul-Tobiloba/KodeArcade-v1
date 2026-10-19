import type { Lesson } from './curriculum';
export function relativeLesson(topic: string, base: Lesson, grade: number): Lesson {
  const orientation = { title: 'Watch the facing arrow', text: 'Each run starts facing right. Forward moves in the facing direction. Backward moves behind you without turning around. Turn left and Turn right rotate 90° without changing squares. Screen directions in a goal describe the board, not the movement blocks.' };
  const degrees = { title: 'Choose a turn angle', text: 'A 90° turn is a quarter turn; 180° is a half turn; 270° is three quarter turns. Grid routes allow these angles so movement stays square-to-square. In the drawing lab, angles such as 45° and 60° make diagonal lines and polygons.' };
  const legacy = { title: 'Reading previous programs', text: 'Saved Move up/down/left/right blocks and move_right()-style commands still mean fixed screen directions. They keep their old meaning and do not rotate the facing arrow. Older quiz code may use these screen-direction commands. New programs use forward/backward and turns.' };
  const lesson: Lesson = { ...base, sections: [orientation, ...(grade >= 5 ? [degrees] : []), ...base.sections, legacy] };
  if (topic === 'sequences') {
    lesson.title = 'Sequences: move, turn and plan the order';
    lesson.introduction = 'A sequence runs instructions in order. Your character now has a facing direction: turning changes what the next forward or backward movement will do.';
    lesson.sections = [orientation, { title: 'Plan each square and each turn', text: 'Find the destination and obstacles. Trace your route, then decide where you must turn. Forward, left turn, forward visits different squares from left turn, forward, forward. Predict the facing direction as well as the position.' }, ...(grade >= 5 ? [degrees] : []), { title: 'Check your prediction', text: 'Connect your program under the start block. Watch the facing arrow during Play. If the first unexpected action is a turn, fix that turn before adding movement. Unconnected blocks do not run.' }, legacy];
    lesson.example = { title: 'A corner without a screen-direction arrow', steps: ['Move forward', 'Turn left', 'Move forward'], explanation: 'Starting facing right, move one square right. Turn left in place to face up, then move one square up. Two movement steps and one turn make three statements.' };
    lesson.takeaway = 'Forward and backward depend on facing. Turns change facing, not position. Order connects them into a route.';
  }
  if (topic === 'statements') {
    lesson.sections = [orientation, { title: 'A distance argument', text: 'Move forward by 3 steps passes the distance 3 to a command. In text, forward(3) supplies that argument. forward(2) calls the same command with a different distance. One statement can therefore request several movement steps.' }, { title: 'Arguments and parameters', text: 'An argument is the supplied value, such as 3. A parameter is the input name in a command definition, such as distance. You are calling built-in commands, not defining functions here.' }, ...(grade >= 5 ? [degrees] : []), legacy];
    lesson.example = { title: 'Movement and a turn', steps: ['Move forward by 3 steps', 'Turn left', 'Move forward by 1 step'], explanation: 'From the initial right-facing direction, this travels three squares right and one up. There are three statements, including the turn, and four movement steps.' };
  } else if (topic === 'lists') {
    lesson.example = { title: 'Distances from an ordered list', steps: ['Create steps = [3, 2]', 'Move forward by steps item 0', 'Turn left', 'Move forward by steps item 1'], explanation: 'Starting facing right, the first item gives three steps right. Turn to face up, then read the second item for two steps up. The list remains [3, 2].' };
  } else if (topic === 'objects') {
    lesson.example = { title: 'Read a named distance', steps: ['Create robot: speed 2, energy 3', 'Set robot.speed to 1', 'Move forward by robot.speed'], explanation: 'Starting facing right, move one square forward. Speed is now 1 and energy remains 3. Reading alone does not consume either property.' };
  } else if (topic === 'loops') {
    lesson.example = { title: 'Repeat a corner pattern', steps: ['Repeat 2 times', '    Move forward', '    Turn left', '    Move forward', '    Turn right'], explanation: 'The last turn restores the facing direction for the next repetition. Starting facing right, the route moves right, up, right, up.' };
  } else if (topic === 'conditionals') {
    lesson.introduction = 'A condition checks the board right now. Path forward checks the square in the facing direction. Turning changes which square the next forward check inspects.';
    lesson.sections = [orientation, { title: 'Check, then choose', text: 'If path forward is clear, move forward. Otherwise, turn left and move forward only if that route is safe. An IF / ELSE chooses one branch, not both. Each check uses the current facing and position, including inside a loop.' }, ...(grade >= 5 ? [degrees] : []), legacy];
    lesson.example = { title: 'Decide relative to facing', steps: ['If path forward is clear', '    Move forward', 'Else', '    Turn left', '    Move forward'], explanation: 'With a blocked forward square, the ELSE branch turns left before moving. Check the board to make sure that new square is safe too.' };
  } else if (topic === 'variables') {
    lesson.sections = lesson.sections.map(section => ({ ...section, text: section.text.replaceAll('Move right by score', 'Move forward by score') }));
    lesson.example = { title: 'A distance remembered in score', steps: ['Set score to 2', 'Change score by 1', 'Move forward by score'], explanation: 'Score becomes 3. Move three squares in the current facing direction. Reading score does not change it.' };
  } else if (topic === 'debugging') {
    lesson.sections = lesson.sections.map(section => ({ ...section, text: section.text.replaceAll('point the wrong way', 'move or turn the wrong way') }));
    lesson.example = { title: 'Find the wrong action', steps: ['Move forward', 'Turn right (wrong turn)', 'Change Turn right to Turn left', 'Move forward'], explanation: 'The repair changes facing rather than adding more steps. Watch the first action where the run differs from your plan.' };
  }
  return lesson;
}
