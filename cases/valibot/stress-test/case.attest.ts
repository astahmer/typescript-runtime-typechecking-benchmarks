import { bench } from "@ark/attest";
import * as v from "valibot";
import type { InferOutput } from "valibot";

bench("valibot/stress-test typecheck", () => {
  const Big = v.object({
    n0: v.pipe(v.number(), v.minValue(0)),
    n1: v.pipe(v.number(), v.minValue(0)),
    n2: v.pipe(v.number(), v.minValue(0)),
    n3: v.pipe(v.number(), v.minValue(0)),
    n4: v.pipe(v.number(), v.minValue(0)),
    n5: v.pipe(v.number(), v.minValue(0)),
    n6: v.pipe(v.number(), v.minValue(0)),
    n7: v.pipe(v.number(), v.minValue(0)),
    n8: v.pipe(v.number(), v.minValue(0)),
    n9: v.pipe(v.number(), v.minValue(0)),
    n10: v.pipe(v.number(), v.minValue(0)),
    n11: v.pipe(v.number(), v.minValue(0)),
    n12: v.pipe(v.number(), v.minValue(0)),
    n13: v.pipe(v.number(), v.minValue(0)),
    n14: v.pipe(v.number(), v.minValue(0)),
    n15: v.pipe(v.number(), v.minValue(0)),
    n16: v.pipe(v.number(), v.minValue(0)),
    n17: v.pipe(v.number(), v.minValue(0)),
    n18: v.pipe(v.number(), v.minValue(0)),
    n19: v.pipe(v.number(), v.minValue(0)),
    n20: v.pipe(v.number(), v.minValue(0)),
    n21: v.pipe(v.number(), v.minValue(0)),
    n22: v.pipe(v.number(), v.minValue(0)),
    n23: v.pipe(v.number(), v.minValue(0)),
    n24: v.pipe(v.number(), v.minValue(0)),
    n25: v.pipe(v.number(), v.minValue(0)),
    n26: v.pipe(v.number(), v.minValue(0)),
    n27: v.pipe(v.number(), v.minValue(0)),
    n28: v.pipe(v.number(), v.minValue(0)),
    n29: v.pipe(v.number(), v.minValue(0)),
    s0: v.string(),
    s1: v.string(),
    s2: v.string(),
    s3: v.string(),
    s4: v.string(),
    s5: v.string(),
    s6: v.string(),
    s7: v.string(),
    s8: v.string(),
    s9: v.string(),
    s10: v.string(),
    s11: v.string(),
    s12: v.string(),
    s13: v.string(),
    s14: v.string(),
    s15: v.string(),
    s16: v.string(),
    s17: v.string(),
    s18: v.string(),
    s19: v.string(),
    s20: v.string(),
    s21: v.string(),
    s22: v.string(),
    s23: v.string(),
    s24: v.string(),
    s25: v.string(),
    s26: v.string(),
    s27: v.string(),
    s28: v.string(),
    s29: v.string(),
    u0: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u1: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u2: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u3: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u4: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u5: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u6: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u7: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u8: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u9: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u10: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u11: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u12: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u13: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u14: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u15: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u16: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u17: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u18: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    u19: v.union([
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.tuple([v.string(), v.number()])),
    ]),
    nested0: v.object({
      id: v.string(),
      data: v.array(
        v.object({
          a: v.string(),
          b: v.number(),
          c: v.picklist(["x", "y", "z"]),
        }),
      ),
      meta: v.object({ tags: v.array(v.string()), count: v.number() }),
    }),
    nested1: v.object({
      id: v.string(),
      data: v.array(
        v.object({
          a: v.string(),
          b: v.number(),
          c: v.picklist(["x", "y", "z"]),
        }),
      ),
      meta: v.object({ tags: v.array(v.string()), count: v.number() }),
    }),
    nested2: v.object({
      id: v.string(),
      data: v.array(
        v.object({
          a: v.string(),
          b: v.number(),
          c: v.picklist(["x", "y", "z"]),
        }),
      ),
      meta: v.object({ tags: v.array(v.string()), count: v.number() }),
    }),
    nested3: v.object({
      id: v.string(),
      data: v.array(
        v.object({
          a: v.string(),
          b: v.number(),
          c: v.picklist(["x", "y", "z"]),
        }),
      ),
      meta: v.object({ tags: v.array(v.string()), count: v.number() }),
    }),
    nested4: v.object({
      id: v.string(),
      data: v.array(
        v.object({
          a: v.string(),
          b: v.number(),
          c: v.picklist(["x", "y", "z"]),
        }),
      ),
      meta: v.object({ tags: v.array(v.string()), count: v.number() }),
    }),
    nested5: v.object({
      id: v.string(),
      data: v.array(
        v.object({
          a: v.string(),
          b: v.number(),
          c: v.picklist(["x", "y", "z"]),
        }),
      ),
      meta: v.object({ tags: v.array(v.string()), count: v.number() }),
    }),
    nested6: v.object({
      id: v.string(),
      data: v.array(
        v.object({
          a: v.string(),
          b: v.number(),
          c: v.picklist(["x", "y", "z"]),
        }),
      ),
      meta: v.object({ tags: v.array(v.string()), count: v.number() }),
    }),
    nested7: v.object({
      id: v.string(),
      data: v.array(
        v.object({
          a: v.string(),
          b: v.number(),
          c: v.picklist(["x", "y", "z"]),
        }),
      ),
      meta: v.object({ tags: v.array(v.string()), count: v.number() }),
    }),
  });

  type T = InferOutput<typeof Big>;

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  type TR = DeepReadonly<T>;

  return {} as TR;
})
  .mean([124.23, "us"])
  .types([24898, "instantiations"]);
