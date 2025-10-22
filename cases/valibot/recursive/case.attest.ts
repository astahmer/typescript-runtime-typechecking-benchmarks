import { bench } from "@ark/attest";
import * as v from "valibot";
import { InferOutput } from "valibot";

type NodeT = {
  value: string;
  children?: NodeT[];
};

const Node: v.GenericSchema<NodeT> = v.object({
  value: v.string(),
  children: v.optional(v.optional(v.array(() => Node))),
});

type T = InferOutput<typeof Node>;

type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type TR = DeepReadonly<T>;

bench("valibot/recursive typecheck", () => {
  return {} as TR;
})
  .mean([0.3, "ns"])
  .types([5, "instantiations"]);
