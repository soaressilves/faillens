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

test("shows help", async () => {
  const result = await run(["--help"]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /Usage:/);
});

test("CLI version matches package.json", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  const result = await run(["--version"]);
  assert.equal(result.code, 0);
  assert.equal(result.stdout.trim(), packageJson.version);
});

test("analyzes a file and produces JSON", async () => {
  const result = await run([fixture, "--format", "json"]);
  assert.equal(result.code, 0);
  assert.equal(JSON.parse(result.stdout).primary.category, "test");
});

test("accepts a log through stdin", async () => {
  const result = await run(["-"], "Error: service unavailable\n");
  assert.equal(result.code, 0);
  assert.match(result.stdout, /FAILURE FOUND/);
});

test("fail-on-detection returns exit code 1", async () => {
  const result = await run([fixture, "--fail-on-detection"]);
  assert.equal(result.code, 1);
});

test("an invalid option returns exit code 2 and a clear message", async () => {
  const result = await run([fixture, "--format", "xml"]);
  assert.equal(result.code, 2);
  assert.match(result.stderr, /Invalid format/);
});
