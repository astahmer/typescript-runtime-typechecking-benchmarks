import { z } from "zod";
import { bench } from "@ark/attest";

// Schema
const User = z.object({
  id: z.string(),
  email: z.string().email(),
  age: z.number().int().min(0).max(120),
  roles: z.array(z.enum(["user", "admin"])),
});

// Inferred type
type UserT = z.infer<typeof User>;

// Synthetic usage to force evaluation
// simple deep readonly
type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

// Instantiate usage
type UserReadonly = DeepReadonly<UserT>;

bench("zod/simple-object-S typecheck", () => {
  // Return a type-only value to drive type instantiation cost
  return {} as UserReadonly;
})
  .mean([0.28, "ns"])
  .types([5, "instantiations"]);
