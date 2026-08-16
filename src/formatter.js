function contextLines(result) {
  if (!result.primary) return [];
  return [
    ...result.context.before.map((item) => `  ${item.line} | ${item.text}`),
    `> ${result.primary.line} | ${result.primary.text}`,
    ...result.context.after.map((item) => `  ${item.line} | ${item.text}`),
  ];
}

export function formatText(result) {
  if (!result.primary) {
    return [
      "FailLens",
      "Status: INCONCLUSIVE",
      result.summary,
      `Lines analyzed: ${result.stats.totalLines}`,
    ].join("\n");
  }

  return [
    "FailLens",
    "Status: FAILURE FOUND",
    `Category: ${result.primary.category}`,
    `Confidence: ${result.primary.confidence}`,
    `Fingerprint: ${result.primary.fingerprint}`,
    "",
    `Likely cause — line ${result.primary.line}`,
    result.primary.text,
    "",
    "Context",
    ...contextLines(result),
  ].join("\n");
}

export function formatMarkdown(result) {
  if (!result.primary) {
    return [
      "## FailLens: inconclusive analysis",
      "",
      result.summary,
      "",
      `- Lines analyzed: ${result.stats.totalLines}`,
      `- Lines ignored as noise: ${result.stats.noiseLines}`,
    ].join("\n");
  }

  return [
    "## FailLens: first relevant failure",
    "",
    `**${result.primary.text}**`,
    "",
    `- Line: ${result.primary.line}`,
    `- Category: ${result.primary.category}`,
    `- Confidence: ${result.primary.confidence}`,
    `- Fingerprint: \`${result.primary.fingerprint}\``,
    "",
    "<details><summary>Log context</summary>",
    "",
    "```text",
    ...contextLines(result),
    "```",
    "</details>",
  ].join("\n");
}

export function formatResult(result, format = "text") {
  if (format === "json") return `${JSON.stringify(result, null, 2)}\n`;
  if (format === "markdown") return `${formatMarkdown(result)}\n`;
  return `${formatText(result)}\n`;
}
