import { z } from "zod";
import { bench } from "@ark/attest";

bench("zod/simple-object-S typecheck", () => {
  const User = z.object({
    id: z.string(),
    email: z.string().email(),
    age: z.number().int().min(0).max(120),
    roles: z.array(z.enum(["user", "admin"])),
  });

  type UserT = z.infer<typeof User>;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type UserReadonly = DeepReadonly<UserT>;

  return {} as UserReadonly;
})
  .mean([88.74, "us"])
  .types([1033, "instantiations"]);
