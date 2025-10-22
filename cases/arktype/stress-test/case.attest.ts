import { type } from "arktype";
import { bench } from "@ark/attest";

const Big = type({
  n0: "number >= 0",
  n1: "number >= 0",
  n2: "number >= 0",
  n3: "number >= 0",
  n4: "number >= 0",
  n5: "number >= 0",
  n6: "number >= 0",
  n7: "number >= 0",
  n8: "number >= 0",
  n9: "number >= 0",
  n10: "number >= 0",
  n11: "number >= 0",
  n12: "number >= 0",
  n13: "number >= 0",
  n14: "number >= 0",
  n15: "number >= 0",
  n16: "number >= 0",
  n17: "number >= 0",
  n18: "number >= 0",
  n19: "number >= 0",
  n20: "number >= 0",
  n21: "number >= 0",
  n22: "number >= 0",
  n23: "number >= 0",
  n24: "number >= 0",
  n25: "number >= 0",
  n26: "number >= 0",
  n27: "number >= 0",
  n28: "number >= 0",
  n29: "number >= 0",
  s0: "string",
  s1: "string",
  s2: "string",
  s3: "string",
  s4: "string",
  s5: "string",
  s6: "string",
  s7: "string",
  s8: "string",
  s9: "string",
  s10: "string",
  s11: "string",
  s12: "string",
  s13: "string",
  s14: "string",
  s15: "string",
  s16: "string",
  s17: "string",
  s18: "string",
  s19: "string",
  s20: "string",
  s21: "string",
  s22: "string",
  s23: "string",
  s24: "string",
  s25: "string",
  s26: "string",
  s27: "string",
  s28: "string",
  s29: "string",
  u0: "string | number | boolean",
  u1: "string | number | boolean",
  u2: "string | number | boolean",
  u3: "string | number | boolean",
  u4: "string | number | boolean",
  u5: "string | number | boolean",
  u6: "string | number | boolean",
  u7: "string | number | boolean",
  u8: "string | number | boolean",
  u9: "string | number | boolean",
  u10: "string | number | boolean",
  u11: "string | number | boolean",
  u12: "string | number | boolean",
  u13: "string | number | boolean",
  u14: "string | number | boolean",
  u15: "string | number | boolean",
  u16: "string | number | boolean",
  u17: "string | number | boolean",
  u18: "string | number | boolean",
  u19: "string | number | boolean",
  nested0: {
    id: "string",
    data: "(string | number)[]",
    meta: { tags: "string[]", count: "number" },
  },
  nested1: {
    id: "string",
    data: "(string | number)[]",
    meta: { tags: "string[]", count: "number" },
  },
  nested2: {
    id: "string",
    data: "(string | number)[]",
    meta: { tags: "string[]", count: "number" },
  },
  nested3: {
    id: "string",
    data: "(string | number)[]",
    meta: { tags: "string[]", count: "number" },
  },
  nested4: {
    id: "string",
    data: "(string | number)[]",
    meta: { tags: "string[]", count: "number" },
  },
  nested5: {
    id: "string",
    data: "(string | number)[]",
    meta: { tags: "string[]", count: "number" },
  },
  nested6: {
    id: "string",
    data: "(string | number)[]",
    meta: { tags: "string[]", count: "number" },
  },
  nested7: {
    id: "string",
    data: "(string | number)[]",
    meta: { tags: "string[]", count: "number" },
  },
});

type T = typeof Big.infer;

type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type TR = DeepReadonly<T>;

bench("arktype/stress-test typecheck", () => {
  return {} as TR;
})
  .mean([0.3, "ns"])
  .types([5, "instantiations"]);
