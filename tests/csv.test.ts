import test from "node:test";
import assert from "node:assert/strict";
import { csvCell } from "../src/lib/csv.ts";

// ---------------------------------------------------------------------------
// CSV formula-injection escaping — tests the REAL csvCell (src/lib/csv.ts),
// the single source consumed by src/app/api/export/route.ts.
//
// Cells starting with = + - @ tab or CR must be neutralised by prefixing a
// single quote so spreadsheets do not execute them as formulas.
// ---------------------------------------------------------------------------

test("csv: a normal cell passes through unchanged", () => {
  assert.equal(csvCell("Bitcoin"), "Bitcoin");
  assert.equal(csvCell("BTC"), "BTC");
  assert.equal(csvCell(42), "42");
});

test("csv: null/undefined become empty string", () => {
  assert.equal(csvCell(null), "");
  assert.equal(csvCell(undefined), "");
});

for (const dangerous of [
  "=cmd|'/c calc'!A1",
  "+1+1",
  "-2+3",
  "@SUM(A1)",
  "\tleadingtab",
  "\rleadingCR",
]) {
  test(`csv ABUSE: formula cell ${JSON.stringify(dangerous)} is neutralised`, () => {
    const out = csvCell(dangerous);
    // Must carry a leading single quote so spreadsheets treat it as text.
    // (CR/comma cells get RFC-quoted too, so the ' may sit just inside a ").
    const neutralised = out.startsWith("'") || out.startsWith('"\'');
    assert.ok(neutralised, `expected neutralising quote, got ${JSON.stringify(out)}`);
    // And the original dangerous first char must no longer lead the raw value.
    assert.ok(
      !out.startsWith(dangerous[0]),
      `dangerous char still leads: ${JSON.stringify(out)}`
    );
  });
}

test("csv: a cell containing comma/quote/newline is RFC-quoted", () => {
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('he said "hi"'), '"he said ""hi"""');
  assert.equal(csvCell("line1\nline2"), '"line1\nline2"');
});

test("csv: a leading '=' that also has a comma is both neutralised AND quoted", () => {
  const out = csvCell("=HYPERLINK(),evil");
  assert.ok(out.startsWith('"\'='), `expected quoted+neutralised, got ${JSON.stringify(out)}`);
});
