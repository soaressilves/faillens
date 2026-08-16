import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyzeLog } from "../src/analyzer.js";

const fixtureDirectory = new URL("./fixtures/", import.meta.url);
const corpus = JSON.parse(
  await readFile(new URL("corpus.json", fixtureDirectory), "utf8"),
);

for (const expectation of corpus) {
  test(`corpus: ${expectation.file}`, async () => {
    const log = await readFile(new URL(expectation.file, fixtureDirectory), "utf8");
    const result = analyzeLog(log, { context: 2 });

    assert.equal(result.status, expectation.status);

    if (expectation.status === "unknown") {
      assert.equal(result.primary, null);
      return;
    }

    assert.equal(result.primary.category, expectation.category);
    assert.equal(result.primary.confidence, expectation.confidence);
    assert.ok(
      result.primary.text.includes(expectation.textIncludes),
      `Expected to find "${expectation.textIncludes}" in "${result.primary.text}"`,
    );
    assert.match(result.primary.fingerprint, /^[a-f0-9]{12}$/);
  });
}

test("every corpus .log file has an expectation", async () => {
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(fixtureDirectory))
    .filter((file) => file.endsWith(".log"))
    .sort();
  const documented = corpus.map((item) => item.file).sort();
  assert.deepEqual(files, documented);
});
