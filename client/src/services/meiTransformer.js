const TARGET_PATTERNS = {
  layer: /<\/layer>/i,
  section: /<\/section>/i,
  scoreDef: /<\/scoreDef>/i,
};

const countMeasures = (meiSource) => (meiSource.match(/<measure\b/gi) || []).length;

const ensureMeasureNumber = (snippet, measureIndex) =>
  snippet.replace(/<measure\b([^>]*)>/, (match, attrs) => {
    if (/n\s*=/.test(attrs)) return match;
    return `<measure n="${measureIndex}"${attrs}>`;
  });

const formatSnippet = (snippet, indent) =>
  snippet
    .trim()
    .split("\n")
    .map((line) => `${indent}${line.trim()}`)
    .join("\n");

export const insertSnippetIntoMei = (
  meiSource,
  snippetCode,
  target = "layer",
  options = {}
) => {
  if (!meiSource) {
    return { success: false, error: "MEI 内容为空" };
  }
  if (!snippetCode) {
    return { success: false, error: "片段数据为空" };
  }

  const pattern = TARGET_PATTERNS[target] || TARGET_PATTERNS.layer;
  const match = pattern.exec(meiSource);
  if (!match) {
    return { success: false, error: "未找到可插入的目标节点" };
  }

  let snippet = snippetCode.trim();
  if (target === "section" && options.autoNumber) {
    const nextIndex = countMeasures(meiSource) + 1;
    snippet = ensureMeasureNumber(snippet, nextIndex);
  }

  const insertionPoint = match.index;
  const lineStart = meiSource.lastIndexOf("\n", insertionPoint);
  const baseIndent = lineStart >= 0 ? meiSource.slice(lineStart + 1, insertionPoint) : "";
  const snippetIndent = `${baseIndent}  `;
  const formattedSnippet = formatSnippet(snippet, snippetIndent);

  const nextMei =
    meiSource.slice(0, insertionPoint) +
    `\n${formattedSnippet}\n${baseIndent}` +
    meiSource.slice(insertionPoint);

  return {
    success: true,
    mei: nextMei,
    added: formattedSnippet ? formattedSnippet.split("\n").length : 0,
  };
};
