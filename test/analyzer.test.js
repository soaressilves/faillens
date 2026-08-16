import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyzeLog, cleanLine } from "../src/analyzer.js";
import { formatResult } from "../src/formatter.js";

test("removes ANSI sequences, timestamps, and GitHub Actions markers", () => {
  const line = "2026-08-15T12:00:00.000Z ##[error]\u001b[31mTypeError: boom\u001b[0m";
  assert.equal(cleanLine(line), "TypeError: boom");
});

test("finds the actionable failure before the generic exit error", async () => {
  const log = await readFile(new URL("../examples/github-actions-failure.log", import.meta.url), "utf8");
  const result = analyzeLog(log, { context: 1 });

  assert.equal(result.status, "failure");
  assert.equal(result.primary.line, 5);
  assert.equal(result.primary.category, "test");
  assert.match(result.primary.text, /expected status 200/i);
  assert.equal(result.primary.confidence, "high");
  assert.equal(result.context.before.length, 1);
  assert.equal(result.context.after.length, 1);
  assert.match(result.primary.fingerprint, /^[a-f0-9]{12}$/);
});

test("recognizes a TypeScript compiler error", async () => {
  const log = await readFile(new URL("../examples/typescript-failure.log", import.meta.url), "utf8");
  const result = analyzeLog(log);

  assert.equal(result.primary.category, "compiler");
  assert.match(result.primary.text, /TS2322/);
});

test("returns unknown when there is no failure signal", () => {
  const result = analyzeLog("PASS test/unit.test.js\nEverything is fine\n");
  assert.equal(result.status, "unknown");
  assert.equal(result.primary, null);
});

test("generates text, Markdown, and JSON reports", () => {
  const result = analyzeLog("TypeError: cannot read properties of undefined\n at app.js:10:2");
  assert.match(formatResult(result, "text"), /FAILURE FOUND/);
  assert.match(formatResult(result, "markdown"), /## FailLens/);
  assert.equal(JSON.parse(formatResult(result, "json")).primary.category, "runtime");
});

test("fingerprints ignore path line-number changes", () => {
  const first = analyzeLog("TypeError: failed at C:\\app\\src\\index.js:10:2");
  const second = analyzeLog("TypeError: failed at C:\\app\\src\\index.js:99:4");
  assert.equal(first.primary.fingerprint, second.primary.fingerprint);
});
