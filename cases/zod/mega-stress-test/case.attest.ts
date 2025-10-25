import { bench } from "@ark/attest";
import { z } from "zod";

bench("zod/mega-stress-test typecheck", () => {
	// Deep recursive tree structure with unions
	type NodeT = {
		id: string;
		type: "leaf" | "branch" | "root";
		value: string | number | boolean;
		metadata: {
			tags: string[];
			score: number;
			nested: {
				level: number;
				data: string[];
			};
		};
		children?: NodeT[];
		refs?: NodeT[];
	};

	const Node: z.ZodType<NodeT> = z.object({
		id: z.string(),
		type: z.enum(["leaf", "branch", "root"]),
		value: z.union([z.string(), z.number(), z.boolean()]),
		metadata: z.object({
			tags: z.array(z.string()),
			score: z.number().min(0),
			nested: z.object({
				level: z.number().int(),
				data: z.array(z.string()),
			}),
		}),
		children: z
			.array(z.lazy((): z.ZodType<NodeT> => Node as z.ZodType<NodeT>))
			.optional(),
		refs: z
			.array(z.lazy((): z.ZodType<NodeT> => Node as z.ZodType<NodeT>))
			.optional(),
	});

	// Complex discriminated union with heavy nesting
	const EventA = z.object({
		kind: z.literal("a"),
		payload: z.object({
			data: z.array(
				z.object({
					id: z.string(),
					values: z.array(z.union([z.string(), z.number()])),
					nested: z.object({
						deep: z.array(
							z.object({
								x: z.number(),
								y: z.string(),
								z: z.tuple([z.number(), z.string(), z.boolean()]),
							}),
						),
					}),
				}),
			),
		}),
	});

	const EventB = z.object({
		kind: z.literal("b"),
		payload: z.object({
			items: z.array(
				z.union([
					z.object({ type: z.literal("x"), val: z.string() }),
					z.object({ type: z.literal("y"), val: z.number() }),
					z.object({ type: z.literal("z"), val: z.boolean() }),
				]),
			),
			meta: z.object({
				records: z.array(
					z.object({
						key: z.string(),
						data: z.union([
							z.array(z.tuple([z.string(), z.number()])),
							z.object({ nested: z.array(z.string()) }),
						]),
					}),
				),
			}),
		}),
	});

	const EventC = z.object({
		kind: z.literal("c"),
		tree: Node,
		relations: z.array(
			z.object({
				from: z.string(),
				to: z.string(),
				type: z.enum(["parent", "child", "sibling", "ref"]),
				metadata: z.array(
					z.tuple([z.string(), z.union([z.string(), z.number(), z.boolean()])]),
				),
			}),
		),
	});

	// Massive object with heavy union usage
	const MegaStress = z.object({
		// Tree structure
		rootNode: Node,
		allNodes: z.array(Node),

		// Events
		events: z.array(z.union([EventA, EventB, EventC])),

		// Deep nested maps
		config: z.object({
			level1: z.object({
				level2: z.object({
					level3: z.object({
						level4: z.object({
							level5: z.object({
								settings: z.array(
									z.object({
										key: z.string(),
										value: z.union([
											z.string(),
											z.number(),
											z.boolean(),
											z.array(z.string()),
										]),
									}),
								),
							}),
						}),
					}),
				}),
			}),
		}),

		// Complex matrix structure
		matrix: z.array(
			z.array(
				z.array(
					z.union([
						z.number(),
						z.string(),
						z.object({
							cell: z.union([
								z.tuple([z.number(), z.number()]),
								z.object({ x: z.number(), y: z.number() }),
							]),
						}),
					]),
				),
			),
		),

		// Polymorphic records
		records: z.array(
			z.union([
				z.object({
					recordType: z.literal("type1"),
					data1: z.object({
						items: z.array(z.tuple([z.string(), z.number(), z.boolean()])),
						nested: z.object({
							deep: z.array(z.union([z.string(), z.number()])),
						}),
					}),
				}),
				z.object({
					recordType: z.literal("type2"),
					data2: z.object({
						values: z.array(
							z.object({
								id: z.string(),
								payload: z.union([
									z.string(),
									z.number(),
									z.array(z.tuple([z.string(), z.number()])),
								]),
							}),
						),
					}),
				}),
				z.object({
					recordType: z.literal("type3"),
					data3: z.object({
						tree: Node,
						lookup: z.array(
							z.object({
								key: z.string(),
								refs: z.array(z.string()),
							}),
						),
					}),
				}),
			]),
		),

		// Complex tuple combinations
		tuples: z.array(
			z.union([
				z.tuple([z.string(), z.number()]),
				z.tuple([z.boolean(), z.string(), z.number()]),
				z.tuple([
					z.object({ x: z.number() }),
					z.array(z.string()),
					z.union([z.string(), z.number()]),
				]),
			]),
		),

		// Conditional-like structures
		conditions: z.array(
			z.object({
				if: z.union([
					z.object({ type: z.literal("string"), value: z.string() }),
					z.object({ type: z.literal("number"), value: z.number() }),
					z.object({ type: z.literal("boolean"), value: z.boolean() }),
				]),
				then: z.object({
					action: z.enum(["create", "update", "delete"]),
					payload: z.union([
						z.string(),
						z.number(),
						z.object({ nested: z.array(z.string()) }),
					]),
				}),
				else: z
					.object({
						fallback: z.union([
							z.string(),
							z.array(z.tuple([z.string(), z.number()])),
						]),
					})
					.optional(),
			}),
		),

		// Intersection-like structures
		combined: z.array(
			z.object({
				base: z.object({
					id: z.string(),
					type: z.string(),
				}),
				extended: z.union([
					z.object({
						variant: z.literal("a"),
						extra: z.array(z.string()),
					}),
					z.object({
						variant: z.literal("b"),
						extra: z.array(z.number()),
					}),
				]),
				metadata: z.object({
					tags: z.array(z.string()),
					relations: z.array(
						z.tuple([
							z.string(),
							z.string(),
							z.enum(["one-to-one", "one-to-many", "many-to-many"]),
						]),
					),
				}),
			}),
		),
	});

	type T = z.infer<typeof MegaStress>;

	type DeepReadonly<T> = T extends (...args: any) => any
		? T
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;

	type TR = DeepReadonly<T>;

	return {} as TR;
})
	.mean([1.69, "ms"])
	.types([32455, "instantiations"]);
