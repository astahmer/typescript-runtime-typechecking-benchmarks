import { bench } from "@ark/attest";
import type { InferOutput } from "valibot";
import * as v from "valibot";

bench("valibot/unions-intersections typecheck", () => {
	// Build meta inline into each variant to avoid uncertain merge APIs
	const baseMeta = {
		createdAt: v.date(),
		tags: v.array(v.picklist(["new", "hot", "sale", "archived"])),
		flags: v.object({ featured: v.boolean(), rating: v.number() }),
	};

	const A = v.object({
		kind: v.literal("a"),
		x: v.pipe(v.number(), v.integer(), v.minValue(0)),
		payload: v.array(v.tuple([v.string(), v.number()])),
		...baseMeta,
	});

	const B = v.object({
		kind: v.literal("b"),
		y: v.string(),
		extra: v.array(v.union([v.string(), v.number(), v.boolean()])),
		...baseMeta,
	});

	const C = v.object({
		kind: v.literal("c"),
		zed: v.boolean(),
		map: v.array(
			v.object({ k: v.string(), v: v.union([v.number(), v.string()]) }),
		),
		...baseMeta,
	});

	const Union = v.union([A, B, C]);

	type T = InferOutput<typeof Union>;

	type DeepReadonly<T> = T extends (...args: any) => any
		? T
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;

	type TR = DeepReadonly<T>;

	return {} as TR;
})
	.mean([10.6, "us"])
	.types([11706, "instantiations"]);
