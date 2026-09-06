import test from "node:test";
import assert from "node:assert/strict";
import { parseOrderRequest } from "../src/order_updates.js";

test("checkout support requests keep the order state needed for guidance", () => {
  const request = parseOrderRequest({ orderId: "order-42", question: "When will it ship?", status: "packed" });
  assert.equal(request.status, "packed");
  assert.equal(request.orderId, "order-42");
});

test("unknown order states are rejected at the request boundary", () => {
  assert.throws(() => parseOrderRequest({ orderId: "order-42", question: "What happened?", status: "lost" }));
});
