import { bench } from "@ark/attest";
import { z } from "zod";

bench("zod/unions-intersections typecheck", () => {
	const baseMeta = {
		createdAt: z.date(),
		tags: z.array(z.enum(["new", "hot", "sale", "archived"])),
		flags: z.object({
			featured: z.boolean(),
			rating: z.number(),
		}),
	};

	const A = z.object({
		kind: z.literal("a"),
		x: z.number().int().min(0),
		payload: z.array(z.tuple([z.string(), z.number()])),
		...baseMeta,
	});
	const B = z.object({
		kind: z.literal("b"),
		y: z.string(),
		extra: z.array(z.union([z.string(), z.number(), z.boolean()])),
		...baseMeta,
	});
	const C = z.object({
		kind: z.literal("c"),
		zed: z.boolean(),
		map: z.array(
			z.object({ k: z.string(), v: z.union([z.number(), z.string()]) }),
		),
		...baseMeta,
	});

	const Union = z.union([A, B, C]);

	type T = z.infer<typeof Union>;

	type DeepReadonly<T> = T extends (...args: any) => any
		? T
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;

	type TR = DeepReadonly<T>;

	return {} as TR;
})
	.mean([212.81, "us"])
	.types([2539, "instantiations"]);
