import { appendFile, readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { analyzeLog } from "../src/analyzer.js";
import { formatMarkdown } from "../src/formatter.js";

function getInput(name) {
  const exactName = `INPUT_${name.toUpperCase()}`;
  const underscoreName = exactName.replaceAll("-", "_");
  return (process.env[exactName] ?? process.env[underscoreName] ?? "").trim();
}

function parseContext(value) {
  const context = Number(value || "2");
  if (!Number.isInteger(context) || context < 0 || context > 20) {
    throw new Error("The context input must be an integer between 0 and 20.");
  }
  return context;
}

function parseBoolean(value) {
  const normalized = (value || "false").toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  throw new Error("The fail-on-detection input must be true or false.");
}

function escapeWorkflowData(value) {
  return String(value)
    .replaceAll("%", "%25")
    .replaceAll("\r", "%0D")
    .replaceAll("\n", "%0A");
}

async function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `${name}=${String(value)}\n`, "utf8");
  } else {
    process.stdout.write(`FailLens output: ${name}=${String(value)}\n`);
  }
}

async function publishOutputs(result) {
  await setOutput("status", result.status);
  await setOutput("category", result.primary?.category ?? "");
  await setOutput("confidence", result.primary?.confidence ?? "");
  await setOutput("fingerprint", result.primary?.fingerprint ?? "");
  await setOutput("line", result.primary?.line ?? "");
}

async function publishSummary(result) {
  const summary = `${formatMarkdown(result)}\n---\nGenerated locally by FailLens. No log data was uploaded.\n`;
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, summary, "utf8");
  } else {
    process.stdout.write(summary);
  }
}

export async function runAction() {
  try {
    const inputPath = getInput("log-file");
    if (!inputPath) throw new Error("The log-file input is required.");

    const context = parseContext(getInput("context"));
    const failOnDetection = parseBoolean(getInput("fail-on-detection"));
    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
    const logPath = isAbsolute(inputPath) ? inputPath : resolve(workspace, inputPath);
    const log = await readFile(logPath, "utf8");
    const result = analyzeLog(log, { context });

    await publishOutputs(result);
    await publishSummary(result);
    process.stdout.write(`FailLens: ${result.summary}\n`);

    if (failOnDetection && result.status === "failure") {
      process.stderr.write("FailLens: failing the action because a relevant failure was detected.\n");
      process.exitCode = 1;
    }
  } catch (error) {
    process.stdout.write(`::error::${escapeWorkflowData(`FailLens action failed: ${error.message}`)}\n`);
    process.exitCode = 1;
  }
}

await runAction();
