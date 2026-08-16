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
      "Status: INCONCLUSIVO",
      result.summary,
      `Linhas analisadas: ${result.stats.totalLines}`,
    ].join("\n");
  }

  return [
    "FailLens",
    "Status: FALHA ENCONTRADA",
    `Categoria: ${result.primary.category}`,
    `Confiança: ${result.primary.confidence}`,
    `Fingerprint: ${result.primary.fingerprint}`,
    "",
    `Causa provável — linha ${result.primary.line}`,
    result.primary.text,
    "",
    "Contexto",
    ...contextLines(result),
  ].join("\n");
}

export function formatMarkdown(result) {
  if (!result.primary) {
    return [
      "## FailLens: análise inconclusiva",
      "",
      result.summary,
      "",
      `- Linhas analisadas: ${result.stats.totalLines}`,
      `- Linhas ignoradas como ruído: ${result.stats.noiseLines}`,
    ].join("\n");
  }

  return [
    "## FailLens: primeira falha relevante",
    "",
    `**${result.primary.text}**`,
    "",
    `- Linha: ${result.primary.line}`,
    `- Categoria: ${result.primary.category}`,
    `- Confiança: ${result.primary.confidence}`,
    `- Fingerprint: \`${result.primary.fingerprint}\``,
    "",
    "<details><summary>Contexto do log</summary>",
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
