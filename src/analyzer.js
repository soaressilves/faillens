import { createHash } from "node:crypto";
import { NOISE_PATTERNS, PATTERNS, WRAPPER_PATTERNS } from "./patterns.js";

const ANSI_PATTERN = /[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*)?\u0007)|(?:(?:\d{1,4}(?:[;:]\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;
const TIMESTAMP_PATTERN = /^\s*(?:\d{4}-\d{2}-\d{2}[T ][\d:.+-]+Z?\s+|\[\d{2}:\d{2}:\d{2}(?:\.\d+)?\]\s*)/;

export function cleanLine(line) {
  return line
    .replace(ANSI_PATTERN, "")
    .replace(TIMESTAMP_PATTERN, "")
    .replace(/^##\[(?:error|warning)\]\s*/i, "")
    .replace(/\r$/, "")
    .trimEnd();
}

export function isNoise(line) {
  return NOISE_PATTERNS.some((pattern) => pattern.test(line));
}

function classify(line) {
  for (const pattern of PATTERNS) {
    if (pattern.regex.test(line)) {
      return {
        category: pattern.category,
        confidence: pattern.confidence,
        score: pattern.score,
        wrapper: WRAPPER_PATTERNS.some((wrapper) => wrapper.test(line)),
      };
    }
  }
  return null;
}

function createFingerprint(text, category) {
  const stableText = text
    .toLowerCase()
    .replace(/[a-z]:\\[^\s:]+/gi, "<path>")
    .replace(/\/(?:[^\s/:]+\/)+[^\s:]+/g, "<path>")
    .replace(/:\d+(?::\d+)?/g, ":<line>")
    .replace(/\b0x[\da-f]+\b/gi, "<address>")
    .replace(/\b\d{4,}\b/g, "<number>")
    .replace(/\s+/g, " ")
    .trim();

  return createHash("sha256")
    .update(`${category}:${stableText}`)
    .digest("hex")
    .slice(0, 12);
}

function choosePrimary(candidates) {
  const meaningful = candidates.filter((candidate) => !candidate.wrapper);
  const pool = meaningful.length > 0 ? meaningful : candidates;
  return pool.reduce((best, candidate) => {
    if (!best || candidate.score > best.score) return candidate;
    return best;
  }, null);
}

export function analyzeLog(input, options = {}) {
  const contextSize = Number.isInteger(options.context) && options.context >= 0
    ? options.context
    : 2;
  const lines = String(input ?? "").split(/\n/).map(cleanLine);
  const candidates = [];
  let noiseLines = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const text = lines[index];
    if (isNoise(text)) {
      noiseLines += 1;
      continue;
    }

    const match = classify(text);
    if (match) {
      candidates.push({
        line: index + 1,
        text: text.trim(),
        ...match,
      });
    }
  }

  const primaryCandidate = choosePrimary(candidates);
  const primary = primaryCandidate
    ? {
        line: primaryCandidate.line,
        text: primaryCandidate.text,
        category: primaryCandidate.category,
        confidence: primaryCandidate.confidence,
        fingerprint: createFingerprint(primaryCandidate.text, primaryCandidate.category),
      }
    : null;

  const primaryIndex = primary ? primary.line - 1 : -1;
  const context = primary
    ? {
        before: lines
          .slice(Math.max(0, primaryIndex - contextSize), primaryIndex)
          .map((text, offset) => ({
            line: Math.max(0, primaryIndex - contextSize) + offset + 1,
            text,
          })),
        after: lines
          .slice(primaryIndex + 1, primaryIndex + contextSize + 1)
          .map((text, offset) => ({ line: primaryIndex + offset + 2, text })),
      }
    : { before: [], after: [] };

  return {
    schemaVersion: 1,
    status: primary ? "failure" : "unknown",
    summary: primary
      ? `First relevant failure at line ${primary.line}: ${primary.text}`
      : "No relevant failure was identified.",
    primary,
    context,
    signals: candidates.slice(0, 10).map(({ wrapper, score, ...candidate }) => candidate),
    stats: {
      totalLines: lines.length,
      noiseLines,
      candidateCount: candidates.length,
    },
  };
}
