import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MissionStage from './MissionStage';
import { missions } from './learning';

describe('challenge board dimensions', () => {
  for (const size of [5, 6, 7, 8, 10]) {
    it(`renders and positions a ${size} by ${size} board`, () => {
      const mission = { ...missions[0], size, concept: 'Conditionals', end: { x: size - 1, y: size - 1 } };
      const html = renderToStaticMarkup(<MissionStage stageRef={createRef<HTMLElement>()} mission={mission} position={mission.end} step={0} result={null} running={false} onChooseEnd={() => {}}>{null}</MissionStage>);
      expect(html.match(/class="cell /g)).toHaveLength(size * size);
      expect(html).toContain(`${size} by ${size} board. Milo`);
      expect(html).toContain(`--board-size:${size}`);
      expect(html).toContain(`--x:${size - 1};--y:${size - 1}`);
      expect(html).toContain('Milo: row');
    });
  }
});
