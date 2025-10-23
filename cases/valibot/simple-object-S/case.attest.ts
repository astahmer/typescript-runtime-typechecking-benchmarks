import { bench } from "@ark/attest";
import * as v from "valibot";
import type { InferOutput } from "valibot";

bench("valibot/simple-object-S typecheck", () => {
  // Schema
  const User = v.object({
    id: v.string(),
    email: v.pipe(v.string(), v.email()),
    age: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(120)),
    roles: v.array(v.picklist(["user", "admin"])),
  });

  // Inferred type
  type UserT = InferOutput<typeof User>;

  // Synthetic usage to force evaluation
  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type UserReadonly = DeepReadonly<UserT>;

  return {} as UserReadonly;
})
  .mean([4.44, "us"])
  .types([9082, "instantiations"]);
