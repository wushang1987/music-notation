import { useMemo, useState } from "react";
import { resolveGroupById, filterSnippets } from "../services/snippetCatalog";

export const usePaletteState = (groups = []) => {
  const defaultGroupId = groups[0]?.id || null;
  const [activeGroup, setActiveGroup] = useState(defaultGroupId);
  const [pinned, setPinned] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [recentIds, setRecentIds] = useState([]);

  const groupMeta = useMemo(
    () => resolveGroupById(activeGroup) || resolveGroupById(defaultGroupId),
    [activeGroup, defaultGroupId]
  );

  const snippets = useMemo(
    () => filterSnippets(groupMeta?.id, searchValue),
    [groupMeta?.id, searchValue]
  );

  const markRecent = (snippetId) => {
    if (!snippetId) return;
    setRecentIds((prev) => {
      const next = [snippetId, ...prev.filter((id) => id !== snippetId)];
      return next.slice(0, 6);
    });
  };

  return {
    groups,
    activeGroup: groupMeta?.id || defaultGroupId,
    setActiveGroup,
    pinned,
    togglePinned: () => setPinned((prev) => !prev),
    searchValue,
    setSearchValue,
    snippets,
    groupMeta,
    recentIds,
    markRecent,
  };
};
