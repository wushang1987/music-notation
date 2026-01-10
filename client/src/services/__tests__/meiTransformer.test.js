import { describe, it, expect } from "vitest";
import { insertSnippetIntoMei } from "../meiTransformer";

const BASE_MEI = `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0">
  <music>
    <body>
      <mdiv>
        <score>
          <section>
            <measure n="1">
              <staff n="1">
                <layer n="1">
                  <note pname="c" oct="4" dur="4"/>
                </layer>
              </staff>
            </measure>
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;

describe("insertSnippetIntoMei", () => {
  it("appends snippet nodes into the first layer", () => {
    const result = insertSnippetIntoMei(BASE_MEI, '<note pname="d" oct="4" dur="4"/>' );
    expect(result.success).toBe(true);
    expect(result.mei).toContain('<note pname="d" oct="4" dur="4"/>');
  });

  it("auto numbers measures when requested", () => {
    const snippet = `<measure>
  <staff n="1">
    <layer n="1">
      <rest dur="1"/>
    </layer>
  </staff>
</measure>`;
    const result = insertSnippetIntoMei(BASE_MEI, snippet, "section", { autoNumber: true });
    expect(result.success).toBe(true);
    expect(result.mei).toMatch(/<measure n="2"/);
  });
});
