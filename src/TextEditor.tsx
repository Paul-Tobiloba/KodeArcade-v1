import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { EditorHandle } from './BlockEditor';
import type { Mission } from './learning';
import { runText } from './textCoding';

export default forwardRef<EditorHandle, { code: string; mission: Mission; drawing?: string; running: boolean; onChange: (code: string) => void }>(function TextEditor({ code, mission, drawing, running, onChange }, ref) {
  const [line, setLine] = useState('');
  const escapeTab = useRef(false);
  useImperativeHandle(ref, () => ({ run: m => runText(code, m), clear: () => onChange(''), highlight: id => setLine(id.replace('line-', '')) }), [code, onChange]);
  return <div className="text-editor">
    <p className="text-language">Python-style practice · a small teaching language, not full Python</p>
    <label className="sr-only" htmlFor="typed-program">Your text program</label>
    <textarea id="typed-program" aria-describedby="text-keyboard-help" spellCheck={false} autoCapitalize="off" autoCorrect="off" value={code} readOnly={running} maxLength={10000} placeholder={drawing ? '# Draw with Dash\nforward(40)\nturn(90)' : '# Write your instructions\nmove_right()'} onChange={e => onChange(e.target.value)} onKeyDown={e => {
      if (e.key === 'Escape') { escapeTab.current = true; return; }
      if (e.key !== 'Tab' || running || e.shiftKey) return;
      if (escapeTab.current) { escapeTab.current = false; return; }
      e.preventDefault(); const input = e.currentTarget, start = input.selectionStart, end = input.selectionEnd;
      onChange(`${code.slice(0, start)}    ${code.slice(end)}`);
      requestAnimationFrame(() => { input.selectionStart = input.selectionEnd = start + 4; });
    }} />
    <span id="text-keyboard-help" className="sr-only">Tab indents by four spaces. Press Escape then Tab to leave the editor, or Shift Tab to move back.</span>
    <p className="text-execution" role="status">{line ? `Running line ${line}` : drawing ? 'Forward draws a line. Turn changes Dash’s direction. Press Play to test.' : 'Each movement command moves one square. Press Play to test.'}</p>
    {drawing ? <details className="text-reference"><summary>Commands & examples</summary><pre>{drawing}</pre><p>forward(40), turn(90), loops (2–12), distance = 40, distance += 5, forward(distance), push(), pop(), pen_up() and pen_down(). Maximum 500 operations, three nested groups. Indent by four spaces. Tab indents; Escape then Tab leaves the editor. Blocks and text save separately. This is not full Python.</p></details> :
    <details className="text-reference"><summary>Commands & examples</summary><p>Keep brackets and colons. Indent a group with four spaces (Tab adds them). Escape then Tab leaves the editor; Shift Tab moves back. Blocks and text are saved separately; switching does not translate them.</p><pre>{'move_right()\nmove_down()\nmove_left()\nmove_up()'}</pre>{mission.loops && <pre>{'for step in range(3):\n    move_right()'}</pre>}{mission.conditionals && <pre>{'if path_clear("right"):\n    move_right()\nelse:\n    move_up()'}</pre>}{mission.variables && <pre>{'score = 2\nscore += 1\nmove_by_score("right")'}</pre>}<p>Limits: 24 instructions, loops repeat 2–5 times, up to three nested groups. Imports, functions and general Python expressions are not supported yet.</p></details>
    }
  </div>;
});
