import { scope } from "arktype";
import { bench } from "@ark/attest";

bench("arktype/recursive typecheck", () => {
  // Recursive using scope alias reference
  const types = scope({
    Node: {
      value: "string",
      "children?": "Node[]",
    },
  }).export();

  type T = typeof types.Node.infer;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type TR = DeepReadonly<T>;

  return {} as TR;
})
  .mean([1.31, "ms"])
  .types([7913, "instantiations"]);
