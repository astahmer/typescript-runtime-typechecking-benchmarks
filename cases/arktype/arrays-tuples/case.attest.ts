import { type } from "arktype";
import { bench } from "@ark/attest";

bench("arktype/arrays-tuples typecheck", () => {
  // Schema: array of objects + fixed-length tuple
  const Item = type({
    id: "string",
    qty: "number.integer >= 0",
  });
  const Data = type({
    items: Item.array(),
    pair: ["string", "number"],
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

  return {} as DataReadonly;
})
  .mean([89.9, "us"])
  .types([10136, "instantiations"]);
