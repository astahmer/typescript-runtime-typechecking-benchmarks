import { z } from "zod";
import { bench } from "@ark/attest";

// Common meta to increase complexity
const Meta = z.object({
  createdAt: z.date(),
  tags: z.array(z.enum(["new", "hot", "sale", "archived"])),
  flags: z.object({ featured: z.boolean(), rating: z.number().min(0).max(5) }),
});

const ABase = z.object({
  kind: z.literal("a"),
  x: z.number().int().min(0),
  payload: z.array(z.tuple([z.string(), z.number()])),
});
const BBase = z.object({
  kind: z.literal("b"),
  y: z.string().min(1),
  extra: z.array(z.union([z.string(), z.number(), z.boolean()])),
});
const CBase = z.object({
  kind: z.literal("c"),
  zed: z.boolean(),
  map: z.array(
    z.object({ k: z.string(), v: z.union([z.number(), z.string()]) }),
  ),
});

const A = z.intersection(ABase, Meta);
const B = z.intersection(BBase, Meta);
const C = z.intersection(CBase, Meta);

const Union = z.union([A, B, C]);

type T = z.infer<typeof Union>;

type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type TR = DeepReadonly<T>;

bench("zod/unions-intersections typecheck", () => {
  return {} as TR;
})
  .mean([0.27, "ns"])
  .types([647, "instantiations"]);
