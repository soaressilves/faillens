import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const actionEntrypoint = join(projectRoot, "action", "index.js");
const failureFixture = join(projectRoot, "examples", "github-actions-failure.log");
const successFixture = join(projectRoot, "test", "fixtures", "successful-build.log");

function parseOutputs(content) {
  return Object.fromEntries(
    content.trim().split("\n").filter(Boolean).map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
  );
}

async function executeAction(overrides = {}) {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "faillens-action-"));
  const outputFile = join(temporaryDirectory, "output.txt");
  const summaryFile = join(temporaryDirectory, "summary.md");
  const environment = {
    ...process.env,
    "INPUT_LOG-FILE": failureFixture,
    INPUT_CONTEXT: "2",
    "INPUT_FAIL-ON-DETECTION": "false",
    GITHUB_OUTPUT: outputFile,
    GITHUB_STEP_SUMMARY: summaryFile,
    GITHUB_WORKSPACE: projectRoot,
    ...overrides,
  };

  if (overrides["INPUT_LOG-FILE"] === null) delete environment["INPUT_LOG-FILE"];

  try {
    const execution = await new Promise((resolveExecution, reject) => {
      const child = spawn(process.execPath, [actionEntrypoint], {
        env: environment,
        windowsHide: true,
      });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
      child.on("error", reject);
      child.on("close", (code) => resolveExecution({ code, stdout, stderr }));
    });
    const output = await readFile(outputFile, "utf8").catch(() => "");
    const summary = await readFile(summaryFile, "utf8").catch(() => "");
    return { ...execution, outputs: parseOutputs(output), summary };
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

test("GitHub Action publishes failure outputs and a job summary", async () => {
  const result = await executeAction();
  assert.equal(result.code, 0);
  assert.equal(result.outputs.status, "failure");
  assert.equal(result.outputs.category, "test");
  assert.equal(result.outputs.confidence, "high");
  assert.match(result.outputs.fingerprint, /^[a-f0-9]{12}$/);
  assert.equal(result.outputs.line, "5");
  assert.match(result.summary, /first relevant failure/i);
  assert.match(result.summary, /No log data was uploaded/);
});

test("GitHub Action can fail on detection after publishing the report", async () => {
  const result = await executeAction({ "INPUT_FAIL-ON-DETECTION": "true" });
  assert.equal(result.code, 1);
  assert.equal(result.outputs.status, "failure");
  assert.match(result.stderr, /failing the action/);
  assert.match(result.summary, /AssertionError/);
});

test("GitHub Action reports an inconclusive successful log", async () => {
  const result = await executeAction({ "INPUT_LOG-FILE": successFixture });
  assert.equal(result.code, 0);
  assert.equal(result.outputs.status, "unknown");
  assert.equal(result.outputs.category, "");
  assert.match(result.summary, /inconclusive analysis/i);
});

test("GitHub Action rejects a missing log-file input", async () => {
  const result = await executeAction({ "INPUT_LOG-FILE": null });
  assert.equal(result.code, 1);
  assert.match(result.stdout, /log-file input is required/);
});

test("GitHub Action validates context and boolean inputs", async () => {
  const invalidContext = await executeAction({ INPUT_CONTEXT: "21" });
  assert.equal(invalidContext.code, 1);
  assert.match(invalidContext.stdout, /integer between 0 and 20/);

  const invalidBoolean = await executeAction({ "INPUT_FAIL-ON-DETECTION": "sometimes" });
  assert.equal(invalidBoolean.code, 1);
  assert.match(invalidBoolean.stdout, /must be true or false/);
});

test("action metadata exposes the documented Node.js interface", async () => {
  const metadata = await readFile(join(projectRoot, "action.yml"), "utf8");
  assert.match(metadata, /using: node24/);
  assert.match(metadata, /log-file:/);
  assert.match(metadata, /fail-on-detection:/);
  assert.match(metadata, /fingerprint:/);
  assert.match(metadata, /main: action\/index\.js/);
});
