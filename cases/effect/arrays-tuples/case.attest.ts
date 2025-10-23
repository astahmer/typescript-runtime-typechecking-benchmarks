import { bench } from "@ark/attest";
import * as S from "@effect/schema/Schema";

bench("effect/arrays-tuples typecheck", () => {
  // Schema: array of objects + fixed-length tuple
  const Item = S.Struct({
    id: S.String,
    qty: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(0)),
  });
  const Data = S.Struct({
    items: S.Array(Item),
    pair: S.Tuple(S.String, S.Number),
  });

  // Inferred type
  type DataT = S.Schema.Type<typeof Data>;

  // Synthetic usage to force evaluation
  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type DataReadonly = DeepReadonly<DataT>;

  return {} as DataReadonly;
})
  .mean([34.51, "us"])
  .types([6391, "instantiations"]);
