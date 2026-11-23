import { GENERIC_FAMILY } from "./config";
import { stylesheetUrl } from "./fontUrl";
import type { TypeConfig, TypeStyle } from "./types";

const em = (n: number) => (n === 0 ? "0" : `${n}em`);

const vars = (prefix: string, s: TypeStyle) =>
  [
    `  --${prefix}-weight: ${s.weight};`,
    `  --${prefix}-size: ${s.size}px;`,
    `  --${prefix}-line-height: ${s.lineHeight};`,
    `  --${prefix}-letter-spacing: ${em(s.letterSpacing)};`,
  ];

const rule = (selector: string, prefix: string, s: TypeStyle) =>
  [
    `${selector} {`,
    `  font-family: var(--font-${prefix});`,
    `  font-weight: var(--${prefix}-weight);`,
    `  font-size: var(--${prefix}-size);`,
    `  line-height: var(--${prefix}-line-height);`,
    `  letter-spacing: var(--${prefix}-letter-spacing);`,
    ...(s.align !== "left" ? [`  text-align: ${s.align};`] : []),
    ...(s.transform !== "none" ? [`  text-transform: ${s.transform};`] : []),
    `}`,
  ].join("\n");

export function toCss(config: TypeConfig): string {
  const { heading: h, body: b } = config;
  return [
    `@import url("${stylesheetUrl([h, b])}");`,
    ``,
    `:root {`,
    `  --font-heading: "${h.family}", ${GENERIC_FAMILY[h.category]};`,
    `  --font-body: "${b.family}", ${GENERIC_FAMILY[b.category]};`,
    ``,
    ...vars("heading", h),
    ``,
    ...vars("body", b),
    `}`,
    ``,
    rule("h1, h2, h3", "heading", h),
    ``,
    rule("body", "body", b),
    ``,
  ].join("\n");
}

export function toJson(config: TypeConfig, name?: string): string {
  return JSON.stringify(
    { $schema: "typeset/v1", ...(name ? { name } : {}), heading: config.heading, body: config.body },
    null,
    2,
  );
}
