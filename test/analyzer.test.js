import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyzeLog, cleanLine } from "../src/analyzer.js";
import { formatResult } from "../src/formatter.js";

test("remove ANSI, timestamp e marcador do GitHub Actions", () => {
  const line = "2026-08-15T12:00:00.000Z ##[error]\u001b[31mTypeError: boom\u001b[0m";
  assert.equal(cleanLine(line), "TypeError: boom");
});

test("encontra a falha real antes do erro genérico de saída", async () => {
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

test("reconhece um erro de compilação TypeScript", async () => {
  const log = await readFile(new URL("../examples/typescript-failure.log", import.meta.url), "utf8");
  const result = analyzeLog(log);

  assert.equal(result.primary.category, "compiler");
  assert.match(result.primary.text, /TS2322/);
});

test("retorna inconclusivo quando não existe sinal de falha", () => {
  const result = analyzeLog("PASS test/unit.test.js\nTudo certo\n");
  assert.equal(result.status, "unknown");
  assert.equal(result.primary, null);
});

test("gera relatórios em texto, Markdown e JSON", () => {
  const result = analyzeLog("TypeError: cannot read properties of undefined\n at app.js:10:2");
  assert.match(formatResult(result, "text"), /FALHA ENCONTRADA/);
  assert.match(formatResult(result, "markdown"), /## FailLens/);
  assert.equal(JSON.parse(formatResult(result, "json")).primary.category, "runtime");
});

test("o fingerprint ignora mudanças de linha e caminho", () => {
  const first = analyzeLog("TypeError: falhou em C:\\app\\src\\index.js:10:2");
  const second = analyzeLog("TypeError: falhou em C:\\app\\src\\index.js:99:4");
  assert.equal(first.primary.fingerprint, second.primary.fingerprint);
});
