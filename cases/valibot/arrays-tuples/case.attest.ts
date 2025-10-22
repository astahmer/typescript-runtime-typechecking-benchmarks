import {
  object,
  string,
  number,
  array,
  tuple,
  integer,
  minValue,
  pipe,
  InferOutput,
} from "valibot";
import { bench } from "@ark/attest";

// Schema: array of objects + fixed-length tuple
const Item = object({
  id: string(),
  qty: pipe(number(), integer(), minValue(0)),
});
const Data = object({
  items: array(Item),
  pair: tuple([string(), number()]),
});

// Inferred type
type DataT = InferOutput<typeof Data>;

// Synthetic usage to force evaluation
type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type DataReadonly = DeepReadonly<DataT>;

bench("valibot/arrays-tuples typecheck", () => {
  return {} as DataReadonly;
})
  .mean([0.28, "ns"])
  .types([5, "instantiations"]);
