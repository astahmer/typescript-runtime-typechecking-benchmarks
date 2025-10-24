import { z } from "zod";
import { bench } from "@ark/attest";

bench("zod/arrays-tuples typecheck", () => {
  const Item = z.object({ id: z.string(), qty: z.number().int().min(0) });
  const Data = z.object({
    items: z.array(Item),
    pair: z.tuple([z.string(), z.number()]),
  });

  type DataT = z.infer<typeof Data>;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type DataReadonly = DeepReadonly<DataT>;

  return {} as DataReadonly;
})
  .mean([66.71, "us"])
  .types([682, "instantiations"]);
