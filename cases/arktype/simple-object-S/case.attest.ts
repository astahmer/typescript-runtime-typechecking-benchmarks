import { type } from "arktype";
import { bench } from "@ark/attest";

bench("arktype/simple-object-S typecheck", () => {
  // Schema
  const User = type({
    id: "string",
    email: "string.email",
    age: "0 <= number.integer <= 120",
    roles: "('user'|'admin')[]",
  });

  // Inferred type
  // arktype's .infer is the static type
  type UserT = typeof User.infer;

  // Synthetic usage to force evaluation
  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type UserReadonly = DeepReadonly<UserT>;

  return {} as UserReadonly;
})
  .mean([33.19, "us"])
  .types([10469, "instantiations"]);
