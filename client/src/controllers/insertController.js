import { insertSnippetIntoMei } from "../services/meiTransformer";

export const applySnippetInsert = (meiSource, snippetMeta) => {
  if (!snippetMeta) {
    return { success: false, error: "未找到片段定义" };
  }

  switch (snippetMeta.mode) {
    case "mei":
    default:
      return insertSnippetIntoMei(
        meiSource,
        snippetMeta.code,
        snippetMeta.target,
        snippetMeta.options
      );
  }
};
