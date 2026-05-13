import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchUserName } from "./fetch-user.ts";

test("fetchUserName: throws on missing user", async () => {
  await assert.rejects(() => fetchUserName(404), /no user/);
});
