import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { slug, kebab, camel, title, snake, pascal } from "./string-utils/index.ts";

describe("barrel re-exports (AC1)", () => {
  test("slug via barrel", () => {
    assert.equal(slug("Hello World!"), "hello-world");
  });

  test("kebab via barrel", () => {
    assert.equal(kebab("camelCase"), "camel-case");
  });

  test("camel via barrel", () => {
    assert.equal(camel("kebab-case"), "kebabCase");
  });

  test("title via barrel", () => {
    assert.equal(title("hello world"), "Hello World");
  });
});

describe("snake (AC2)", () => {
  test("empty string", () => {
    assert.equal(snake(""), "");
  });

  test("single lowercase word", () => {
    assert.equal(snake("hello"), "hello");
  });

  test("two words", () => {
    assert.equal(snake("hello world"), "hello_world");
  });

  test("PascalCase input", () => {
    assert.equal(snake("HelloWorld"), "hello_world");
  });

  test("camelCase input", () => {
    assert.equal(snake("helloWorld"), "hello_world");
  });
});

describe("pascal (AC3)", () => {
  test("empty string", () => {
    assert.equal(pascal(""), "");
  });

  test("single word", () => {
    assert.equal(pascal("hello"), "Hello");
  });

  test("two words", () => {
    assert.equal(pascal("hello world"), "HelloWorld");
  });

  test("mixed case input", () => {
    assert.equal(pascal("hELLO wORLD"), "HelloWorld");
  });
});
