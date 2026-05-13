import { test, describe } from "node:test";
import assert from "node:assert/strict";

// AC1: each helper must be importable from its own per-helper module
import { slug } from "./string-utils/slug.ts";
import { kebab } from "./string-utils/kebab.ts";
import { camel } from "./string-utils/camel.ts";
import { title } from "./string-utils/title.ts";
// AC2 & AC3: new helpers importable from the barrel re-export
import { snake, pascal } from "./string-utils.ts";

// AC1: per-module imports still work with original behaviour
describe("per-module: slug", () => {
  test("hello world", () => {
    assert.equal(slug("Hello World!"), "hello-world");
  });
});

describe("per-module: kebab", () => {
  test("camelCase", () => {
    assert.equal(kebab("camelCase"), "camel-case");
  });
});

describe("per-module: camel", () => {
  test("kebab-case", () => {
    assert.equal(camel("kebab-case"), "kebabCase");
  });
});

describe("per-module: title", () => {
  test("lower words", () => {
    assert.equal(title("hello world"), "Hello World");
  });
});

// AC2: snake
describe("snake", () => {
  test("empty string", () => {
    assert.equal(snake(""), "");
  });

  test("single word lowercase", () => {
    assert.equal(snake("hello"), "hello");
  });

  test("two words", () => {
    assert.equal(snake("hello world"), "hello_world");
  });

  test("PascalCase / mixed case", () => {
    assert.equal(snake("HelloWorld"), "hello_world");
  });

  test("camelCase input", () => {
    assert.equal(snake("helloWorld"), "hello_world");
  });
});

// AC3: pascal
describe("pascal", () => {
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
    assert.equal(pascal("HELLO WORLD"), "HelloWorld");
  });
});
