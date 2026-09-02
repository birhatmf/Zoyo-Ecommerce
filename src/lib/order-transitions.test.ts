import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  ALLOWED_ORDER_TRANSITIONS,
  allowedNextStatuses,
  canTransition,
} from "./order-transitions";

describe("order status transitions", () => {
  it("allows same-status (no-op)", () => {
    assert.equal(canTransition("PENDING", "PENDING"), true);
  });

  it("allows PENDING -> APPROVED and CANCELLED only", () => {
    assert.equal(canTransition("PENDING", "APPROVED"), true);
    assert.equal(canTransition("PENDING", "CANCELLED"), true);
    assert.equal(canTransition("PENDING", "PAID"), false);
    assert.equal(canTransition("PENDING", "COMPLETED"), false);
  });

  it("allows full forward flow", () => {
    assert.equal(canTransition("APPROVED", "IN_PRODUCTION"), true);
    assert.equal(canTransition("IN_PRODUCTION", "READY"), true);
    assert.equal(canTransition("READY", "SHIPPED"), true);
    assert.equal(canTransition("SHIPPED", "COMPLETED"), true);
  });

  it("rejects backward or skipped transitions", () => {
    assert.equal(canTransition("SHIPPED", "READY"), false);
    assert.equal(canTransition("PAID", "PENDING"), false);
    assert.equal(canTransition("COMPLETED", "READY"), false);
    assert.equal(canTransition("CANCELLED", "PENDING"), false);
  });

  it("terminal states have no next", () => {
    assert.deepEqual(allowedNextStatuses("COMPLETED"), []);
    assert.deepEqual(allowedNextStatuses("CANCELLED"), []);
  });

  it("payment pending allows PAID and CANCELLED", () => {
    assert.deepEqual(allowedNextStatuses("PAYMENT_PENDING").sort(), ["CANCELLED", "PAID"]);
  });

  it("every status has a defined transition map", () => {
    for (const status of Object.keys(ALLOWED_ORDER_TRANSITIONS)) {
      assert.ok(Array.isArray(ALLOWED_ORDER_TRANSITIONS[status as keyof typeof ALLOWED_ORDER_TRANSITIONS]));
    }
  });
});
