import { test } from "node:test";
import assert from "node:assert/strict";
import { slug, kebab, camel, title } from "./string-utils.ts";

test("slug: hello world", () => {
  assert.equal(slug("Hello World!"), "hello-world");
});

test("kebab: camelCase", () => {
  assert.equal(kebab("camelCase"), "camel-case");
});

test("camel: kebab-case", () => {
  assert.equal(camel("kebab-case"), "kebabCase");
});

test("title: lower words", () => {
  assert.equal(title("hello world"), "Hello World");
});
