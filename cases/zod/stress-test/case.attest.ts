import { z } from "zod";
import { bench } from "@ark/attest";

// Large hand-written schema to stress the typechecker
const Big = z.object({
  n0: z.number().min(0).max(1_000_000),
  n1: z.number().min(0).max(1_000_000),
  n2: z.number().min(0).max(1_000_000),
  n3: z.number().min(0).max(1_000_000),
  n4: z.number().min(0).max(1_000_000),
  n5: z.number().min(0).max(1_000_000),
  n6: z.number().min(0).max(1_000_000),
  n7: z.number().min(0).max(1_000_000),
  n8: z.number().min(0).max(1_000_000),
  n9: z.number().min(0).max(1_000_000),
  n10: z.number().min(0).max(1_000_000),
  n11: z.number().min(0).max(1_000_000),
  n12: z.number().min(0).max(1_000_000),
  n13: z.number().min(0).max(1_000_000),
  n14: z.number().min(0).max(1_000_000),
  n15: z.number().min(0).max(1_000_000),
  n16: z.number().min(0).max(1_000_000),
  n17: z.number().min(0).max(1_000_000),
  n18: z.number().min(0).max(1_000_000),
  n19: z.number().min(0).max(1_000_000),
  n20: z.number().min(0).max(1_000_000),
  n21: z.number().min(0).max(1_000_000),
  n22: z.number().min(0).max(1_000_000),
  n23: z.number().min(0).max(1_000_000),
  n24: z.number().min(0).max(1_000_000),
  n25: z.number().min(0).max(1_000_000),
  n26: z.number().min(0).max(1_000_000),
  n27: z.number().min(0).max(1_000_000),
  n28: z.number().min(0).max(1_000_000),
  n29: z.number().min(0).max(1_000_000),
  s0: z.string().min(1).max(200),
  s1: z.string().min(1).max(200),
  s2: z.string().min(1).max(200),
  s3: z.string().min(1).max(200),
  s4: z.string().min(1).max(200),
  s5: z.string().min(1).max(200),
  s6: z.string().min(1).max(200),
  s7: z.string().min(1).max(200),
  s8: z.string().min(1).max(200),
  s9: z.string().min(1).max(200),
  s10: z.string().min(1).max(200),
  s11: z.string().min(1).max(200),
  s12: z.string().min(1).max(200),
  s13: z.string().min(1).max(200),
  s14: z.string().min(1).max(200),
  s15: z.string().min(1).max(200),
  s16: z.string().min(1).max(200),
  s17: z.string().min(1).max(200),
  s18: z.string().min(1).max(200),
  s19: z.string().min(1).max(200),
  s20: z.string().min(1).max(200),
  s21: z.string().min(1).max(200),
  s22: z.string().min(1).max(200),
  s23: z.string().min(1).max(200),
  s24: z.string().min(1).max(200),
  s25: z.string().min(1).max(200),
  s26: z.string().min(1).max(200),
  s27: z.string().min(1).max(200),
  s28: z.string().min(1).max(200),
  s29: z.string().min(1).max(200),
  u0: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u1: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u2: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u3: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u4: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u5: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u6: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u7: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u8: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u9: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u10: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u11: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u12: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u13: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u14: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u15: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u16: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u17: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u18: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  u19: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.tuple([z.string(), z.number()])),
  ]),
  nested0: z.object({
    id: z.string(),
    data: z.array(
      z.object({
        a: z.string(),
        b: z.number(),
        c: z.union([z.literal("x"), z.literal("y"), z.literal("z")]),
      }),
    ),
    meta: z.object({
      tags: z.array(z.string()),
      flags: z.record(z.string(), z.boolean()),
    }),
  }),
  nested1: z.object({
    id: z.string(),
    data: z.array(
      z.object({
        a: z.string(),
        b: z.number(),
        c: z.union([z.literal("x"), z.literal("y"), z.literal("z")]),
      }),
    ),
    meta: z.object({
      tags: z.array(z.string()),
      flags: z.record(z.string(), z.boolean()),
    }),
  }),
  nested2: z.object({
    id: z.string(),
    data: z.array(
      z.object({
        a: z.string(),
        b: z.number(),
        c: z.union([z.literal("x"), z.literal("y"), z.literal("z")]),
      }),
    ),
    meta: z.object({
      tags: z.array(z.string()),
      flags: z.record(z.string(), z.boolean()),
    }),
  }),
  nested3: z.object({
    id: z.string(),
    data: z.array(
      z.object({
        a: z.string(),
        b: z.number(),
        c: z.union([z.literal("x"), z.literal("y"), z.literal("z")]),
      }),
    ),
    meta: z.object({
      tags: z.array(z.string()),
      flags: z.record(z.string(), z.boolean()),
    }),
  }),
  nested4: z.object({
    id: z.string(),
    data: z.array(
      z.object({
        a: z.string(),
        b: z.number(),
        c: z.union([z.literal("x"), z.literal("y"), z.literal("z")]),
      }),
    ),
    meta: z.object({
      tags: z.array(z.string()),
      flags: z.record(z.string(), z.boolean()),
    }),
  }),
  nested5: z.object({
    id: z.string(),
    data: z.array(
      z.object({
        a: z.string(),
        b: z.number(),
        c: z.union([z.literal("x"), z.literal("y"), z.literal("z")]),
      }),
    ),
    meta: z.object({
      tags: z.array(z.string()),
      flags: z.record(z.string(), z.boolean()),
    }),
  }),
  nested6: z.object({
    id: z.string(),
    data: z.array(
      z.object({
        a: z.string(),
        b: z.number(),
        c: z.union([z.literal("x"), z.literal("y"), z.literal("z")]),
      }),
    ),
    meta: z.object({
      tags: z.array(z.string()),
      flags: z.record(z.string(), z.boolean()),
    }),
  }),
  nested7: z.object({
    id: z.string(),
    data: z.array(
      z.object({
        a: z.string(),
        b: z.number(),
        c: z.union([z.literal("x"), z.literal("y"), z.literal("z")]),
      }),
    ),
    meta: z.object({
      tags: z.array(z.string()),
      flags: z.record(z.string(), z.boolean()),
    }),
  }),
});

type T = z.infer<typeof Big>;

type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type TR = DeepReadonly<T>;

bench("zod/stress-test typecheck", () => {
  return {} as TR;
})
  .mean([0.29, "ns"])
  .types([5, "instantiations"]);
