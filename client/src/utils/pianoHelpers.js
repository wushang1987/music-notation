const PIANO_SETUP = ["%%score {V1|V2}", "V:V1 clef=treble", "V:V2 clef=bass"];

export const parsePianoAbc = (fullAbc) => {
  if (!fullAbc) return { headers: "", rightHand: "", leftHand: "" };

  const v1Regex = /\[V:V1\]([\s\S]*?)(?=\[V:|$)/;
  const v2Regex = /\[V:V2\]([\s\S]*?)(?=\[V:|$)/;

  const v1Match = fullAbc.match(v1Regex);
  const v2Match = fullAbc.match(v2Regex);

  if (v1Match && v2Match) {
    const firstVIndex = Math.min(v1Match.index, v2Match.index);
    let headers = fullAbc.substring(0, firstVIndex).trim();

    // Clean up headers: remove our auto-inserted piano setup lines to avoid duplication
    PIANO_SETUP.forEach((line) => {
      headers = headers.replace(line, "").trim();
    });
    // Also remove extra newlines created by removal
    headers = headers.replace(/\n{3,}/g, "\n\n");

    let rightHand = v1Match[1];
    // Remove structural newlines added by generatePianoAbc
    if (rightHand.startsWith("\n")) rightHand = rightHand.substring(1);
    if (rightHand.endsWith("\n"))
      rightHand = rightHand.substring(0, rightHand.length - 1);

    let leftHand = v2Match[1];
    // Remove structural newline added by generatePianoAbc
    if (leftHand.startsWith("\n")) leftHand = leftHand.substring(1);

    return {
      headers,
      rightHand,
      leftHand,
    };
  }

  // Fallback for non-split content
  const lines = fullAbc.split(/\r?\n/);
  let headerEndIndex = -1;

  // Find the last K: line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("K:")) {
      headerEndIndex = i;
    }
  }

  if (headerEndIndex !== -1) {
    const headers = lines.slice(0, headerEndIndex + 1).join("\n");
    const body = lines
      .slice(headerEndIndex + 1)
      .join("\n")
      .trim();
    return { headers, rightHand: body, leftHand: "" };
  }

  return { headers: "", rightHand: fullAbc, leftHand: "" };
};

export const generatePianoAbc = (headers, rightHand, leftHand) => {
  const cleanHeaders = headers.trim();
  const setupBlock = PIANO_SETUP.join("\n");
  // Put voice markers on their own lines so multi-line editing works naturally
  const right = rightHand || "";
  const left = leftHand || "";

  return `${cleanHeaders}
${setupBlock}
[V:V1]
${right}
[V:V2]
${left}`;
};
