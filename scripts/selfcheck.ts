// Run: npm run check:logic
import assert from "node:assert/strict";
import { sanitizeConfig } from "../src/lib/typography/config";
import { toCss } from "../src/lib/typography/export";
import { DEFAULT_CONFIG, PRESETS } from "../src/lib/typography/presets";
import { decodeConfig, encodeConfig } from "../src/lib/typography/share";
import { CURATED_FONTS } from "../src/lib/typography/catalog";

// Every preset survives a share round-trip unchanged.
for (const p of PRESETS) assert.deepEqual(decodeConfig(encodeConfig(p.config)), p.config, p.id);

// Garbage and tampered links are rejected or clamped, never trusted.
assert.equal(decodeConfig(null), null);
assert.equal(decodeConfig("not base64!"), null);
assert.equal(decodeConfig(Buffer.from('{"v":2}').toString("base64url")), null);
const hostile = sanitizeConfig(
  {
    heading: { family: 'x"); } body { background: url(evil', size: 9999, weight: 950, align: "diagonal" },
    body: { size: -4, lineHeight: "2", letterSpacing: Infinity },
  },
  DEFAULT_CONFIG,
)!;
assert.equal(hostile.heading.family, DEFAULT_CONFIG.heading.family);
assert.equal(hostile.heading.size, 160);
assert.equal(hostile.heading.weight, DEFAULT_CONFIG.heading.weight);
assert.equal(hostile.heading.align, "left");
assert.equal(hostile.body.size, 12);
assert.equal(hostile.body.lineHeight, DEFAULT_CONFIG.body.lineHeight);

// Preset weights exist in the catalog, or the font request would fail.
for (const p of PRESETS)
  for (const s of [p.config.heading, p.config.body]) {
    const f = CURATED_FONTS.find((c) => c.family === s.family);
    assert.ok(f?.weights.includes(s.weight), `${p.id}: ${s.family} ${s.weight}`);
    assert.equal(f?.category, s.category, `${p.id}: ${s.family} category`);
  }

assert.match(toCss(DEFAULT_CONFIG), /--font-heading: "Fraunces", serif;/);
console.log("selfcheck ok");
