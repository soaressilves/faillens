export const PATTERNS = [
  {
    category: "dependency",
    confidence: "high",
    score: 10,
    regex: /(?:\b(?:module not found|cannot find module|modulenotfounderror|could not resolve|failed to resolve|package .* not found|ERESOLVE)\b|\/(?:bin\/)?(?:ba|z|da)?sh:\s*\d*:\s*[^:]+:\s*not found)/i,
  },
  {
    category: "compiler",
    confidence: "high",
    score: 10,
    regex: /(?:\berror\s+(?:TS|CS|FS|BC)\d+\b|\berror\[[A-Z]\d+\]|\bsyntaxerror\b|\bcannot find symbol\b|\.go:\d+:\d+:\s+(?:undefined|cannot use|too many arguments|not enough arguments)\b|\.kt:\s*\(\d+,\s*\d+\):\s*(?:unresolved reference|type mismatch)\b)/i,
  },
  {
    category: "compiler",
    confidence: "medium",
    score: 8,
    regex: /\b(?:compilation failed|compilation error)\b/i,
  },
  {
    category: "runtime",
    confidence: "high",
    score: 10,
    regex: /\b(?:type|reference)error\b/i,
  },
  {
    category: "test",
    confidence: "high",
    score: 10,
    regex: /(?:\bassertionerror\b|\bexpected\b.+\b(?:received|actual|but)\b)/i,
  },
  {
    category: "test",
    confidence: "high",
    score: 8,
    regex: /\btests? failed\b/i,
  },
  {
    category: "test",
    confidence: "high",
    score: 8,
    regex: /^\s*(?:FAIL|FAILED)\b/,
  },
  {
    category: "runtime",
    confidence: "high",
    score: 9,
    regex: /\b(?:unhandled exception|uncaught exception|segmentation fault|stack overflow|out of memory|panic:)\b/i,
  },
  {
    category: "lint",
    confidence: "high",
    score: 9,
    regex: /^\s*\d+:\d+\s+error\s+.+\s+[a-z][\w-]*\s*$/i,
  },
  {
    category: "command",
    confidence: "medium",
    score: 7,
    regex: /\b(?:command failed|script failed|build failed|npm ERR!|ELIFECYCLE)\b/i,
  },
  {
    category: "exit",
    confidence: "low",
    score: 3,
    regex: /(?:process completed with exit code|exited with code|exit status)\s*[1-9]\d*/i,
  },
  {
    category: "error",
    confidence: "medium",
    score: 6,
    regex: /(?:^|[\s:])(?:error|fatal|exception)(?:[\s:!]|$)/i,
  },
];

export const NOISE_PATTERNS = [
  /^\s*$/,
  /^##\[(?:group|endgroup|debug)\]/i,
  /^\s*(?:download|upload)(?:ing|ed)?\b/i,
  /^\s*(?:restore|cache)(?:d| hit| miss)?\b/i,
  /^\s*(?:info|debug|trace)\b[\s:]/i,
  /\b(?:0 errors?|no errors?|without errors?)\b/i,
  /\bdeprecated\b/i,
  /^\s*[.✓✔-]+\s*$/,
];

export const WRAPPER_PATTERNS = [
  /process completed with exit code/i,
  /the command .* failed with exit code/i,
  /error: process completed/i,
];
