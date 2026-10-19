// Keep original generation order stable: public saves contain mission indices.
export const originalTopics = (grade: number): string[] => grade === 1
  ? ['sequences', 'directions', 'debugging']
  : grade === 2 ? ['sequences', 'directions', 'loops', 'debugging']
  : ['sequences', 'directions', 'loops', 'debugging', 'conditionals', 'variables'];
export const activeTopics = (grade: number): string[] => grade <= 2
  ? originalTopics(grade).filter(topic => topic !== 'directions')
  : ['sequences', 'statements', 'loops', 'debugging', 'conditionals', 'variables', 'operators', 'boolean', 'functions', 'lists', 'objects', 'creative'];
