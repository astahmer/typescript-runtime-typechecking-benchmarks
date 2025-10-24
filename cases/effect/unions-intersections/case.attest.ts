import { bench } from "@ark/attest";
import * as S from "effect/Schema";

bench("effect/unions-intersections typecheck", () => {
  // Build meta inline into each variant to avoid uncertain merge APIs
  const baseMeta = {
    createdAt: S.Date,
    tags: S.Array(S.Literal("new", "hot", "sale", "archived")),
    flags: S.Struct({ featured: S.Boolean, rating: S.Number }),
  };

  const A = S.Struct({
    kind: S.Literal("a"),
    x: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
    payload: S.Array(S.Tuple(S.String, S.Number)),
    ...baseMeta,
  });

  const B = S.Struct({
    kind: S.Literal("b"),
    y: S.String,
    extra: S.Array(S.Union(S.String, S.Number, S.Boolean)),
    ...baseMeta,
  });

  const C = S.Struct({
    kind: S.Literal("c"),
    zed: S.Boolean,
    map: S.Array(S.Struct({ k: S.String, v: S.Union(S.Number, S.String) })),
    ...baseMeta,
  });

  const Union = S.Union(A, B, C);

  type T = S.Schema.Type<typeof Union>;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type TR = DeepReadonly<T>;

  return {} as TR;
})
  .mean([109.06, "us"])
  .types([12330, "instantiations"]);
