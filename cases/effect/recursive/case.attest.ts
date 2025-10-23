import { bench } from "@ark/attest";
import * as S from "@effect/schema/Schema";

bench("effect/recursive typecheck", () => {
  type NodeT = {
    value: string;
    children?: readonly NodeT[];
  };

  const Node = S.Struct({
    value: S.String,
    children: S.optional(
      S.Array(S.suspend((): S.Schema<NodeT> => Node as S.Schema<NodeT>)),
    ),
  });

  type T = S.Schema.Type<typeof Node>;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type TR = DeepReadonly<T>;

  return {} as TR;
})
  .mean([19.02, "us"])
  .types([4474, "instantiations"]);
