import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchUserName } from "./fetch-user.ts";

test("fetchUserName: throws on missing user", async () => {
  await assert.rejects(() => fetchUserName(404), /no user/);
});

test("fetchUserName: resolves with the user name, not the id", async () => {
  const result = await fetchUserName(7);
  assert.equal(result, "Ada");
});
