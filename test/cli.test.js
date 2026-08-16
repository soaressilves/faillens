import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../bin/faillens.js", import.meta.url));
const fixture = fileURLToPath(new URL("../examples/github-actions-failure.log", import.meta.url));

function run(args, input = null) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], { windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
    if (input !== null) child.stdin.end(input);
  });
}

test("mostra ajuda", async () => {
  const result = await run(["--help"]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /Uso:/);
});

test("a versão da CLI acompanha o package.json", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  const result = await run(["--version"]);
  assert.equal(result.code, 0);
  assert.equal(result.stdout.trim(), packageJson.version);
});

test("analisa arquivo e produz JSON", async () => {
  const result = await run([fixture, "--format", "json"]);
  assert.equal(result.code, 0);
  assert.equal(JSON.parse(result.stdout).primary.category, "test");
});

test("aceita log pelo stdin", async () => {
  const result = await run(["-"], "Error: serviço indisponível\n");
  assert.equal(result.code, 0);
  assert.match(result.stdout, /FALHA ENCONTRADA/);
});

test("fail-on-detection retorna código 1", async () => {
  const result = await run([fixture, "--fail-on-detection"]);
  assert.equal(result.code, 1);
});

test("opção inválida retorna código 2 e mensagem clara", async () => {
  const result = await run([fixture, "--format", "xml"]);
  assert.equal(result.code, 2);
  assert.match(result.stderr, /Formato inválido/);
});
