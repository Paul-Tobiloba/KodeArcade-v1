import type { Mission } from './learning';
import { gradeSolutions } from './gradeMissions';
import { collectionSolutions } from './collectionMissions';
import { dataSolutions } from './dataMissions';
import { relativeMovement, relativeProgram, relativeProgramText } from './relativeMovement';
export function relativeTeaching(mission: Mission): Mission {
  if (mission.conceptTask || !relativeMovement(mission)) return mission;
  const reference = gradeSolutions[mission.id] ?? collectionSolutions[mission.id] ?? dataSolutions[mission.id];
  const statements = [
    'A statement gives one instruction. Move forward by steps takes a distance argument and follows your current facing direction.',
    'Keep the movement command and change its distance argument. Turn to face the required board direction before moving.',
    'Choose forward or backward and a distance as inputs. Use a turn at the corner; the next move follows the new facing direction.',
    'Arguments control distance, but order still matters. Turn and move onto a clear route before crossing behind the obstacle.',
    'Reuse the movement command with different distances. Inside a loop, include the turns needed to begin the next repetition correctly.',
    'Check the movement direction, distance argument and turns separately. Correct syntax can still describe the wrong route.',
  ];
  const index = Number(mission.id.match(/-statements-(\d+)$/)?.[1]) - 1;
  return { ...mission, ...(mission.dataTask?.topic === 'statements' && statements[index] ? { description: statements[index] } : {}), hints: [
    'Find the facing arrow and destination. Every run starts facing right. Trace a safe route before coding.',
    mission.dataTask ? 'Create the required data first. Forward/backward reads the distance in the current facing direction; a turn changes that direction.' : mission.variables ? 'SET score first. Move forward/backward by score reads its value in the current facing direction.' : mission.conditionals ? 'A relative path check uses the current facing direction. Turn changes which square is ahead. Item/gate/bridge checks still inspect the activity objects.' : 'Forward moves where you face. Backward moves behind you without turning. Left/right turns rotate 90° in place.',
    mission.requireLoop ? 'Repeat the complete pattern, including turns. Check which direction you face at the start of the next repetition.' : 'Predict both position and facing after every action. Change the first action where your prediction and the run differ.',
    reference ? `One reference program (each new line is an instruction):\n${relativeProgramText(relativeProgram(reference))}` : 'Try the outside edge. Use turns at corners and forward/backward along clear squares.',
  ] };
}
export function relativeStarterText(mission: Mission) {
  if (!relativeMovement(mission) || !mission.starter.length) return mission.starter.map(direction => `move_${direction}()`).join('\n');
  const state = mission.starter.reduceRight<import('blockly/core').serialization.blocks.State | undefined>((next, direction) => ({ type: `ka_${direction}`, ...(next ? { next: { block: next } } : {}) }), undefined)!;
  return relativeProgramText(relativeProgram(state));
}
