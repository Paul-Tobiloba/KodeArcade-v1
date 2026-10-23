import { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import { linter, lintGutter } from '@codemirror/lint';
import type { AppProject } from '../shared/appLab';
import { appCodeIssues } from './appLabDiagnostics';
import { appCommandHints as commands } from './appLabToolbox';
import { appPropertyFields } from '../shared/appLabApi';

export default function AppLabTextEditor({ value, project, disabled, onChange }: { value: string; project: AppProject; disabled: boolean; onChange: (value: string) => boolean }) {
  const host = useRef<HTMLDivElement>(null), editor = useRef<EditorView | null>(null);
  const latest = useRef({ project, onChange }); latest.current = { project, onChange };
  const editable = useRef(new Compartment());
  const syncing = useRef(false);
  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({ parent: host.current, state: EditorState.create({ doc: value, extensions: [
      basicSetup, javascript(), lintGutter(), editable.current.of(EditorView.editable.of(!disabled)),
      EditorView.contentAttributes.of({ 'aria-label': 'App JavaScript code', spellcheck: 'false' }),
      EditorState.transactionFilter.of(transaction => transaction.newDoc.length > 20000 ? [] : transaction),
      EditorView.lineWrapping,
      autocompletion({ override: [context => {
        const word = context.matchBefore(/[A-Za-z][A-Za-z0-9_.]*/);
        if (!word && !context.explicit) return null;
        const list = commands.map(([label, detail]) => ({ label, detail, type: 'function' }));
        const ids = [...latest.current.project.screens, ...latest.current.project.elements, ...latest.current.project.tables].map(item => ({ label: item.id, detail: 'Design / Data ID', type: 'constant' }));
        const properties = Object.keys(appPropertyFields).map(label => ({ label, detail: 'Control property', type: 'constant' }));
        return completeFromList([...list, ...ids, ...properties])(context);
      }] }),
      linter(view => appCodeIssues(view.state.doc.toString(), latest.current.project).map(issue => {
        const line = view.state.doc.line(Math.max(1, Math.min(issue.line, view.state.doc.lines)));
        return { from: line.from, to: line.to, message: issue.message, severity: issue.severity };
      }), { delay: 250 }),
      EditorView.updateListener.of(update => {
        if (update.docChanged && !syncing.current && !latest.current.onChange(update.state.doc.toString())) {
          const previous = update.startState.doc.toString();
          queueMicrotask(() => { if (editor.current !== view) return; syncing.current = true; try { view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: previous } }); } finally { syncing.current = false; } });
        }
      }),
      EditorView.theme({ '&': { fontSize: '14px', minHeight: '480px', backgroundColor: '#fff', color: '#181339' }, '.cm-scroller': { fontFamily: 'ui-monospace, monospace', lineHeight: '1.8', overflow: 'auto' }, '.cm-content': { padding: '16px 0', minHeight: '480px' }, '.cm-gutters': { backgroundColor: '#f7f4fe', color: '#716596', borderRight: '1px solid #ded9ed' }, '&.cm-focused': { outline: '2px solid #8972bd', outlineOffset: '-2px' }, '.cm-activeLine': { backgroundColor: '#f7f4fe' }, '.cm-tooltip': { border: '1px solid #c6b6e8', backgroundColor: '#fff', color: '#181339' }, '.cm-cursor': { borderLeftColor: '#6237df' } }),
    ] }) });
    editor.current = view;
    return () => { view.destroy(); editor.current = null; };
  }, [project.id]);
  useEffect(() => { const view = editor.current; if (view && view.state.doc.toString() !== value) { syncing.current = true; try { view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } }); } finally { syncing.current = false; } } }, [value]);
  useEffect(() => { editor.current?.dispatch({ effects: editable.current.reconfigure(EditorView.editable.of(!disabled)) }); }, [disabled]);
  return <div className="al-source-editor" ref={host} />;
}
