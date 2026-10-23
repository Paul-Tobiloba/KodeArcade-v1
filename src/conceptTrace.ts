/** Ephemeral execution evidence for the concept games; never saved as progress. */
export type ConceptTrace = {
  kind: 'value' | 'arithmetic' | 'comparison' | 'and' | 'or' | 'not' | 'call';
  label: string;
  value?: number | boolean;
  skipped?: boolean;
  inputs?: ConceptTrace[];
};

export type ConceptFunctionTrace = {
  phase: 'defined' | 'called' | 'returned';
  name: string;
  argument?: number;
  returned?: number;
  depth: number;
};

export type ConceptLabFrame = {
  output: (number | boolean)[];
  calls: number;
  expression?: ConceptTrace;
  condition?: ConceptTrace;
  function?: ConceptFunctionTrace;
  definitions?: string[];
};
