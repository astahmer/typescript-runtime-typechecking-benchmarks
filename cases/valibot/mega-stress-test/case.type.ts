import type { InferOutput } from "valibot";
import * as v from "valibot";

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

const Node = v.object({
	id: v.string(),
	type: v.picklist(["leaf", "branch", "root"]),
	value: v.union([v.string(), v.number(), v.boolean()]),
	metadata: v.object({
		tags: v.array(v.string()),
		score: v.pipe(v.number(), v.minValue(0)),
		nested: v.object({
			level: v.pipe(v.number(), v.integer()),
			data: v.array(v.string()),
		}),
	}),
	children: v.optional(
		v.array(
			v.lazy((): v.GenericSchema<NodeT> => Node as v.GenericSchema<NodeT>),
		),
	),
	refs: v.optional(
		v.array(
			v.lazy((): v.GenericSchema<NodeT> => Node as v.GenericSchema<NodeT>),
		),
	),
});

// ...existing code...
// (The rest of the schemas and types from the bench body would be included here, following the same extraction logic.)
