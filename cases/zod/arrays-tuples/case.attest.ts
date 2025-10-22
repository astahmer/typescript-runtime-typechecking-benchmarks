import { z } from "zod";
import { bench } from "@ark/attest";

// Schema: array of objects + fixed-length tuple
const Item = z.object({ id: z.string(), qty: z.number().int().min(0) });
const Data = z.object({
  items: z.array(Item),
  pair: z.tuple([z.string(), z.number()]),
});

// Inferred type
type DataT = z.infer<typeof Data>;

// Synthetic usage to force evaluation
type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type DataReadonly = DeepReadonly<DataT>;

bench("zod/arrays-tuples typecheck", () => {
  return {} as DataReadonly;
})
  .mean([0.28, "ns"])
  .types([5, "instantiations"]);
