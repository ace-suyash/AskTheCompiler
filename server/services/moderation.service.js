const TECH_SIGNALS = {
  positive: [
    // General programming concepts
    'error', 'exception', 'function', 'class', 'method', 'variable',
    'array', 'object', 'string', 'integer', 'boolean', 'null', 'undefined',
    'async', 'await', 'promise', 'callback', 'closure', 'scope',
    // Web / API
    'api', 'endpoint', 'request', 'response', 'http', 'rest', 'graphql',
    'fetch', 'axios', 'cors', 'json', 'xml', 'webhook',
    // Database
    'database', 'query', 'schema', 'migration', 'index', 'sql', 'nosql',
    'mongodb', 'postgres', 'mysql', 'redis', 'orm',
    // DevOps / infra
    'deploy', 'docker', 'container', 'kubernetes', 'ci', 'cd', 'pipeline',
    'git', 'branch', 'merge', 'commit', 'push', 'pull request',
    // Debugging
    'debug', 'stack trace', 'type error', 'syntax error', 'runtime',
    'breakpoint', 'console.log', 'print', 'log',
    // CS fundamentals
    'algorithm', 'complexity', 'recursion', 'loop', 'iteration',
    'data structure', 'tree', 'graph', 'hash', 'sort', 'search',
    // Architecture
    'design pattern', 'interface', 'dependency', 'package', 'module',
    'import', 'export', 'library', 'framework', 'refactor', 'architecture',
    // Performance
    'performance', 'optimize', 'memory', 'leak', 'cache', 'latency',
    // Languages
    'javascript', 'python', 'java', 'c#', 'c++', 'rust', 'go', 'golang',
    'typescript', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r',
    // Frameworks / tools
    'react', 'vue', 'angular', 'svelte', 'next', 'nuxt',
    'node', 'express', 'django', 'flask', 'spring', 'laravel',
    'linux', 'bash', 'terminal', 'command', 'cli', 'config', 'environment',
    // Build tools
    'webpack', 'vite', 'babel', 'eslint', 'prettier', 'npm', 'yarn',
    // Testing
    'test', 'unit test', 'integration', 'mock', 'jest', 'pytest',
  ],
  negative: [
    'recipe', 'cooking', 'relationship', 'dating', 'sports', 'football',
    'weather', 'travel', 'fashion', 'celebrity', 'gossip',
    'diet', 'workout routine', 'movie review', 'song lyrics',
  ],
};

const MINIMUM_SCORE = 1;

export const isOnTopic = (title, body) => {
  if (/```[\s\S]*?```/.test(body) || /`[^`\n]+`/.test(body)) {
    return { allowed: true, score: 999, reason: 'contains_code' };
  }

  const content = `${title} ${body}`.toLowerCase();
  let score = 0;

  for (const word of TECH_SIGNALS.positive) {
    if (content.includes(word)) score++;
  }

  for (const word of TECH_SIGNALS.negative) {
    if (content.includes(word)) score -= 2;
  }

  return {
    allowed: score >= MINIMUM_SCORE,
    score,
    reason: score >= MINIMUM_SCORE ? 'passed' : 'insufficient_tech_signals',
  };
};
