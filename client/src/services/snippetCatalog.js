export const SNIPPET_GROUPS = [
  {
    id: "structure",
    label: "结构",
    description: "快速搭建乐段骨架与小节",
    snippets: [
      {
        id: "measure-44",
        label: "标准小节",
        caption: "在尾部追加 4/4 小节",
        badge: "4/4",
        icon: "Layout",
        mode: "mei",
        target: "section",
        options: { autoNumber: true },
        keywords: ["bar", "measure", "structure"],
        code: `<measure>
  <staff n="1">
    <layer n="1">
      <note pname="c" oct="4" dur="4"/>
      <note pname="d" oct="4" dur="4"/>
      <note pname="e" oct="4" dur="4"/>
      <note pname="f" oct="4" dur="4"/>
    </layer>
  </staff>
</measure>`
      },
      {
        id: "repeat-closure",
        label: "重复记号",
        caption: "插入含结束重复线的小节",
        badge: "〱",
        icon: "Repeat2",
        mode: "mei",
        target: "section",
        options: { autoNumber: true },
        keywords: ["repeat", "ending"],
        code: `<measure right="repeat" symbol="segno">
  <staff n="1">
    <layer n="1">
      <rest dur="1"/>
    </layer>
  </staff>
</measure>`
      }
    ]
  },
  {
    id: "notes",
    label: "音符",
    description: "常用节奏组合",
    snippets: [
      {
        id: "note-quarter",
        label: "四分音符",
        caption: "中央 C 四分音符",
        badge: "1/4",
        icon: "Music2",
        mode: "mei",
        target: "layer",
        keywords: ["quarter", "note", "c4"],
        code: `<note pname="c" oct="4" dur="4"/>`
      },
      {
        id: "note-eighth-pair",
        label: "八分连音",
        caption: "两个连续八分音符",
        badge: "♪♪",
        icon: "Drumstick",
        mode: "mei",
        target: "layer",
        keywords: ["8th", "pair"],
        code: `<note pname="g" oct="4" dur="8"/>
<note pname="a" oct="4" dur="8"/>`
      },
      {
        id: "note-triad",
        label: "C 和弦",
        caption: "并列写入 C 大三和弦",
        badge: "triad",
        icon: "Piano",
        mode: "mei",
        target: "layer",
        keywords: ["chord", "triad"],
        code: `<chord dur="2">
  <note pname="c" oct="4"/>
  <note pname="e" oct="4"/>
  <note pname="g" oct="4"/>
</chord>`
      }
    ]
  },
  {
    id: "symbols",
    label: "符号",
    description: "休止符与谱号调整",
    snippets: [
      {
        id: "rest-quarter",
        label: "四分休止",
        caption: "在当前层追加休止符",
        badge: "rest",
        icon: "ScrollText",
        mode: "mei",
        target: "layer",
        keywords: ["rest", "silence"],
        code: `<rest dur="4"/>`
      },
      {
        id: "clef-bass",
        label: "低音谱号",
        caption: "切换为 F 谱号",
        badge: "clef",
        icon: "Waves",
        mode: "mei",
        target: "scoreDef",
        keywords: ["clef", "bass"],
        code: `<staffDef n="1" lines="5" clef.shape="F" clef.line="4" key.sig="0" meter.count="4" meter.unit="4"/>`
      }
    ]
  }
];

export const ALL_SNIPPETS = SNIPPET_GROUPS.flatMap((group) =>
  group.snippets.map((snippet) => ({
    ...snippet,
    groupId: group.id,
  }))
);


export const getSnippetById = (snippetId) =>
  ALL_SNIPPETS.find((snippet) => snippet.id === snippetId) || null;

export const resolveGroupById = (groupId) =>
  SNIPPET_GROUPS.find((group) => group.id === groupId) || SNIPPET_GROUPS[0] || null;

export const filterSnippets = (groupId, query = "") => {
  const group = resolveGroupById(groupId);
  if (!group) return [];
  const normalized = query.trim().toLowerCase();
  if (!normalized) return group.snippets;
  return group.snippets.filter((snippet) => {
    const haystack = [
      snippet.label,
      snippet.caption,
      ...(snippet.keywords || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
};
