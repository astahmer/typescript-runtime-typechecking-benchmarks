import { type } from "arktype";
import { bench } from "@ark/attest";

const VariantA = type({
  kind: "'a'",
  x: "number.integer >= 0",
  payload: "(string | number)[]",
  createdAt: "Date",
  tags: "('new'|'hot'|'sale'|'archived')[]",
  flags: { featured: "boolean", rating: "0 <= number <= 5" },
});

const VariantB = type({
  kind: "'b'",
  y: "string",
  extra: "(string|number|boolean)[]",
  createdAt: "Date",
  tags: "('new'|'hot'|'sale'|'archived')[]",
  flags: { featured: "boolean", rating: "0 <= number <= 5" },
});

const VariantC = type({
  kind: "'c'",
  zed: "boolean",
  map: "Record<string, string | number>",
  createdAt: "Date",
  tags: "('new'|'hot'|'sale'|'archived')[]",
  flags: { featured: "boolean", rating: "0 <= number <= 5" },
});

const Union = VariantA.or(VariantB).or(VariantC);

type T = typeof Union.infer;

type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type TR = DeepReadonly<T>;

bench("arktype/unions-intersections typecheck", () => {
  return {} as TR;
})
  .mean([0.29, "ns"])
  .types([199, "instantiations"]);
