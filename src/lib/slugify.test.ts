import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and converts Turkish chars", () => {
    assert.equal(slugify("Çam Masası"), "cam-masasi");
    assert.equal(slugify("Özel Üretim"), "ozel-uretim");
  });

  it("strips non-alphanumeric and collapses separators", () => {
    assert.equal(slugify("  Hello,  World!  "), "hello-world");
  });

  it("handles Latin accents", () => {
    assert.equal(slugify("Café Crème"), "cafe-creme");
    assert.equal(slugify("Mañana Ñandú"), "manana-nandu");
  });

  it("handles empty / edge", () => {
    assert.equal(slugify(""), "");
    assert.equal(slugify("!!!"), "");
  });

  it("keeps digits", () => {
    assert.equal(slugify("Model 2026"), "model-2026");
  });
});
