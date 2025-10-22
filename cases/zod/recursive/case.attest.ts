import { z } from "zod";
import { bench } from "@ark/attest";

type NodeT = { value: string; children?: NodeT[] };
const Node: z.ZodType<NodeT> = z.lazy(() =>
  z.object({
    value: z.string(),
    children: z.array(Node).optional(),
  }),
) as any;
type T = z.infer<typeof Node>;

type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type TR = DeepReadonly<T>;

bench("zod/recursive typecheck", () => {
  return {} as TR;
})
  .mean([0.26, "ns"])
  .types([5, "instantiations"]);
