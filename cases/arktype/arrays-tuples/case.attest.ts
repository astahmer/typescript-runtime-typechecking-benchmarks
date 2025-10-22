import { type } from "arktype";
import { bench } from "@ark/attest";

// Simplified Schema for ArkType: array of strings + object pair
const Data = type({
  items: "string[]",
  pair: { first: "string", second: "number" },
});

// Inferred type
type DataT = typeof Data.infer;

// Synthetic usage to force evaluation
type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type DataReadonly = DeepReadonly<DataT>;

bench("arktype/arrays-tuples typecheck", () => {
  return {} as DataReadonly;
})
  .mean([0.31, "ns"])
  .types([5, "instantiations"]);
