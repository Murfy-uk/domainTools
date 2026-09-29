import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  extractDomains,
  isValidDomain,
} from "../public/extractDomains.js";

test("dedupes across newline and space separators", () => {
  assert.deepEqual(extractDomains("foo.com\nfoo.com bar.com\tfoo.com"), [
    "foo.com",
    "bar.com",
  ]);
});

test("is case-insensitive and returns lowercase", () => {
  assert.deepEqual(extractDomains("EXAMPLE.COM Example.com example.com"), [
    "example.com",
  ]);
});

test("excludes dan.com by default, in any case", () => {
  assert.deepEqual(extractDomains("dan.com DAN.COM keep.com"), ["keep.com"]);
});

test("custom exclude list is case-insensitive", () => {
  assert.deepEqual(
    extractDomains("a.com b.com", { exclude: ["B.COM"] }),
    ["a.com"]
  );
});

test("pulls domains out of URLs and strips scheme and www", () => {
  assert.deepEqual(
    extractDomains(
      "Visit https://www.site.io/path/page.html?q=1 or http://shop.net"
    ),
    ["site.io", "shop.net"]
  );
});

test("handles commas, parentheses and trailing punctuation", () => {
  assert.deepEqual(
    extractDomains("a.com,b.com, (c.net) end with shop.co.uk. Also d.org;"),
    ["a.com", "b.com", "c.net", "shop.co.uk", "d.org"]
  );
});

test("supports multi-part and long TLDs", () => {
  assert.deepEqual(extractDomains("amazon.co.uk ebay.de cool.photography"), [
    "amazon.co.uk",
    "ebay.de",
    "cool.photography",
  ]);
});

test("ignores email addresses", () => {
  assert.deepEqual(extractDomains("john@gmail.com real.com"), ["real.com"]);
});

test("ignores IPs, version numbers and abbreviations", () => {
  assert.deepEqual(extractDomains("192.168.0.1 v1.2.3 1.2 e.g. i.e. ok.io"), [
    "ok.io",
  ]);
});

test("rejects labels with leading or trailing hyphens", () => {
  assert.deepEqual(extractDomains("-bad.com bad-.com good-name.com"), [
    "good-name.com",
  ]);
});

test("returns an empty array for empty input", () => {
  assert.deepEqual(extractDomains(""), []);
});

test("handles the sample input file", () => {
  const text = readFileSync(
    new URL("./sample-input.txt", import.meta.url),
    "utf8"
  );
  const domains = extractDomains(text);
  assert.ok(domains.includes("amazon.co.uk"));
  assert.ok(domains.includes("google.com"));
  assert.equal(new Set(domains).size, domains.length);
  assert.ok(domains.every(isValidDomain));
});

test("isValidDomain", () => {
  assert.equal(isValidDomain("ok.com"), true);
  assert.equal(isValidDomain("a.b.co.uk"), true);
  assert.equal(isValidDomain("<script>"), false);
  assert.equal(isValidDomain("no-tld"), false);
  assert.equal(isValidDomain("OK.COM"), false);
  assert.equal(isValidDomain(42), false);
});
