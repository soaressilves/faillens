import { readFile, writeFile } from "node:fs/promises";
import { stdin, stdout, stderr } from "node:process";
import { analyzeLog } from "./analyzer.js";
import { formatResult } from "./formatter.js";

const VERSION = "0.1.0";
const FORMATS = new Set(["text", "markdown", "json"]);

const HELP = `FailLens ${VERSION}

Find the first relevant failure in a CI log.

Usage:
  faillens path/to/build.log
  failing-command 2>&1 | faillens -

Options:
  -f, --format <format>        text, markdown, or json (default: text)
  -c, --context <lines>        lines before and after the failure (default: 2)
  -o, --output <file>          save the report to a file
      --fail-on-detection      return exit code 1 when a failure is found
  -h, --help                   show this help
  -v, --version                show the version

Privacy:
  Processing is local. FailLens does not send the log over the internet.
`;

function parseArguments(args) {
  const options = {
    input: null,
    format: "text",
    context: 2,
    output: null,
    failOnDetection: false,
    help: false,
    version: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "-h" || argument === "--help") options.help = true;
    else if (argument === "-v" || argument === "--version") options.version = true;
    else if (argument === "--fail-on-detection") options.failOnDetection = true;
    else if (argument === "-f" || argument === "--format") options.format = args[++index];
    else if (argument === "-c" || argument === "--context") options.context = Number(args[++index]);
    else if (argument === "-o" || argument === "--output") options.output = args[++index];
    else if (argument === "-") options.input = argument;
    else if (argument.startsWith("-")) throw new Error(`Unknown option: ${argument}`);
    else if (options.input) throw new Error("Provide only one input file.");
    else options.input = argument;
  }

  if (!FORMATS.has(options.format)) {
    throw new Error(`Invalid format: ${options.format}. Use text, markdown, or json.`);
  }
  if (!Number.isInteger(options.context) || options.context < 0 || options.context > 20) {
    throw new Error("Context must be an integer between 0 and 20.");
  }
  return options;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export async function main(args = process.argv.slice(2)) {
  try {
    const options = parseArguments(args);
    if (options.help) {
      stdout.write(HELP);
      return 0;
    }
    if (options.version) {
      stdout.write(`${VERSION}\n`);
      return 0;
    }

    const useStdin = options.input === "-" || (!options.input && !stdin.isTTY);
    if (!options.input && !useStdin) {
      throw new Error("Provide a log file or pipe content through stdin. Use --help for examples.");
    }

    const input = useStdin ? await readStdin() : await readFile(options.input, "utf8");
    const result = analyzeLog(input, { context: options.context });
    const report = formatResult(result, options.format);

    if (options.output) await writeFile(options.output, report, "utf8");
    else stdout.write(report);

    return options.failOnDetection && result.status === "failure" ? 1 : 0;
  } catch (error) {
    stderr.write(`FailLens: ${error.message}\n`);
    return 2;
  }
}
