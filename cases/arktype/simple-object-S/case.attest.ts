import { type } from "arktype";
import { bench } from "@ark/attest";

// Schema
const User = type({
  id: "string",
  email: "string.email",
  age: "0 <= number.integer <= 120",
  roles: "('user'|'admin')[]",
});

// Inferred type
// arktype's .infer is the static type
export type UserT = typeof User.infer;

// Synthetic usage to force evaluation
export type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type UserReadonly = DeepReadonly<UserT>;

bench("arktype/simple-object-S typecheck", () => {
  return {} as UserReadonly;
}).types([5, "instantiations"]);
