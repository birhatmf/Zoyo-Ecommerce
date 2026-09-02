import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { telUrl, whatsappUrl } from "./format";

describe("format helpers", () => {
  it("whatsappUrl strips non-digits and encodes message", () => {
    const url = whatsappUrl("+90 (555) 000-0000", "Merhaba dünya");
    assert.equal(url, "https://wa.me/905550000000?text=Merhaba%20d%C3%BCnya");
  });

  it("telUrl keeps plus and digits only", () => {
    assert.equal(telUrl("+90 (555) 000-0000"), "tel:+905550000000");
  });
});
